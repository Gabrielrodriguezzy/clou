from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey
from app.core.database import Base


class PartnerPayout(Base):
    """Registra pagamentos manuais feitos a parceiros (donos de grupo)."""
    __tablename__ = "partner_payouts"

    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    paid_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def __repr__(self) -> str:
        return f"<PartnerPayout partner_id={self.partner_id} amount={self.amount}>"