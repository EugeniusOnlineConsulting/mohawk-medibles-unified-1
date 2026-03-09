"""
Content Agent — FastAPI endpoints for the Content Social Engineering Agent.
Mounted at /api/content on the Agent Gateway.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from agents.content_agent import content_bot

router = APIRouter(prefix="/api/content", tags=["content"])


class ContentRequest(BaseModel):
    action: str = "generate"
    channel: str = "instagram_post"
    pillar: Optional[str] = None
    product_slug: Optional[str] = None
    keyword: Optional[str] = None
    custom_topic: Optional[str] = None
    count: int = 10
    days: int = 7
    channels: Optional[List[str]] = None


@router.post("/")
async def generate_content(req: ContentRequest):
    """Route content generation requests to the agent."""
    
    if req.action == "generate":
        result = await content_bot.generate_content(
            channel=req.channel,
            pillar=req.pillar,
            product_slug=req.product_slug,
            keyword=req.keyword,
            custom_topic=req.custom_topic,
        )
        return result

    elif req.action == "calendar":
        calendar = await content_bot.generate_content_calendar(days=req.days)
        return {"calendar": calendar, "days": req.days}

    elif req.action == "batch":
        batch = await content_bot.generate_batch(
            count=req.count,
            channels=req.channels,
            pillar=req.pillar,
        )
        return {"batch": batch, "count": len(batch)}

    elif req.action == "blog":
        blog = await content_bot.generate_blog(
            pillar=req.pillar or "education",
            keyword=req.keyword,
            topic=req.custom_topic,
        )
        return blog

    elif req.action == "product_copy":
        if not req.product_slug:
            return {"error": "product_slug required for product_copy"}
        copy = await content_bot.generate_product_copy(req.product_slug)
        return copy

    return {"error": f"Unknown action: {req.action}"}


@router.get("/pillars")
async def get_pillars():
    """Return available content pillars and their weights."""
    return {
        "pillars": {
            name: {
                "weight": data["weight"],
                "description": data["description"],
            }
            for name, data in content_bot.pillars.items()
        }
    }


@router.get("/channels")
async def get_channels():
    """Return available content channels and their specs."""
    return {"channels": content_bot.templates}


@router.get("/stats")
async def get_stats():
    """Return content agent stats."""
    return {
        "products_loaded": len(content_bot.products),
        "seo_keywords_loaded": len(content_bot.seo_keywords),
        "inventory_loaded": len(content_bot.inventory),
        "pillars": list(content_bot.pillars.keys()),
        "channels": list(content_bot.templates.keys()),
    }
