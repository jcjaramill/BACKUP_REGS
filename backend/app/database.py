from pymongo import MongoClient

mongo_client = MongoClient("mongodb://localhost:27017")
db = mongo_client.backup_db

usuarios_collection = db.usuarios
backup_collection = db.backups