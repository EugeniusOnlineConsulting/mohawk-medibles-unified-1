"""
Mohawk Medibles — Newsletter Agent
═══════════════════════════════════
Connects to the Next.js campaign APIs for real subscriber
management, campaign creation, and sending.
"""

import os
import httpx
from typing import Optional

NEXTJS_URL = os.getenv("NEXTJS_URL", "http://localhost:3000")


class NewsletterAgent:
    def __init__(self):
        self.api_base = NEXTJS_URL

    async def _api(self, method: str, path: str, json_data: dict = None) -> dict:
        """Make an HTTP request to the Next.js API."""
        async with httpx.AsyncClient(timeout=30) as client:
            url = f"{self.api_base}{path}"
            if method == "GET":
                resp = await client.get(url)
            else:
                resp = await client.post(url, json=json_data)
            resp.raise_for_status()
            return resp.json()

    # ─── Subscriber Management ────────────────────────────────

    async def subscribe_user(self, email: str, name: str = "", source: str = "agent") -> str:
        """Subscribe a user to the newsletter via the Next.js API."""
        try:
            result = await self._api("POST", "/api/newsletter/subscribe", {
                "email": email,
                "name": name,
                "source": source,
            })
            if result.get("success"):
                return f"✅ Subscribed {email} to the Mohawk Medibles newsletter."
            return f"⚠️ {result.get('error', 'Could not subscribe.')}"
        except Exception as e:
            return f"❌ Subscription failed: {str(e)}"

    # ─── Campaign Management ──────────────────────────────────

    async def get_campaign_stats(self) -> dict:
        """Get campaign statistics from the admin API."""
        try:
            return await self._api("GET", "/api/admin/campaigns?action=stats")
        except Exception:
            return {"totalCampaigns": 0, "totalSubscribers": 0, "totalSent": 0, "openRate": 0, "clickRate": 0}

    async def list_campaigns(self) -> list:
        """List all campaigns."""
        try:
            return await self._api("GET", "/api/admin/campaigns")
        except Exception:
            return []

    async def create_campaign(
        self, name: str, subject: str, preview_text: str = "",
        html_content: str = "", segment: Optional[str] = None
    ) -> dict:
        """Create a new email campaign."""
        try:
            segment_rules = {"segment": segment} if segment else None
            result = await self._api("POST", "/api/admin/campaigns", {
                "action": "create",
                "name": name,
                "subject": subject,
                "previewText": preview_text,
                "htmlContent": html_content,
                "segmentRules": segment_rules,
            })
            return result
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def send_campaign(self, campaign_id: str) -> dict:
        """Send a campaign to its target audience."""
        try:
            return await self._api("POST", "/api/admin/campaigns", {
                "action": "send",
                "id": campaign_id,
            })
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def schedule_campaign(self, campaign_id: str, scheduled_at: str) -> dict:
        """Schedule a campaign for future sending."""
        try:
            return await self._api("POST", "/api/admin/campaigns", {
                "action": "schedule",
                "id": campaign_id,
                "scheduledAt": scheduled_at,
            })
        except Exception as e:
            return {"success": False, "error": str(e)}

    # ─── Chat Interface ───────────────────────────────────────

    async def get_weekly_brief(self, user_id: str) -> str:
        """Generate a weekly newsletter brief with real stats."""
        stats = await self.get_campaign_stats()
        campaigns = await self.list_campaigns()
        recent = campaigns[:3] if isinstance(campaigns, list) else []

        response = (
            f"📰 **Newsletter Command Center**\n\n"
            f"📊 **Stats:**\n"
            f"• Total Subscribers: {stats.get('totalSubscribers', 0):,}\n"
            f"• Campaigns Sent: {stats.get('totalCampaigns', 0)}\n"
            f"• Open Rate: {stats.get('openRate', 0)}%\n"
            f"• Click Rate: {stats.get('clickRate', 0)}%\n"
        )

        if recent:
            response += "\n📋 **Recent Campaigns:**\n"
            for c in recent:
                name = c.get("name", "Untitled")
                status = c.get("status", "DRAFT")
                response += f"• {name} — {status}\n"

        response += "\n💡 *Commands: 'create campaign', 'send campaign', 'campaign stats'*"
        return response


# Singleton
newsletter_bot = NewsletterAgent()
