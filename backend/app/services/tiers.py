"""
Sistema de Tiers para revendedores Clou.
Cálculo dinâmico — sem necessidade de migration no banco.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class CommissionTier:
    name: str
    min_sales: float  # faturamento mínimo mensal dos indicados (R$)
    max_sales: Optional[float]  # None = sem limite superior
    rate: float  # percentual (ex: 5.0 = 5%)


# Tabela de comissões progressivas
TIERS = [
    CommissionTier(name="Bronze", min_sales=0, max_sales=500, rate=5.0),
    CommissionTier(name="Prata", min_sales=500, max_sales=2_000, rate=7.0),
    CommissionTier(name="Ouro", min_sales=2_000, max_sales=5_000, rate=10.0),
    CommissionTier(name="Diamante", min_sales=5_000, max_sales=None, rate=15.0),
]

# Taxa padrão para parceiros sem vendas (comission_rate do Partner)
DEFAULT_RATE = 5.0


def get_tier(total_sales: float) -> CommissionTier:
    """Retorna o tier correspondente ao volume de vendas."""
    for tier in TIERS:
        if total_sales >= tier.min_sales:
            if tier.max_sales is None or total_sales < tier.max_sales:
                return tier
    return TIERS[0]  # Bronze (fallback)


def next_tier(current_sales: float) -> Optional[CommissionTier]:
    """Retorna o próximo tier que o revendedor pode alcançar."""
    for tier in TIERS:
        if tier.min_sales > current_sales:
            return tier
    return None  # Já está no máximo


def sales_to_next_tier(current_sales: float) -> float:
    """Quanto falta em vendas para atingir o próximo tier."""
    nxt = next_tier(current_sales)
    if nxt is None:
        return 0.0
    return round(max(0, nxt.min_sales - current_sales), 2)