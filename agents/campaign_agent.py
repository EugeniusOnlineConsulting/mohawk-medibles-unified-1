"""
Mohawk Medibles — Campaign Orchestration Agent
════════════════════════════════════════════════
Orchestrates: CRM segmentation → content generation → newsletter dispatch.
Uses the content agent's brand voice for email body and the newsletter
agent's API calls for campaign management.
"""

import os
import httpx
from typing import Optional
from agents.content_agent import content_bot

NEXTJS_URL = os.getenv("NEXTJS_URL", "http://localhost:3000")


class CampaignAgent:
    def __init__(self):
        self.api_base = NEXTJS_URL
        self.content = content_bot

    async def _api(self, method: str, path: str, json_data: dict = None) -> dict:
        async with httpx.AsyncClient(timeout=30) as client:
            url = f"{self.api_base}{path}"
            if method == "GET":
                resp = await client.get(url)
            else:
                resp = await client.post(url, json=json_data)
            resp.raise_for_status()
            return resp.json()

    # ─── Smart Campaign Creation ──────────────────────────────

    async def create_segment_campaign(
        self,
        segment: str,
        product_slug: Optional[str] = None,
        custom_subject: Optional[str] = None,
    ) -> dict:
        """
        Create a full campaign for a customer segment.
        Auto-generates email content using the content agent.
        """
        # Generate email content using the content engine
        email_content = await self.content.generate_email(
            pillar="product_story" if product_slug else "community",
            product_slug=product_slug,
        )

        subject = custom_subject or email_content.get("subject_lines", ["Mohawk Medibles Update"])[0]
        preview = email_content.get("preview_text", "")
        body = email_content.get("body", {})

        html = self._build_html(
            hero=body.get("hero_text", ""),
            copy=body.get("body_copy", ""),
            cta_text=body.get("cta_text", "Shop Now"),
            cta_link=body.get("cta_link", "https://mohawkmedibles.ca/shop/"),
        )

        name = f"{segment} Campaign — {subject[:40]}"

        result = await self._api("POST", "/api/admin/campaigns", {
            "action": "create",
            "name": name,
            "subject": subject,
            "previewText": preview,
            "htmlContent": html,
            "segmentRules": {"segment": segment},
        })

        return result

    async def create_winback_campaign(self) -> dict:
        """Auto-create a win-back campaign targeting Dormant + At-Risk customers."""
        html = self._build_html(
            hero="We Miss You!",
            copy=(
                "It's been a while since your last visit. We've been busy curating new products "
                "that meet our Empire Standard™ — and we think you'll love what we've added.\n\n"
                "As a valued customer, here's an exclusive offer to welcome you back."
            ),
            cta_text="Browse New Arrivals",
            cta_link="https://mohawkmedibles.ca/shop/?sort=newest",
        )

        result = await self._api("POST", "/api/admin/campaigns", {
            "action": "create",
            "name": "Win-Back: We Miss You",
            "subject": "We miss you — here's something special",
            "previewText": "It's been a while. Come see what's new at Mohawk Medibles.",
            "htmlContent": html,
            "segmentRules": {"segment": "Dormant"},
        })
        return result

    async def create_vip_campaign(self, product_slug: Optional[str] = None) -> dict:
        """Create an exclusive VIP campaign."""
        email_content = await self.content.generate_email(
            pillar="product_story",
            product_slug=product_slug,
        )

        body = email_content.get("body", {})
        html = self._build_html(
            hero="VIP Early Access",
            copy=(
                f"As one of our most valued customers, you get first access.\n\n"
                f"{body.get('body_copy', 'New premium products are now available.')}\n\n"
                f"This is the Empire Standard™ — reserved for you."
            ),
            cta_text=body.get("cta_text", "Shop VIP Collection"),
            cta_link=body.get("cta_link", "https://mohawkmedibles.ca/shop/"),
        )

        result = await self._api("POST", "/api/admin/campaigns", {
            "action": "create",
            "name": "VIP Exclusive Access",
            "subject": "VIP Early Access — New Arrivals",
            "previewText": "First look, reserved for our VIPs.",
            "htmlContent": html,
            "segmentRules": {"segment": "VIP"},
        })
        return result

    # ─── Campaign Intelligence ────────────────────────────────

    async def get_campaign_intelligence(self) -> str:
        """Generate an intelligence brief about campaign performance."""
        try:
            stats = await self._api("GET", "/api/admin/campaigns?action=stats")
            financial = await self._api("GET", "/api/admin/financial?metric=overview")
            metrics = financial.get("metrics", {})
        except Exception:
            return "❌ Could not fetch campaign intelligence. Is the server running?"

        subscribers = stats.get("totalSubscribers", 0)
        open_rate = stats.get("openRate", 0)
        click_rate = stats.get("clickRate", 0)
        monthly_rev = metrics.get("revenuePerMonth", 0)

        recommendations = []
        if open_rate < 20:
            recommendations.append("• Open rate is below 20% — try A/B testing subject lines")
        if click_rate < 3:
            recommendations.append("• Click rate is low — make CTAs more prominent and personalized")
        if subscribers < 100:
            recommendations.append("• Subscriber base is small — promote newsletter signup across all channels")

        if not recommendations:
            recommendations.append("• Campaign metrics are healthy — keep optimizing!")

        return (
            f"📊 **Campaign Intelligence Brief**\n\n"
            f"**Audience:** {subscribers:,} active subscribers\n"
            f"**Open Rate:** {open_rate}%\n"
            f"**Click Rate:** {click_rate}%\n"
            f"**Monthly Revenue:** ${monthly_rev:,.0f}\n\n"
            f"**Recommendations:**\n" + "\n".join(recommendations)
        )

    # ─── Chat Interface ───────────────────────────────────────

    async def process(self, message: str) -> str:
        """Process a chat message related to campaigns."""
        msg = message.lower()

        if "winback" in msg or "win-back" in msg or "win back" in msg:
            result = await self.create_winback_campaign()
            if result.get("success"):
                return f"✅ Win-back campaign created: **{result['campaign']['name']}**\nStatus: DRAFT — review and send when ready."
            return f"❌ Failed: {result.get('error', 'Unknown error')}"

        if "vip" in msg:
            result = await self.create_vip_campaign()
            if result.get("success"):
                return f"✅ VIP campaign created: **{result['campaign']['name']}**\nStatus: DRAFT — review and send when ready."
            return f"❌ Failed: {result.get('error', 'Unknown error')}"

        if "intelligence" in msg or "brief" in msg or "report" in msg:
            return await self.get_campaign_intelligence()

        if "create" in msg and "campaign" in msg:
            # Extract segment if mentioned
            segment = "New"
            for seg in ["VIP", "Loyal", "At-Risk", "Dormant", "High-AOV", "New"]:
                if seg.lower() in msg:
                    segment = seg
                    break
            result = await self.create_segment_campaign(segment)
            if result.get("success"):
                return f"✅ Campaign created for **{segment}** segment: **{result['campaign']['name']}**\nStatus: DRAFT"
            return f"❌ Failed: {result.get('error', 'Unknown error')}"

        return await self.get_campaign_intelligence()

    # ─── HTML Builder ─────────────────────────────────────────

    def _build_html(self, hero: str, copy: str, cta_text: str, cta_link: str) -> str:
        """Build a simple branded HTML email body."""
        paragraphs = "\n".join(
            f"<p style='margin:0 0 16px;line-height:1.6;color:#e0e0e0;'>{p.strip()}</p>"
            for p in copy.split("\n\n") if p.strip()
        )
        return f"""
<div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;">
    <h1 style="font-size:24px;color:#ffffff;margin:0 0 24px;">{hero}</h1>
    {paragraphs}
    <div style="margin:32px 0;">
        <a href="{cta_link}" style="display:inline-block;padding:14px 32px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">{cta_text}</a>
    </div>
</div>
""".strip()


# Singleton
campaign_bot = CampaignAgent()
