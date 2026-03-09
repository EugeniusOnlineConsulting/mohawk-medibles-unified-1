"""
Campaign Agent — FastAPI endpoints for campaign management.
Mounted at /api/campaigns on the Agent Gateway.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from agents.campaign_agent import campaign_bot

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])


class CampaignRequest(BaseModel):
    action: str = "intelligence"
    segment: Optional[str] = None
    product_slug: Optional[str] = None
    subject: Optional[str] = None
    message: Optional[str] = None


@router.post("/")
async def handle_campaign(req: CampaignRequest):
    """Route campaign requests to the campaign agent."""
    if req.action == "intelligence":
        brief = await campaign_bot.get_campaign_intelligence()
        return {"brief": brief}

    if req.action == "create":
        result = await campaign_bot.create_segment_campaign(
            segment=req.segment or "New",
            product_slug=req.product_slug,
            custom_subject=req.subject,
        )
        return result

    if req.action == "winback":
        return await campaign_bot.create_winback_campaign()

    if req.action == "vip":
        return await campaign_bot.create_vip_campaign(product_slug=req.product_slug)

    if req.action == "chat" and req.message:
        response = await campaign_bot.process(req.message)
        return {"response": response}

    return {"error": f"Unknown action: {req.action}"}


@router.get("/intelligence")
async def get_intelligence():
    """Get campaign intelligence brief."""
    brief = await campaign_bot.get_campaign_intelligence()
    return {"brief": brief}
