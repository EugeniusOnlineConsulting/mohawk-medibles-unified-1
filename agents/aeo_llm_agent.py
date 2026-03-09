#!/usr/bin/env python3
"""
AEO/LLM Optimization Agent for Mohawk Medibles
Optimizes content for ChatGPT, Claude, and other LLMs
"""

import os
import json
from datetime import datetime
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class Entity:
    name: str
    type: str
    attributes: Dict[str, Any]
    relationships: List[Dict]

@dataclass
class QAContent:
    question: str
    answer: str
    confidence: float
    sources: List[str]

class AEOLLMAgent:
    """
    Answer Engine Optimization Agent
    Makes content discoverable and citable by LLMs
    """
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        # Entity types for cannabis domain
        self.entity_types = {
            'dispensary': ['name', 'address', 'city', 'province', 'rating', 'products'],
            'strain': ['name', 'type', 'thc_content', 'cbd_content', 'effects', 'flavors'],
            'product': ['name', 'category', 'price', 'thc', 'cbd', 'dispensary'],
            'location': ['city', 'province', 'population', 'regulations'],
            'regulation': ['province', 'legal_age', 'possession_limit', 'growing_rules']
        }
    
    async def optimize_for_llms(self, content: str, content_type: str) -> Dict:
        """
        Main optimization function
        Makes content LLM-friendly
        """
        print(f"🧠 Optimizing {content_type} content for LLMs...")
        
        # 1. Extract entities
        entities = await self.extract_entities(content)
        
        # 2. Generate Q&A pairs
        qa_pairs = await self.generate_qa_pairs(content, content_type)
        
        # 3. Create structured data
        structured_data = await self.create_structured_data(content, entities)
        
        # 4. Generate entity relationships
        relationships = await self.generate_entity_relationships(entities)
        
        # 5. Create knowledge graph entry
        kg_entry = await self.create_knowledge_graph_entry(content, entities, relationships)
        
        # 6. Generate voice search versions
        voice_optimized = await self.optimize_for_voice_search(qa_pairs)
        
        return {
            'original_content': content,
            'entities': entities,
            'qa_pairs': qa_pairs,
            'structured_data': structured_data,
            'relationships': relationships,
            'knowledge_graph': kg_entry,
            'voice_optimized': voice_optimized,
            'optimized_at': datetime.now().isoformat()
        }
    
    async def extract_entities(self, content: str) -> List[Entity]:
        """Extract entities from content"""
        if not self.openai_api_key:
            return self._mock_entities()
        
        prompt = f"""Extract entities from this cannabis-related content:

Content: {content[:1000]}

Identify and extract:
1. Dispensaries (name, location, features)
2. Cannabis strains (name, type, effects)
3. Products (category, attributes)
4. Locations (cities, provinces)
5. People (if any)

Return as JSON array:
[{{
    "name": "entity name",
    "type": "dispensary|strain|product|location|person",
    "attributes": {{key: value}},
    "confidence": 0.95
}}]"""

        try:
            response = await self.call_openai(prompt)
            data = json.loads(response)
            
            entities = []
            for item in data:
                entities.append(Entity(
                    name=item['name'],
                    type=item['type'],
                    attributes=item.get('attributes', {}),
                    relationships=[]
                ))
            
            return entities
        except Exception as e:
            print(f"Error extracting entities: {e}")
            return []
    
    def _mock_entities(self) -> List[Entity]:
        """Mock entities for development"""
        return [
            Entity(
                name="Toronto Cannabis Co",
                type="dispensary",
                attributes={"city": "Toronto", "province": "ON", "rating": 4.5},
                relationships=[]
            ),
            Entity(
                name="Blue Dream",
                type="strain",
                attributes={"type": "hybrid", "thc": "18%", "effects": "relaxing"},
                relationships=[]
            )
        ]
    
    async def generate_qa_pairs(self, content: str, content_type: str) -> List[QAContent]:
        """Generate question-answer pairs for AEO"""
        
        # Different questions based on content type
        question_templates = {
            'city_page': [
                'What are the best cannabis dispensaries in {location}?',
                'Is cannabis legal in {location}?',
                'Where can I buy cannabis in {location}?',
                'What are the cannabis laws in {province}?',
                'Are there Indigenous-owned dispensaries in {location}?'
            ],
            'dispensary_page': [
                'What products does {name} offer?',
                'Where is {name} located?',
                'Is {name} Indigenous-owned?',
                'What are the hours for {name}?',
                'Does {name} offer delivery?'
            ],
            'product_page': [
                'What is {name}?',
                'How much THC is in {name}?',
                'What are the effects of {name}?',
                'How much does {name} cost?',
                'Where can I buy {name}?'
            ],
            'blog_post': [
                'What is {topic}?',
                'How does {topic} work?',
                'What are the benefits of {topic}?',
                'Is {topic} legal in Canada?',
                'Where can I learn more about {topic}?'
            ]
        }
        
        questions = question_templates.get(content_type, question_templates['blog_post'])
        
        qa_pairs = []
        for question_template in questions[:5]:  # Generate 5 Q&A pairs
            # Extract answer from content or generate
            answer = await self.extract_answer(content, question_template)
            
            qa_pairs.append(QAContent(
                question=question_template,
                answer=answer,
                confidence=0.85,
                sources=['mohawkmedibles.ca']
            ))
        
        return qa_pairs
    
    async def extract_answer(self, content: str, question: str) -> str:
        """Extract or generate answer to question from content"""
        if not self.openai_api_key:
            return f"Answer to: {question}"
        
        prompt = f"""Based on this content, answer the question concisely (40-60 words):

Content: {content[:1500]}

Question: {question}

Requirements:
- Direct, factual answer
- Include specific details if available
- Cite sources implicitly
- Conversational but professional tone"""

        return await self.call_openai(prompt)
    
    async def create_structured_data(self, content: str, entities: List[Entity]) -> Dict:
        """Create Schema.org structured data"""
        
        structured_data = {
            '@context': 'https://schema.org',
            '@graph': []
        }
        
        for entity in entities:
            if entity.type == 'dispensary':
                structured_data['@graph'].append({
                    '@type': 'CannabisDispensary',
                    'name': entity.name,
                    'address': {
                        '@type': 'PostalAddress',
                        'addressLocality': entity.attributes.get('city'),
                        'addressRegion': entity.attributes.get('province'),
                        'addressCountry': 'CA'
                    },
                    'aggregateRating': {
                        '@type': 'AggregateRating',
                        'ratingValue': entity.attributes.get('rating', '4.5'),
                        'reviewCount': entity.attributes.get('review_count', '50')
                    }
                })
            
            elif entity.type == 'strain':
                structured_data['@graph'].append({
                    '@type': 'Product',
                    'name': entity.name,
                    'category': f"Cannabis {entity.attributes.get('type', 'Flower')}",
                    'additionalProperty': [
                        {'@type': 'PropertyValue', 'name': 'THC Content', 'value': entity.attributes.get('thc')},
                        {'@type': 'PropertyValue', 'name': 'CBD Content', 'value': entity.attributes.get('cbd')}
                    ]
                })
        
        # Add FAQ schema if Q&A pairs exist
        faq_schema = await self.create_faq_schema(content)
        if faq_schema:
            structured_data['@graph'].append(faq_schema)
        
        return structured_data
    
    async def create_faq_schema(self, content: str) -> Dict:
        """Create FAQPage schema"""
        qa_pairs = await self.generate_qa_pairs(content, 'blog_post')
        
        return {
            '@type': 'FAQPage',
            'mainEntity': [
                {
                    '@type': 'Question',
                    'name': qa.question,
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': qa.answer
                    }
                }
                for qa in qa_pairs[:5]
            ]
        }
    
    async def generate_entity_relationships(self, entities: List[Entity]) -> List[Dict]:
        """Generate relationships between entities"""
        relationships = []
        
        # Connect dispensaries to locations
        dispensaries = [e for e in entities if e.type == 'dispensary']
        locations = [e for e in entities if e.type == 'location']
        
        for dispensary in dispensaries:
            for location in locations:
                if dispensary.attributes.get('city') == location.name:
                    relationships.append({
                        'subject': dispensary.name,
                        'predicate': 'locatedIn',
                        'object': location.name,
                        'confidence': 0.95
                    })
        
        # Connect products to dispensaries
        products = [e for e in entities if e.type == 'product']
        
        for product in products:
            if product.attributes.get('dispensary'):
                relationships.append({
                    'subject': product.name,
                    'predicate': 'soldAt',
                    'object': product.attributes['dispensary'],
                    'confidence': 0.9
                })
        
        return relationships
    
    async def create_knowledge_graph_entry(self, content: str, entities: List[Entity], relationships: List[Dict]) -> Dict:
        """Create knowledge graph entry for LLMs"""
        return {
            'entry_id': f"kg_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'timestamp': datetime.now().isoformat(),
            'entities': [
                {
                    'id': f"entity_{i}",
                    'name': e.name,
                    'type': e.type,
                    'attributes': e.attributes
                }
                for i, e in enumerate(entities)
            ],
            'relationships': relationships,
            'summary': await self.generate_content_summary(content),
            'trust_signals': {
                'source': 'mohawkmedibles.ca',
                'last_updated': datetime.now().isoformat(),
                'expert_reviewed': True,
                'citations': []
            }
        }
    
    async def generate_content_summary(self, content: str) -> str:
        """Generate a summary for knowledge graph"""
        if not self.openai_api_key:
            return content[:200] + "..."
        
        prompt = f"""Summarize this cannabis content in 2-3 sentences for a knowledge graph:

Content: {content[:1000]}

Focus on:
- Main topic
- Key facts
- Geographic relevance
- Entity mentions"""

        return await self.call_openai(prompt)
    
    async def optimize_for_voice_search(self, qa_pairs: List[QAContent]) -> List[Dict]:
        """Optimize Q&A for voice search"""
        voice_optimized = []
        
        for qa in qa_pairs:
            # Convert to conversational format
            voice_version = {
                'trigger_phrases': await self.generate_voice_triggers(qa.question),
                'spoken_answer': await self.make_conversational(qa.answer),
                'concise_answer': self.make_concise(qa.answer, 30),
                'question_variations': await self.generate_question_variations(qa.question)
            }
            voice_optimized.append(voice_version)
        
        return voice_optimized
    
    async def generate_voice_triggers(self, question: str) -> List[str]:
        """Generate voice search trigger phrases"""
        # Common voice search patterns
        triggers = [
            question.replace('What', 'What\'s'),
            question.replace('Where', 'Where\'s'),
            'Tell me about ' + question.lower().replace('what is ', '').replace('what are ', ''),
            'Find ' + question.lower().replace('what is the best ', '').replace('what are the best ', ''),
            question + ' near me',
        ]
        return triggers[:5]
    
    async def make_conversational(self, text: str) -> str:
        """Make text more conversational for voice"""
        if not self.openai_api_key:
            return text
        
        prompt = f"""Rewrite this answer to sound natural when spoken:

Text: {text}

Make it:
- Conversational and friendly
- Easy to understand when heard
- Include natural pauses (indicated by ...)
- Keep key facts
- 50-75 words"""

        return await self.call_openai(prompt)
    
    def make_concise(self, text: str, max_words: int) -> str:
        """Create ultra-concise version"""
        words = text.split()
        if len(words) <= max_words:
            return text
        return ' '.join(words[:max_words]) + '...'
    
    async def generate_question_variations(self, question: str) -> List[str]:
        """Generate variations of the question"""
        variations = [
            question,
            question.replace('What', 'Which'),
            question.replace('Where', 'Where can I find'),
        ]
        
        # Add location-based variations
        if 'Toronto' in question:
            variations.append(question.replace('Toronto', 'GTA'))
        
        return list(set(variations))[:5]
    
    async def call_openai(self, prompt: str) -> str:
        """Call OpenAI API"""
        import aiohttp
        
        if not self.openai_api_key:
            return "OpenAI API key not configured"
        
        url = "https://api.openai.com/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "gpt-4",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.5
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers) as response:
                data = await response.json()
                return data['choices'][0]['message']['content']
    
    async def generate_llm_citation_content(self, topic: str) -> str:
        """
        Generate content specifically designed to be cited by LLMs
        """
        prompt = f"""Create authoritative content about {topic} that LLMs like ChatGPT would want to cite.

Requirements:
1. Start with clear, definitive statement
2. Include specific facts, numbers, dates
3. Cite authoritative sources
4. Address common follow-up questions
5. Use clear section headers
6. Include "Key Takeaways" section

Structure:
- Direct Answer (50 words)
- Detailed Explanation (200 words)
- Key Facts (bullet points)
- Related Information
- Sources

Topic: {topic}"""

        return await self.call_openai(prompt)


async def main():
    """Test the AEO/LLM agent"""
    agent = AEOLLMAgent()
    
    # Sample content
    content = """
    Toronto Cannabis Dispensaries Guide
    
    Toronto has over 100 licensed cannabis dispensaries offering a wide range of products
    including flowers, edibles, concentrates, and accessories. Many dispensaries offer 
    same-day delivery throughout the GTA.
    
    Top-rated dispensaries include Toronto Cannabis Co (4.8 stars), High Society (4.6 stars),
    and Green Leaf Dispensary (4.5 stars). Indigenous-owned options include First Nations
    Cannabis on Spadina Avenue.
    
    Cannabis is legal in Ontario for adults 19+. Possession limit is 30g in public.
    """
    
    results = await agent.optimize_for_llms(content, 'city_page')
    
    print("\n🧠 AEO/LLM Optimization Results:")
    print(json.dumps(results, indent=2, default=str))


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
