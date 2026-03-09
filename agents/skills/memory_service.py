"""
Mohawk Medibles — Memory Service
═════════════════════════════════
Hybrid memory: local JSON for fast access + API-enriched customer data.
Falls back to local storage if the API is unavailable.
"""

import json
import os
import httpx
from datetime import datetime

NEXTJS_URL = os.getenv("NEXTJS_URL", "http://localhost:3000")


class MemoryService:
    def __init__(self, storage_file="user_memory.json"):
        self.storage_file = storage_file
        self.memory = self._load_memory()
        self.api_base = NEXTJS_URL

    def _load_memory(self):
        if os.path.exists(self.storage_file):
            with open(self.storage_file, "r") as f:
                return json.load(f)
        return {}

    def _save_memory(self):
        with open(self.storage_file, "w") as f:
            json.dump(self.memory, f, indent=2)

    def get_user_profile(self, user_id: str):
        return self.memory.get(user_id, {
            "preferences": [],
            "history": [],
            "ltv": 0,
            "segment": "New",
        })

    def update_preference(self, user_id: str, preference: str):
        if user_id not in self.memory:
            self.memory[user_id] = self.get_user_profile(user_id)
        if preference not in self.memory[user_id]["preferences"]:
            self.memory[user_id]["preferences"].append(preference)
            self._save_memory()

    def record_interaction(self, user_id: str, item: str, price: float):
        if user_id not in self.memory:
            self.memory[user_id] = self.get_user_profile(user_id)
        self.memory[user_id]["history"].append({
            "item": item,
            "price": price,
            "date": datetime.now().isoformat(),
        })
        self.memory[user_id]["ltv"] += price
        if self.memory[user_id]["ltv"] > 500:
            self.memory[user_id]["segment"] = "VIP"
        elif self.memory[user_id]["ltv"] > 100:
            self.memory[user_id]["segment"] = "Loyal"
        self._save_memory()

    def get_recommendation_strategy(self, user_id: str):
        profile = self.get_user_profile(user_id)
        segment = profile.get("segment", "New")
        prefs = profile.get("preferences", [])

        if segment == "VIP":
            return f"User is VIP. Suggest 'Reserve Collection' items matching {prefs}. Offer early access."
        elif segment == "Loyal":
            return f"User is Loyal. Suggest 'Premium' items to increase LTV. Mention loyalty points."
        return "User is New. Focus on 'Best Sellers' and 'Education' to build trust."

    async def get_enriched_profile(self, user_id: str) -> dict:
        """Get an enriched profile using the Next.js API for real customer data."""
        local = self.get_user_profile(user_id)
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(f"{self.api_base}/api/admin/financial?metric=overview")
                if resp.status_code == 200:
                    data = resp.json()
                    metrics = data.get("metrics", {})
                    local["api_enriched"] = True
                    local["global_aov"] = metrics.get("averageOrderValue", 0)
                    local["global_ltv"] = metrics.get("estimatedLTV", 0)
                    local["monthly_revenue"] = metrics.get("revenuePerMonth", 0)
        except Exception:
            local["api_enriched"] = False
        return local


# Singleton instance
memory_service = MemoryService()
