"""Testes de autenticação."""
import pytest
from httpx import AsyncClient


class TestAuth:

    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient):
        """Cadastro com dados válidos deve retornar token."""
        resp = await client.post("/api/auth/register", json={
            "email": "novo@teste.com",
            "password": "SenhaForte1!",
            "name": "Novo Usuário",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_register_email_duplicado(self, client: AsyncClient):
        """Email já cadastrado deve retornar 409."""
        # Primeiro cadastro
        await client.post("/api/auth/register", json={
            "email": "duplicado@teste.com",
            "password": "SenhaForte1!",
            "name": "Primeiro",
        })
        # Segundo com mesmo email
        resp = await client.post("/api/auth/register", json={
            "email": "duplicado@teste.com",
            "password": "SenhaForte1!",
            "name": "Segundo",
        })
        assert resp.status_code == 409
        assert "já cadastrado" in resp.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_register_senha_fraca(self, client: AsyncClient):
        """Senha sem maiúscula, número ou especial deve ser rejeitada."""
        resp = await client.post("/api/auth/register", json={
            "email": "fraca@teste.com",
            "password": "123456",  # muito curta e fraca
            "name": "Senha Fraca",
        })
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_register_senha_sem_maiuscula(self, client: AsyncClient):
        """Senha sem letra maiúscula deve ser rejeitada."""
        resp = await client.post("/api/auth/register", json={
            "email": "semmaiuscula@teste.com",
            "password": "senhafraca1!",
            "name": "Sem Maiúscula",
        })
        assert resp.status_code == 422
        assert "maiúscula" in resp.text.lower()

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, seed_user):
        """Login com credenciais corretas retorna token."""
        resp = await client.post("/api/auth/login", json={
            "email": "teste@clou.com",
            "password": "Teste123!",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert len(data["access_token"]) > 0

    @pytest.mark.asyncio
    async def test_login_senha_errada(self, client: AsyncClient, seed_user):
        """Login com senha errada retorna 401."""
        resp = await client.post("/api/auth/login", json={
            "email": "teste@clou.com",
            "password": "senha_errada",
        })
        assert resp.status_code == 401
        assert "inválidos" in resp.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_me_autenticado(self, client: AsyncClient, seed_user, user_token):
        """GET /me com token válido retorna dados do usuário."""
        resp = await client.get("/api/auth/me", headers={
            "Authorization": f"Bearer {user_token}",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "teste@clou.com"
        assert data["name"] == "Usuário Teste"
        assert data["balance"] == 100.0

    @pytest.mark.asyncio
    async def test_me_sem_token(self, client: AsyncClient):
        """GET /me sem token retorna 403 (HTTPBearer sem header)."""
        resp = await client.get("/api/auth/me")
        assert resp.status_code == 403
