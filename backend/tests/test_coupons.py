"""Testes de cupons."""
import pytest
from httpx import AsyncClient


class TestCoupons:

    @pytest.mark.asyncio
    async def test_cupom_valido(self, client: AsyncClient, seed_user, seed_coupon, user_token):
        """Cupom válido deve retornar desconto correto."""
        resp = await client.post("/api/coupons/validate", json={
            "code": "TESTE10",
            "amount": 100.0,
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == "TESTE10"
        assert data["discount_percent"] == 10
        assert data["discount_amount"] == 10.0
        assert data["final_amount"] == 90.0
        assert data["valid"] is True

    @pytest.mark.asyncio
    async def test_cupom_inexistente(self, client: AsyncClient, seed_user, user_token):
        """Cupom que não existe deve retornar 404."""
        resp = await client.post("/api/coupons/validate", json={
            "code": "CODIGOINVALIDO",
            "amount": 50.0,
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 404
        assert "não encontrado" in resp.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_cupom_expirado(self, client: AsyncClient, seed_user, seed_expired_coupon, user_token):
        """Cupom expirado deve retornar 400."""
        resp = await client.post("/api/coupons/validate", json={
            "code": "EXPIRADO",
            "amount": 50.0,
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 400
        assert "expirado" in resp.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_cupom_valor_minimo(self, client: AsyncClient, seed_user, seed_coupon, user_token):
        """Cupom com valor abaixo do mínimo deve retornar 400."""
        # seed_coupon tem min_amount=1.0, então 0.50 deve falhar
        resp = await client.post("/api/coupons/validate", json={
            "code": "TESTE10",
            "amount": 0.50,
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 400
        assert "mínimo" in resp.json()["detail"].lower()
