FROM python:3.9-slim

WORKDIR /app

# Instalamos dependencias del sistema (si usas bcrypt u otras librerías compiladas)
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
       gcc \
       libffi-dev \
       libssl-dev \
 && rm -rf /var/lib/apt/lists/*

# Copiamos e instalamos dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos todo el código del backend
COPY . .

# Arrancamos Uvicorn con recarga de código
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
