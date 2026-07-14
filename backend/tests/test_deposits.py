"""Testes de depósitos e webhook."""
import pytest
from httpx import AsyncClient


class TestDeposits:

    @pytest.mark.asyncio
    async def test_criar_deposito_sucesso(self, client: AsyncClient, seed_user, user_token):
        """Criar depósito válido deve retornar dados com QR code."""
        resp = await client.post("/api/deposits", json={
            "amount": 50.0,
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["amount"] == 50.0
        assert data["fee"] == 0.50  # 1% de 50
        assert data["net_amount"] == 49.50
        assert data["payment_method"] == "pix"
        assert data["status"] == "pending"
        assert data["pix_qr_text"]  # deve ter QR text gerado
        assert data["external_id"]  # deve ter external_id

    @pytest.mark.asyncio
    async def test_criar_deposito_valor_minimo(self, client: AsyncClient, seed_user, user_token):
        """Depósito abaixo de R$ 1 deve ser rejeitado."""
        resp = await client.post("/api/deposits", json={
            "amount": 0.50,
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 400
        assert "mínimo" in resp.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_webhook_pix_pago(self, client: AsyncClient, seed_user, user_token):
        """Webhook com status=paid deve creditar saldo."""
        # Criar depósito
        deposit = await client.post("/api/deposits", json={
            "amount": 30.0,
        }, headers={"Authorization": f"Bearer {user_token}"})
        ext_id = deposit.json()["external_id"]

        # Simular webhook de pagamento
        resp = await client.post("/api/deposits/webhook/pix", json={
            "external_id": ext_id,
            "status": "paid",
        })
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

        # Verificar que o saldo foi creditado
        me = await client.get("/api/auth/me", headers={
            "Authorization": f"Bearer {user_token}",
        })
        # seed_user tinha 100 + net_amount (30 - 0.30 = 29.70) = 129.70
        assert me.json()["balance"] == 129.70

    @pytest.mark.asyncio
    async def test_webhook_external_id_invalido(self, client: AsyncClient):
        """Webhook com external_id inexistente retorna 404."""
        resp = await client.post("/api/deposits/webhook/pix", json={
            "external_id": "nao_existe",
            "status": "paid",
        })
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_listar_depositos(self, client: AsyncClient, seed_user, user_token):
        """Listar depósitos deve retornar array com os do usuário."""
        await client.post("/api/deposits", json={"amount": 20.0},
                          headers={"Authorization": f"Bearer {user_token}"})
        await client.post("/api/deposits", json={"amount": 50.0},
                          headers={"Authorization": f"Bearer {user_token}"})

        resp = await client.get("/api/deposits", headers={
            "Authorization": f"Bearer {user_token}",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2
