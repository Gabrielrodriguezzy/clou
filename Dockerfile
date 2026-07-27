# Deploy apenas do backend
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

# Testa import e conexao, depois sobe
CMD python3 -c "
import sys
try:
    from app.main import app
    print('Import OK')
    from app.core.config import settings
    print(f'DB: {settings.DATABASE_URL[:30]}...')
    print(f'ENV: {settings.ENVIRONMENT}')
    print(f'CORS: {settings.CORS_ORIGINS}')
except Exception as e:
    print(f'ERRO: {e}')
    sys.exit(1)
" && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}