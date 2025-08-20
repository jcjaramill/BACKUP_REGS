from fastapi import APIRouter, UploadFile, Form, HTTPException, Depends
from auth.auth import get_current_user
from database import backup_collection
from models import BackupMetadata
from utils.file_ops import calculate_sha256
from datetime import datetime
from pathlib import Path
import traceback
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_FILE_SIZE_MB = 2048
CHUNK_SIZE = 1024 * 1024
BASE_PATH = Path("C:/backups")
EXTENSIONES_PERMITIDAS = [".tib", ".zip", ".csv", ".7z"]

@router.post("/upload-backup")
async def upload_backup(
    file: UploadFile,
    tecnico: str = Form(...),
    linea: str = Form(...),
    maquina: str = Form(...),
    sistema: str = Form(...),
    usuario: dict = Depends(get_current_user)  # ✅ debe ser dict para extraer username
):
    try:
        # Validación de campos
        for campo, valor in {"tecnico": tecnico, "linea": linea, "maquina": maquina, "sistema": sistema}.items():
            if not valor.strip():
                raise ValueError(f"Campo '{campo}' no puede estar vacío.")

        # Validación de nombre de archivo
        if not file.filename or ".." in file.filename or "/" in file.filename:
            raise ValueError("Nombre de archivo inválido.")

        # Validación de extensión
        extension = Path(file.filename).suffix.lower()
        if extension not in EXTENSIONES_PERMITIDAS:
            raise ValueError(f"Extensión no permitida: {extension}. Permitidas: {', '.join(EXTENSIONES_PERMITIDAS)}")

        # Determinar subcarpeta
        destino_map = {"PLC": "plc", "PC-HMI": "hmi"}
        subcarpeta = destino_map.get(sistema, "misc")
        destination = BASE_PATH / subcarpeta
        destination.mkdir(parents=True, exist_ok=True)

        # Generar nombre de archivo
        fecha = datetime.utcnow().strftime("%d%m%y")
        backupname = f"backup_{maquina}_{fecha}{extension}"
        file_path = destination / backupname

        # Escritura por chunks con límite de tamaño
        total_bytes = 0
        with file_path.open("wb") as buffer:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break
                total_bytes += len(chunk)
                if total_bytes > MAX_FILE_SIZE_MB * 1024 * 1024:
                    file_path.unlink(missing_ok=True)
                    raise ValueError("Archivo demasiado grande.")
                buffer.write(chunk)

        if not isinstance(usuario, dict) or "username" not in usuario:
            raise HTTPException(status_code=401, detail="Usuario inválido.")

        username = usuario["username"]  # ✅ extraer solo el string

        # Calcular hash y registrar en MongoDB
        metadata = BackupMetadata(
            filename=file.filename,
            backupname=backupname,
            destination=str(file_path),
            timestamp=datetime.utcnow(),
            tecnico=tecnico,
            sistema=sistema,
            maquina=maquina,
            linea=linea,
            usuario=username,
            size_bytes=total_bytes,
            sha256=calculate_sha256(file_path)
        )

        backup_collection.insert_one(metadata.dict())

        return {
            "message": "✅ Backup registrado en MongoDB",
            "filename": file.filename,
            "backupname": backupname,
            "size_MB": round(total_bytes / (1024 * 1024), 2),
            "sha256": metadata.sha256,
            "usuario": username  # ✅ solo string, no dict
        }

    except ValueError as ve:
        logger.warning(f"[upload-backup] Validación fallida: {str(ve)} | Usuario: {usuario}")
        raise HTTPException(status_code=400, detail=f"Formato no permitido: {str(ve)}")

    except Exception as e:
        tb = traceback.format_exc()
        logger.error(f"[upload-backup] Error inesperado:\n{tb}")
        raise HTTPException(status_code=500, detail=f"Error al procesar el backup: {str(e)}")


@router.get("/backups")
def list_backups(current_user: dict = Depends(get_current_user)):
    backups = list(backup_collection.find({}, {"_id": 0}))
    return backups
