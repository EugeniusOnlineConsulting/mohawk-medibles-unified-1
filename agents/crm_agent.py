"""
Mohawk Medibles — CRM Intelligence Agent
═════════════════════════════════════════
Handles Customer Segmentation, LTV Tracking, and Churn Risk.
Now connected to the real Next.js database via API.
"""

import os
import httpx

NEXTJS_URL = os.getenv("NEXTJS_URL", "http://localhost:3000")


class CRMAgent:
    def __init__(self):
        self.api_base = NEXTJS_URL
        self.segments = {
            "VIP": {"perks": "Priority Shipping, Exclusive Reserves, Early Access"},
            "Loyal": {"perks": "Double Points, Birthday Gift, Free Shipping"},
            "At-Risk": {"perks": "Win-back Offer, Personal Outreach"},
            "New": {"perks": "Welcome Discount, Onboarding Sequence"},
            "Dormant": {"perks": "Re-engagement Campaign, Special Offer"},
            "High-AOV": {"perks": "Bulk Discounts, VIP Pathway Offer"},
            "Prospect": {"perks": "First Purchase Discount, Education Content"},
        }

    async def _api(self, path: str) -> dict:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(f"{self.api_base}{path}")
            resp.raise_for_status()
            return resp.json()

    async def get_customer_brief(self, user_id: str) -> dict:
        """Get a customer brief using real data from the API."""
        try:
            stats = await self._api("/api/admin/customers?action=segments")
            financial = await self._api("/api/admin/financial?metric=overview")
            metrics = financial.get("metrics", {})

            return {
                "user_id": user_id,
                "total_customers": stats.get("totalCustomers", 0),
                "new_this_month": stats.get("newThisMonth", 0),
                "repeat_buyers": stats.get("repeatBuyers", 0),
                "monthly_revenue": metrics.get("revenuePerMonth", 0),
                "average_order_value": metrics.get("averageOrderValue", 0),
                "ltv": metrics.get("estimatedLTV", 0),
                "repeat_rate": metrics.get("repeatPurchaseRate", 0),
                "next_best_action": self._determine_next_action(metrics),
            }
        except Exception as e:
            return {
                "user_id": user_id,
                "error": str(e),
                "next_best_action": "Check API connection",
            }

    def _determine_next_action(self, metrics: dict) -> str:
        repeat_rate = metrics.get("repeatPurchaseRate", 0)
        aov = metrics.get("averageOrderValue", 0)
        ltv_cac = metrics.get("ltvCacRatio", 0)

        actions = []
        if repeat_rate < 20:
            actions.append("Launch retention campaign for single-order customers")
        if aov < 200:
            actions.append(f"Implement upsell at checkout (current AOV: ${aov:.0f})")
        if ltv_cac < 3:
            actions.append("Improve LTV:CAC ratio through loyalty program")
        if not actions:
            actions.append("Maintain current trajectory — strong metrics")
        return " | ".join(actions)

    async def get_segment_overview(self) -> str:
        """Generate a segment overview using real financial data."""
        try:
            financial = await self._api("/api/admin/financial?metric=overview")
            metrics = financial.get("metrics", {})
            strategies = financial.get("strategies", [])

            response = (
                f"📊 **CRM Intelligence Report**\n\n"
                f"**Revenue:** ${metrics.get('revenuePerMonth', 0):,.0f}/month\n"
                f"**AOV:** ${metrics.get('averageOrderValue', 0):.0f}\n"
                f"**LTV:** ${metrics.get('estimatedLTV', 0):.0f}\n"
                f"**LTV:CAC:** {metrics.get('ltvCacRatio', 0):.1f}x\n"
                f"**Repeat Rate:** {metrics.get('repeatPurchaseRate', 0):.1f}%\n\n"
            )

            if strategies:
                response += "**Top Strategies:**\n"
                for s in strategies[:3]:
                    response += f"• {s['name']} (+${s['projectedMonthlyImpact']:,}/mo)\n"

            return response
        except Exception:
            return "❌ Could not fetch CRM data. Is the API running?"

    async def process(self, message: str) -> str:
        """Process a chat message related to CRM."""
        msg = message.lower()
        if "segment" in msg or "overview" in msg or "brief" in msg:
            return await self.get_segment_overview()
        brief = await self.get_customer_brief("admin")
        return (
            f"📊 **Customer Intelligence:**\n\n"
            f"Customers: {brief.get('total_customers', 0):,}\n"
            f"Repeat Buyers: {brief.get('repeat_buyers', 0):,}\n"
            f"Monthly Revenue: ${brief.get('monthly_revenue', 0):,.0f}\n"
            f"AOV: ${brief.get('average_order_value', 0):.0f}\n"
            f"LTV: ${brief.get('ltv', 0):.0f}\n\n"
            f"**Next Action:** {brief.get('next_best_action', 'N/A')}"
        )


# Singleton
crm_bot = CRMAgent()
