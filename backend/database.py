# backend/database.py

import os
import sys
from pymongo import MongoClient, errors

# 1. Leer configuración (o usar valores por defecto)
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://user_mongo:dobleq3@cluster0.sj5du.mongodb.net/electronica?retryWrites=true&w=majority&authSource=admin"
)
DB_NAME = os.getenv("DB_NAME", "electronica")

# 2. Intentar conexión con timeout corto y validar con ping
try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Este comando lanza excepción si la conexión falla
    mongo_client.admin.command("ping")
    print("✅ Conectado a MongoDB correctamente")
except errors.ServerSelectionTimeoutError as err:
    print(f"❌ No se pudo conectar a MongoDB: {err}")
    sys.exit(1)

# 3. Seleccionar base de datos y colecciones
db = mongo_client[DB_NAME]
usuarios_collection = db["usuarios"]
backup_collection   = db["backups"]
