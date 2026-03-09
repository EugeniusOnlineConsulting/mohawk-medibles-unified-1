# CLAUDE.md - MohawkMedibles SEO Agent v1.0

## Project Overview

**MohawkMedibles SEO Agent v1.0** - A D.O.E. Framework compliant AI agent for optimizing SEO on mohawkmedibles.ca hosted on WP Engine.

**Framework:** D.O.E. (Design → Orchestration → Execution) + Self-Annealing + Ralph Wiggum
**Version:** 1.0
**Created:** 2025-12-31
**Environment:** Staging (mohawkmedibstg.wpengine.com)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    MOHAWK MEDIBLES SEO AGENT v1.0                               │
│═════════════════════════════════════════════════════════════════════════════════│
│                                                                                  │
│   ┌───────────────┐     ┌────────────────────┐     ┌──────────────────┐         │
│   │    DESIGN     │ ──▶ │   ORCHESTRATION    │ ──▶ │    EXECUTION     │         │
│   │               │     │                    │     │                  │         │
│   │  • Schemas    │     │  • Agent Pipeline  │     │  • Quality Gates │         │
│   │  • Standards  │     │  • Flow Patterns   │     │  • Fallbacks     │         │
│   │  • SLAs       │     │  • Retry Logic     │     │  • Metrics       │         │
│   └───────────────┘     └────────────────────┘     └──────────────────┘         │
│                                   │                          │                   │
│                                   ▼                          ▼                   │
│   ┌──────────────────────────────────────────────────────────────────┐          │
│   │                     SELF-ANNEALING LAYER                          │          │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │          │
│   │  │   MONITOR   │─▶│   ANALYZE   │─▶│  OPTIMIZE   │─▶│   HEAL   │ │          │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘ │          │
│   └──────────────────────────────────────────────────────────────────┘          │
│                                   │                                              │
│                                   ▼                                              │
│   ┌──────────────────────────────────────────────────────────────────┐          │
│   │               🧠 RALPH WIGGUM LAYER (Chaos Controller)            │          │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │          │
│   │  │   PROBE     │  │  CHALLENGE  │  │   MUTATE    │  │  ESCAPE  │ │          │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘ │          │
│   └──────────────────────────────────────────────────────────────────┘          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Run Continuous Mode (Staging)

```bash
cd /Users/eugeneagyemang/MohawkMedibles_SEO_v1.0
python3 scripts/run_agent.py --mode continuous --limit 20
```

### Analyze Single Product

```bash
python3 scripts/run_agent.py --mode single --product-id 12345
```

### Check Agent Status

```bash
python3 scripts/run_agent.py --mode status
```

---

## Project Structure

```
MohawkMedibles_SEO_v1.0/
├── CLAUDE.md                    # This file
├── agents/
│   ├── __init__.py
│   ├── seo_agent.py             # 8-Dimensional SEO Analysis
│   ├── compliance_agent.py      # Canadian Cannabis Act Compliance
│   ├── vision_agent.py          # Image Analysis & Alt Text
│   ├── self_annealing_agent.py  # Self-Optimization
│   └── ralph_wiggum_agent.py    # Chaos Controller
├── orchestrator/
│   ├── __init__.py
│   └── doe_orchestrator.py      # D.O.E. Framework
├── configs/
│   └── credentials.json         # SSH & API Configuration
├── scripts/
│   ├── __init__.py
│   └── run_agent.py             # Unified Runner
├── data/
│   ├── annealing_state.json     # Self-Annealing State
│   └── ralph_state.json         # Ralph Wiggum State
├── backups/                     # Product Backups
├── outputs/                     # Reports & Logs
└── logs/                        # Execution Logs
```

---

## Agent Inventory

### SEOAgent (8-Dimensional Analysis)
- **Title Optimization** (50-60 chars, brand suffix)
- **Meta Description** (150-160 chars, CTA, Canada)
- **Keyword Density** (1-2.5%)
- **Content Balance** (V3.0: 70/12/12/3/3)
- **LSI Keywords** (category-specific)
- **Internal Linking**
- **Schema Readiness**
- **Mobile Optimization**

### ComplianceAgent
- 33 Prohibited terms (cure, treat, heal, etc.)
- Health claim pattern detection
- Provincial shipping rules
- Edible THC limit (10mg max)
- Auto-fix for violations

