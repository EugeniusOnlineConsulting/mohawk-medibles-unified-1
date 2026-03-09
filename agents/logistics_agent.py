"""
Logistics Agent — Real-time order tracking via database API.
Queries /api/agent/data for live order status instead of hardcoded data.
"""
import os
import httpx

NEXTJS_URL = os.getenv("NEXTJS_URL", "http://localhost:3000")
AGENT_SECRET = os.getenv("AGENT_API_SECRET", os.getenv("AUTH_SECRET", ""))


class LogisticsAgent:
    def __init__(self):
        self.api_base = f"{NEXTJS_URL}/api/agent/data"
        self.headers = {"Authorization": f"Bearer {AGENT_SECRET}"}

    async def _fetch(self, params: dict) -> dict:
        """Fetch data from the Next.js Agent Data API."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(self.api_base, params=params, headers=self.headers)
                resp.raise_for_status()
                return resp.json()
        except Exception as e:
            print(f"[LogisticsAgent] API error: {e}")
            return {"error": str(e)}

    async def check_status(self, order_id: str) -> str:
        """Look up a real order by order number."""
        # Normalize: accept "#MM-XXXX" or "MM-XXXX"
        order_number = order_id.strip().lstrip("#").upper()

        data = await self._fetch({"type": "order", "query": order_number})

        if data.get("error"):
            return f"Sorry, I had trouble looking that up. Please try again in a moment."

        if not data.get("found"):
            return f"I couldn't find order **{order_number}**. Please double-check the order number (it starts with MM-)."

        order = data["order"]
        status = order["status"].replace("_", " ").title()
        items = ", ".join([f"{i['name']} (x{i['quantity']})" for i in order.get("items", [])])
        total = f"${order['total']:.2f} {order.get('currency', 'CAD')}"

        lines = [f"Order **{order['orderNumber']}** — Status: **{status}**"]
        lines.append(f"Total: {total}")

        if items:
            lines.append(f"Items: {items}")

        if order.get("trackingNumber"):
            lines.append(f"Tracking: {order['trackingNumber']} ({order.get('carrier', 'Canada Post')})")

        if order.get("shippedAt"):
            lines.append(f"Shipped: {order['shippedAt'][:10]}")

        if order.get("deliveredAt"):
            lines.append(f"Delivered: {order['deliveredAt'][:10]}")

        return "\n".join(lines)

    async def get_recent_orders(self, limit: int = 5) -> str:
        """Get recent orders for admin dashboard."""
        data = await self._fetch({"type": "recent-orders", "limit": str(limit)})

        if data.get("error"):
            return "Unable to fetch recent orders right now."

        orders = data.get("orders", [])
        if not orders:
            return "No orders found in the system yet."

        lines = [f"**Recent Orders** ({data.get('count', 0)} shown):"]
        for o in orders:
            status = o["status"].replace("_", " ").title()
            lines.append(f"• {o['orderNumber']} — {status} — ${o['total']:.2f} — {o.get('customer', 'N/A')}")

        return "\n".join(lines)

    async def get_orders_by_email(self, email: str) -> str:
        """Look up all orders for a customer email."""
        data = await self._fetch({"type": "orders-by-email", "query": email})

        if data.get("error"):
            return "Unable to look up orders right now."

        orders = data.get("orders", [])
        if not orders:
            return f"No orders found for {email}."

        lines = [f"**Orders for {email}** ({data.get('count', 0)} total):"]
        for o in orders:
            status = o["status"].replace("_", " ").title()
            tracking = f" — Tracking: {o['trackingNumber']}" if o.get("trackingNumber") else ""
            lines.append(f"• {o['orderNumber']} — {status} — ${o['total']:.2f}{tracking}")

        return "\n".join(lines)


# Singleton
logistics_bot = LogisticsAgent()
