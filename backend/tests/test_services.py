"""Testes de serviços e catálogo."""
import pytest
from httpx import AsyncClient


class TestServices:

    @pytest.mark.asyncio
    async def test_listar_servicos(self, client: AsyncClient, seed_service):
        """Listar serviços deve retornar apenas serviços ativos."""
        resp = await client.get("/api/services")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert data[0]["name"] == "Seguidores Brasil Teste"

    @pytest.mark.asyncio
    async def test_listar_plataformas(self, client: AsyncClient, seed_platform):
        """Listar plataformas deve retornar plataformas ativas."""
        resp = await client.get("/api/platforms")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert data[0]["name"] == "Instagram"

    @pytest.mark.asyncio
    async def test_buscar_servico_por_slug(self, client: AsyncClient, seed_service):
        """Buscar serviço por slug deve retornar dados."""
        resp = await client.get("/api/services/by-slug/seguidores-brasil-teste")
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Seguidores Brasil Teste"
        assert data["slug"] == "seguidores-brasil-teste"

    @pytest.mark.asyncio
    async def test_buscar_servico_slug_inexistente(self, client: AsyncClient):
        """Slug inexistente deve retornar 404."""
        resp = await client.get("/api/services/by-slug/servico-que-nao-existe")
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_buscar_servico_por_id(self, client: AsyncClient, seed_service):
        """Buscar serviço por ID deve retornar dados."""
        resp = await client.get(f"/api/services/{seed_service.id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == seed_service.id

    @pytest.mark.asyncio
    async def test_filtrar_servicos_por_plataforma(self, client: AsyncClient, seed_service, seed_platform):
        """Filtrar serviços por plataforma deve retornar apenas os corretos."""
        resp = await client.get(f"/api/services?platform_id={seed_platform.id}")
        assert resp.status_code == 200
        data = resp.json()
        assert all(s["platform_id"] == seed_platform.id for s in data)
