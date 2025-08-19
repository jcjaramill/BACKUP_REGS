from pydantic import BaseModel
from datetime import datetime

class BackupMetadata(BaseModel):
    filename: str
    backupname: str
    destination: str
    timestamp: datetime
    tecnico: str
    linea: str
    maquina: str
    sistema: str
    size_bytes: int
    sha256: str
    usuario: str

class LoginRequest(BaseModel):
    username: str
    password: str