### VisionAgent
- Product image analysis
- Alt text generation
- Image SEO scoring
- Accessibility compliance

### SelfAnnealingAgent
- Execution monitoring
- Performance optimization
- Automatic healing
- Parameter tuning

### RalphWiggumAgent
- **PROBE:** Random parameter exploration
- **CHALLENGE:** Assumption questioning
- **MUTATE:** Controlled perturbations
- **ESCAPE:** Local optima escape

---

## SSH Configuration

```bash
# Staging (Active)
SSH_KEY="/Users/eugeneagyemang/.ssh/wpengine_ed25519"
SSH_HOST="mohawkmedibstg@mohawkmedibstg.ssh.wpengine.net"
SITE_PATH="/sites/mohawkmedibstg"

# Test Connection
ssh -i $SSH_KEY $SSH_HOST "cd $SITE_PATH && wp post list --post_type=product --posts_per_page=5 --format=json"
```

---

## V3.0 Content Framework

| Content Type | Percentage |
|--------------|------------|
| Product Focus | 70% |
| Medical Benefits | 12% |
| Recreational Benefits | 12% |
| Indigenous Heritage | 3% MAX |
| Business Info | 3% |

---

## Quality Gates

| Gate | Threshold | Action |
|------|-----------|--------|
| Title Length | 50-60 chars | Hard fail if outside |
| Meta Length | 150-160 chars | Warn if outside |
| Content Length | 300+ chars | Hard fail if under |
| SEO Score | 7.0+ | Retry if under |
| Compliance | 100% | Must fix violations |

---

## Continuous Operation Mode

The agent processes **one task at a time** in sequence:

1. Fetch product from WP Engine
2. Create backup before changes
3. Run 8-dimensional SEO analysis
4. Run compliance check
5. Run vision/image analysis
6. Generate optimizations
7. Apply changes (with approval)
8. Record for self-annealing
9. Ralph Wiggum assessment
10. Move to next product

---

## Commands Reference

```bash
# Full continuous run
python3 scripts/run_agent.py --mode continuous --limit 50

# Single product analysis
python3 scripts/run_agent.py --mode single --product-id 87442

# Check status
python3 scripts/run_agent.py --mode status

# Test SEO agent directly
python3 -c "from agents import SEOAgent; print(SEOAgent().analyze_product({'Name': 'Test'}))"

# Test compliance agent
python3 -c "from agents import ComplianceAgent; print(ComplianceAgent().scan_product({'Description': 'This cures pain'}))"

# Test Ralph Wiggum
python3 -c "from agents import get_ralph_wiggum_agent; print(get_ralph_wiggum_agent().get_experiment_summary())"
```

---

## Environment Switching

```json
// In configs/credentials.json
{
    "wpengine": {
        "active_environment": "staging"  // or "production"
    }
}
```

---

## Safety Features

1. **Auto-Backup:** Creates backup before any changes
2. **Staging First:** Default environment is staging
3. **One Task at a Time:** Sequential processing
4. **Compliance Check:** Canadian Cannabis Act enforcement
5. **Quality Gates:** Minimum scores enforced
6. **Audit Trail:** Full logging of all actions

---

## Vision Capabilities

The Vision Agent can:
- Analyze product images for SEO issues
- Generate optimized alt text
- Check image file naming
- Verify image accessibility
- Score image SEO quality

```python
from agents import VisionAgent
agent = VisionAgent({'vision_enabled': True})
result = agent.analyze_product_images(product)
```

---

## Ralph Wiggum Integration

Ralph provides controlled chaos to escape local optima:

```python
from agents import get_ralph_wiggum_agent

ralph = get_ralph_wiggum_agent()

# Check current mode
print(ralph.mode)  # observe, probe, challenge, mutate, escape

# Get assessment
assessment = ralph.assess_situation(metrics, temperature, params)

# Trigger escape if stuck
if assessment['mode'].value == 'escape':
    ralph.escape(params, annealing_agent)
```

---

## References

- D.O.E. Framework: `orchestrator/doe_orchestrator.py`
- Self-Annealing: `agents/self_annealing_agent.py`
- Ralph Wiggum: `agents/ralph_wiggum_agent.py`
- SSH Setup: See credentials.json
