"""
Stock Agent — Real-time inventory checks via database API.
Queries /api/agent/data for live stock levels instead of hardcoded data.
"""
import os
import httpx

NEXTJS_URL = os.getenv("NEXTJS_URL", "http://localhost:3000")
AGENT_SECRET = os.getenv("AGENT_API_SECRET", os.getenv("AUTH_SECRET", ""))


class StockAgent:
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
            print(f"[StockAgent] API error: {e}")
            return {"error": str(e)}

    async def check_stock(self, query: str) -> str:
        """Check inventory levels for a product or get a status report."""
        query_lower = query.lower().strip()

        # Stock status / report — return low stock alerts
        if "status" in query_lower or "report" in query_lower or "alert" in query_lower:
            data = await self._fetch({"type": "inventory"})

            if data.get("error"):
                return "Unable to check inventory right now. Please try again."

            items = data.get("items", [])
            if not items:
                return "✅ All inventory levels are healthy — no low stock alerts."

            lines = [f"⚠️ **Low Stock Alerts** ({data.get('count', 0)} items):"]
            for item in items:
                lines.append(
                    f"• {item['name']} ({item.get('category', 'N/A')}) — "
                    f"**{item.get('quantity', 0)} units** remaining "
                    f"(threshold: {item.get('lowStockThreshold', 5)})"
                )

            return "\n".join(lines)

        # Specific product query — search by name
        # Extract the product name from the query (remove common words)
        search_term = query_lower
        for word in ["stock", "inventory", "check", "how much", "how many", "do you have", "is", "in", "the", "any"]:
            search_term = search_term.replace(word, "")
        search_term = search_term.strip()

        if not search_term:
            # Generic query — return overall stats
            data = await self._fetch({"type": "stats"})
            if data.get("error"):
                return "Unable to fetch inventory stats."
            return (
                f"📊 **Inventory Overview:**\n"
                f"• Catalog: {data.get('catalogProducts', 0)} products\n"
                f"• Total Orders: {data.get('totalOrders', 0)}\n"
                f"• Pending: {data.get('pendingOrders', 0)}\n"
                f"• Shipped: {data.get('shippedOrders', 0)}"
            )

        data = await self._fetch({"type": "inventory", "query": search_term, "limit": "5"})

        if data.get("error"):
            return "Unable to check stock right now. Please try again."

        items = data.get("items", [])
        source = data.get("source", "database")

        if not items:
            return f"I couldn't find any products matching \"{search_term}\" in our inventory."

        lines = [f"**Stock Check** (source: {source}):"]
        for item in items:
            if source == "catalog":
                lines.append(f"• {item['name']} — ${item.get('price', 0):.2f} — {'In Stock ✅' if item.get('inStock') else 'Check Availability'}")
            else:
                qty = item.get("quantity", 0)
                status_icon = "✅" if qty > 0 and not item.get("lowStock") else "⚠️" if qty > 0 else "❌"
                status_text = "In Stock" if qty > 0 else "Out of Stock"
                low_note = " (LOW)" if item.get("lowStock") else ""
                lines.append(f"• {item['name']} — {status_icon} {status_text}{low_note} — {qty} units — ${item.get('price', 0):.2f}")

        return "\n".join(lines)


# Singleton
stock_bot = StockAgent()
