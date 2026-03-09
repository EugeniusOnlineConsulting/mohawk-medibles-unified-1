"""
Mohawk Medibles SEO Agent v1.0 - Agent Module

Available Agents:
- SEOAgent: 8-Dimensional SEO Analysis
- ComplianceAgent: Canadian Cannabis Act Compliance
- VisionAgent: Image Analysis & Alt Text Optimization
- SelfAnnealingAgent: Automatic Self-Optimization
- RalphWiggumAgent: Chaos Controller

D.O.E. Framework: Design → Orchestration → Execution
"""

from .seo_agent import SEOAgent
from .compliance_agent import ComplianceAgent
from .vision_agent import VisionAgent
from .self_annealing_agent import SelfAnnealingAgent, get_self_annealing_agent
from .ralph_wiggum_agent import RalphWiggumAgent, get_ralph_wiggum_agent

__all__ = [
    'SEOAgent',
    'ComplianceAgent',
    'VisionAgent',
    'SelfAnnealingAgent',
    'get_self_annealing_agent',
    'RalphWiggumAgent',
    'get_ralph_wiggum_agent'
]
