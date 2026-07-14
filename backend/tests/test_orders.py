"""Testes de pedidos (orders)."""
import pytest
from httpx import AsyncClient


class TestOrders:

    @pytest.mark.asyncio
    async def test_criar_pedido_sucesso(self, client: AsyncClient, seed_user, seed_service, user_token):
        """Criar pedido com saldo suficiente deve retornar 201."""
        resp = await client.post("/api/orders", json={
            "service_id": seed_service.id,
            "link": "https://instagram.com/testeperfil",
            "quantity": 500,
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["status"] == "pending"
        assert data["quantity"] == 500
        assert data["charge"] == round(5.50 * (500 / 1000), 2)  # 2.75

    @pytest.mark.asyncio
    async def test_criar_pedido_saldo_insuficiente(self, client: AsyncClient, seed_user, seed_service, user_token):
        """Pedido com valor maior que o saldo deve retornar 402."""
        # seed_user tem saldo de 100, e o serviço custa 5.50/1K
        # 100_000 unidades custariam 550 — maior que 100
        resp = await client.post("/api/orders", json={
            "service_id": seed_service.id,
            "link": "https://instagram.com/testeperfil",
            "quantity": 100_000,
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 402
        assert "insuficiente" in resp.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_criar_pedido_link_invalido(self, client: AsyncClient, seed_user, seed_service, user_token):
        """Link sem URL válida deve retornar 400."""
        resp = await client.post("/api/orders", json={
            "service_id": seed_service.id,
            "link": "só-um-texto-sem-url",
            "quantity": 500,
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 400
        assert "link" in resp.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_criar_pedido_quantidade_fora_range(self, client: AsyncClient, seed_user, seed_service, user_token):
        """Quantidade fora do range min/max deve retornar 400."""
        resp = await client.post("/api/orders", json={
            "service_id": seed_service.id,
            "link": "https://instagram.com/teste",
            "quantity": 1,  # min é 100
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 400
        assert "quantidade" in resp.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_criar_pedido_servico_inativo(self, client: AsyncClient, seed_user, seed_service, user_token, db):
        """Serviço inativo deve retornar 404."""
        # Desativar serviço
        seed_service.status = "inactive"
        await db.flush()

        resp = await client.post("/api/orders", json={
            "service_id": seed_service.id,
            "link": "https://instagram.com/teste",
            "quantity": 500,
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 404
        assert "não encontrado" in resp.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_listar_pedidos(self, client: AsyncClient, seed_user, seed_service, user_token):
        """Listar pedidos deve retornar array."""
        # Criar 2 pedidos
        for _ in range(2):
            await client.post("/api/orders", json={
                "service_id": seed_service.id,
                "link": "https://instagram.com/testeperfil",
                "quantity": 200,
            }, headers={"Authorization": f"Bearer {user_token}"})

        resp = await client.get("/api/orders", headers={
            "Authorization": f"Bearer {user_token}",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    @pytest.mark.asyncio
    async def test_buscar_pedido_por_id(self, client: AsyncClient, seed_user, seed_service, user_token):
        """Buscar pedido por ID deve retornar dados completos."""
        created = await client.post("/api/orders", json={
            "service_id": seed_service.id,
            "link": "https://instagram.com/testeperfil",
            "quantity": 1000,
        }, headers={"Authorization": f"Bearer {user_token}"})
        order_id = created.json()["id"]

        resp = await client.get(f"/api/orders/{order_id}", headers={
            "Authorization": f"Bearer {user_token}",
        })
        assert resp.status_code == 200
        assert resp.json()["id"] == order_id

    @pytest.mark.asyncio
    async def test_buscar_pedido_outro_usuario(self, client: AsyncClient, seed_user, seed_service, user_token, db):
        """Pedido de outro usuário não deve ser visível."""
        # Criar pedido como seed_user
        created = await client.post("/api/orders", json={
            "service_id": seed_service.id,
            "link": "https://instagram.com/testeperfil",
            "quantity": 500,
        }, headers={"Authorization": f"Bearer {user_token}"})
        order_id = created.json()["id"]

        # Criar outro usuário e tentar acessar
        from app.core.security import hash_password
        from app.models.user import User, UserRole
        outro = User(
            email="outro@teste.com", name="Outro",
            password_hash=hash_password("Outro123!"),
            balance=50.0, role=UserRole.USER,
        )
        db.add(outro)
        await db.flush()
        from app.core.security import create_access_token
        outro_token = create_access_token({"sub": str(outro.id)})

        resp = await client.get(f"/api/orders/{order_id}", headers={
            "Authorization": f"Bearer {outro_token}",
        })
        assert resp.status_code == 404
