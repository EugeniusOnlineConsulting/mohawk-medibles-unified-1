import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from agents.support_agent import SupportAgent, support_bot
from agents.logistics_agent import LogisticsAgent, logistics_bot
from agents.stock_agent import StockAgent, stock_bot
from agents.newsletter_agent import newsletter_bot
from agents.content_agent import content_bot
from agents.crm_agent import crm_bot
from agents.campaign_agent import campaign_bot
from agents.skills.memory_service import memory_service
from agents.routes.content_routes import router as content_router
from agents.routes.campaign_routes import router as campaign_router

app = FastAPI(title="Mohawk Medibles Agent Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mohawkmedibles.ca",
        "https://www.mohawkmedibles.ca",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-CSRF-Token"],
)

# Mount API routes
app.include_router(content_router)
app.include_router(campaign_router)


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    session_user = "user_123" # Mock Session ID for now
    
    try:
        while True:
            data = await websocket.receive_text()
            
            # Record Interaction (Mock price for now)
            if "buy" in data.lower() or "cart" in data.lower():
                 memory_service.record_interaction(session_user, "General Item", 10.0)
            
            # Simple preference extraction
            if "indica" in data.lower(): memory_service.update_preference(session_user, "Indica")
            if "sativa" in data.lower(): memory_service.update_preference(session_user, "Sativa")

            # Smart Router
            if data.startswith("#MM-"):
                response = await logistics_bot.check_status(data)
            elif "stock" in data.lower() or "inventory" in data.lower():
                response = await stock_bot.check_stock(data)
            elif "campaign" in data.lower() or "winback" in data.lower() or "win-back" in data.lower():
                response = await campaign_bot.process(data)
            elif "news" in data.lower() or "subscribe" in data.lower() or "newsletter" in data.lower():
                if "subscribe" in data.lower():
                    response = await newsletter_bot.subscribe_user("user@example.com")
                else:
                    response = await newsletter_bot.get_weekly_brief(session_user)
            elif "blog" in data.lower() or "article" in data.lower():
                # Admin/Content Mode — uses the full content agent
                article = await content_bot.generate_blog()
                response = f"📝 **Generated Content:**\n\n**{article['title']}**\n\n{article.get('meta_description', '')}\n\n📊 Keyword: {article.get('keyword', 'N/A')}\n📝 Est. words: {article.get('estimated_word_count', 0)}\n\n*Draft saved to CMS.*"
            elif "analyze" in data.lower() and "customer" in data.lower():
                 response = await crm_bot.process(data)
            elif "crm" in data.lower() or "segment" in data.lower():
                 response = await crm_bot.process(data)
            else:
                # Inject Memory Context into Support Agent (This would be passed to LLM in real scenario)
                strategy = memory_service.get_recommendation_strategy(session_user)
                print(f"[DEBUG] Strategy for {session_user}: {strategy}") 
                response = await support_bot.process(data, session_user)
                
            await manager.send_personal_message(response, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"status": "Agent Gateway Online", "version": "1.0.0"}
