#!/bin/bash
# Clou - Subir ambiente local
# Uso: ./start-local.sh
set -e

cd "$(dirname "$0")"

echo "=== Clou - Iniciando ambiente local ==="

# 1. Cria .env se não existir
if [ ! -f .env ]; then
    echo "[1/4] Criando .env a partir do .env.example..."
    cp .env.example .env
    # Gera SECRET_KEY automática
    SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/^SECRET_KEY=\$/SECRET_KEY=$SECRET/" .env
    else
        sed -i "s/^SECRET_KEY=\$/SECRET_KEY=$SECRET/" .env
    fi
    echo "  -> SECRET_KEY gerada automaticamente"
else
    echo "[1/4] .env já existe, pulando..."
fi

# 2. Sobe os containers
echo "[2/4] Subindo containers com docker compose..."
docker compose up -d --build

# 3. Aguarda backend ficar pronto
echo "[3/4] Aguardando backend ficar saudável..."
for i in $(seq 1 30); do
    if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
        echo "  -> Backend pronto! (http://localhost:8000)"
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo "  -> AVISO: Backend não respondeu em 30s. Verifique 'docker compose logs backend'"
    else
        sleep 2
    fi
done

# 4. Se for primeira vez, roda seed
echo "[4/4] Verificando se precisa rodar seed..."
docker compose exec backend python seed.py 2>/dev/null && echo "  -> Seed executado!" || echo "  -> Seed já foi ou não necessário."

echo ""
echo "=== Pronto! ==="
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  Docs:     http://localhost:8000/docs"
echo ""
echo "Para parar: docker compose down"