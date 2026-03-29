import httpx
import logging
from config import settings

logger = logging.getLogger(__name__)

FINANCE_URL = settings.FINANCE_SERVICE_URL


async def create_auto_income(
    order_id: int,
    order_number: str,
    amount: float,
    payment_date: str,
    payment_method: str,
    client_name: str,
    organization_name: str,
):
    """Call finance service to create income transaction from order payment."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{FINANCE_URL}/api/finance/auto-income",
                json={
                    "order_id": order_id,
                    "order_number": order_number,
                    "amount": float(amount),
                    "payment_date": payment_date,
                    "payment_method": payment_method,
                    "client_name": client_name,
                    "organization_name": organization_name,
                },
                timeout=10.0,
            )
            if resp.status_code == 201:
                logger.info(f"Auto-income created for order {order_number}: {amount}")
            else:
                logger.error(f"Finance service error: {resp.status_code} {resp.text}")
    except Exception as e:
        logger.error(f"Failed to call finance service: {e}")
        # Don't fail the payment — finance sync can be retried
