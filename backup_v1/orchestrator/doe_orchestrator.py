"""
D.O.E. Orchestrator - Design, Orchestration, Execution Framework
================================================================
Production-ready workflow orchestration for MohawkMedibles SEO Agent.

Version: 2.1
Framework: D.O.E. (Design → Orchestration → Execution)
Features: Self-Annealing, Quality Gates, Automatic Optimization, Ralph Wiggum Chaos Control

This module ensures consistent quality output across all SEO workflows.

Architecture:
┌─────────────────────────────────────────────────────────────────┐
│                    D.O.E. + ANNEALING + RALPH                   │
├─────────────────────────────────────────────────────────────────┤
│  DESIGN → ORCHESTRATION → EXECUTION                             │
│       ↓            ↓             ↓                              │
│  ┌─────────────────────────────────────────────────────┐        │
│  │           SELF-ANNEALING LAYER                       │        │
│  │  MONITOR → ANALYZE → OPTIMIZE → HEAL                 │        │
│  └─────────────────────────────────────────────────────┘        │
│                         ↓                                        │
│  ┌─────────────────────────────────────────────────────┐        │
│  │     RALPH WIGGUM LAYER (Chaos Controller)            │        │
│  │  PROBE → CHALLENGE → MUTATE → ESCAPE                 │        │
│  └─────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
"""

import asyncio
from typing import Dict, List, Any, Optional, Callable, Literal
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import hashlib
import json


class ExecutionStatus(Enum):
    """Workflow execution status."""
    SUCCESS = "success"
    PARTIAL = "partial"
    DEGRADED = "degraded"
    FAILED = "failed"


@dataclass
class QualityGateConfig:
    """Configuration for quality gates in D.O.E. workflows."""
    name: str
    min_score: float = 7.0
    required_fields: List[str] = field(default_factory=list)
    max_retries: int = 2

    def evaluate(self, output: Dict) -> Dict:
        """Evaluate output against quality standards."""
        issues = []
        score = 0

        # Check required fields
        for field_name in self.required_fields:
            if field_name in output and output[field_name]:
                score += 1
            else:
                issues.append(f"Missing: {field_name}")

        # Check quality score
        if "quality_score" in output:
            if output["quality_score"] >= self.min_score:
                score += 5
            else:
                issues.append(f"Quality {output['quality_score']} < {self.min_score}")

        passed = len(issues) == 0

        return {
            "passed": passed,
            "score": score,
            "issues": issues,
            "recommendation": "proceed" if passed else "retry"
        }


@dataclass
class WorkflowDesign:
    """
    DESIGN phase configuration.
    Defines WHAT we're building and standards to meet.
    """
    name: str
    version: str
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]
    quality_gates: List[QualityGateConfig] = field(default_factory=list)
    sla_timeout_ms: int = 60000
    cost_budget_usd: float = 1.0
    description: str = ""


@dataclass
class WorkflowOrchestration:
    """
    ORCHESTRATION phase configuration.
    Defines HOW agents work together.
    """
    pattern: Literal["sequential", "parallel", "router", "evaluator_loop"]
    agents: List[Any]  # List of agent instances
    fallback_handler: Optional[Callable] = None
    retry_count: int = 2
    parallel_limit: int = 5


@dataclass
class ExecutionMetrics:
    """Metrics collected during EXECUTION phase."""
    workflow_name: str
    execution_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: ExecutionStatus = ExecutionStatus.SUCCESS
    latency_ms: int = 0
    tokens_used: int = 0
    cost_usd: float = 0.0
    quality_score: float = 0.0
    retries: int = 0
    agent_trace: List[Dict] = field(default_factory=list)

    def to_dict(self) -> Dict:
        return {
            "workflow": self.workflow_name,
            "execution_id": self.execution_id,
            "status": self.status.value,
            "latency_ms": self.latency_ms,
            "tokens_used": self.tokens_used,
            "cost_usd": self.cost_usd,
            "quality_score": self.quality_score,
            "retries": self.retries
        }


class DOEOrchestrator:
    """
    D.O.E. Framework Orchestrator for MohawkMedibles SEO Agent

    Implements the three pillars:
    1. DESIGN: Validate inputs/outputs against schemas
    2. ORCHESTRATION: Route and coordinate agent execution
    3. EXECUTION: Run with quality gates and fallbacks

    Plus Self-Annealing:
    4. ANNEALING: Automatic optimization and self-healing

    Usage:
        orchestrator = DOEOrchestrator()
        orchestrator.register_workflow(design, orchestration)
        result = await orchestrator.execute("workflow_name", input_data)
    """

    def __init__(self, enable_annealing: bool = True, enable_ralph: bool = True):
        self.workflows: Dict[str, Dict] = {}
        self.metrics_store: List[ExecutionMetrics] = []
        self.cache: Dict[str, Dict] = {}
        self.enable_annealing = enable_annealing
        self.enable_ralph = enable_ralph
        self._annealing_agent = None
        self._ralph_agent = None

        print("🎯 D.O.E. Orchestrator initialized (Design → Orchestration → Execution)")
        if enable_annealing:
            print("🔥 Self-Annealing enabled")
        if enable_ralph:
            print("🧠 Ralph Wiggum Chaos Controller enabled")

    @property
    def annealing_agent(self):
        """Lazy-load self-annealing agent."""
        if self._annealing_agent is None and self.enable_annealing:
            try:
                from agents.self_annealing_agent import get_self_annealing_agent
                self._annealing_agent = get_self_annealing_agent()
            except ImportError:
                print("⚠️ Self-annealing agent not available")
        return self._annealing_agent

    @property
    def ralph_agent(self):
        """Lazy-load Ralph Wiggum chaos controller."""
        if self._ralph_agent is None and self.enable_ralph:
            try:
                from agents.ralph_wiggum_agent import get_ralph_wiggum_agent
                self._ralph_agent = get_ralph_wiggum_agent()
            except ImportError:
                print("⚠️ Ralph Wiggum agent not available")
        return self._ralph_agent

    def register_workflow(
        self,
        design: WorkflowDesign,
        orchestration: WorkflowOrchestration
    ):
        """Register a D.O.E. workflow."""

        self.workflows[design.name] = {
            "design": design,
            "orchestration": orchestration
        }

        print(f"📋 Registered workflow: {design.name} v{design.version}")

    async def execute(
        self,
        workflow_name: str,
        input_data: Dict,
        use_cache: bool = True
    ) -> Dict:
        """
        Execute a D.O.E. workflow.

        Args:
            workflow_name: Name of registered workflow
            input_data: Input data matching design schema
            use_cache: Whether to use cached results for identical inputs

        Returns:
            Standardized output with status, result, and metadata
        """

        if workflow_name not in self.workflows:
            return {
                "status": ExecutionStatus.FAILED.value,
                "error": f"Unknown workflow: {workflow_name}"
            }

        workflow = self.workflows[workflow_name]
        design: WorkflowDesign = workflow["design"]
        orchestration: WorkflowOrchestration = workflow["orchestration"]

        # Initialize metrics
        execution_id = hashlib.md5(
            f"{workflow_name}:{datetime.now().isoformat()}".encode()
        ).hexdigest()[:12]

        metrics = ExecutionMetrics(
            workflow_name=workflow_name,
            execution_id=execution_id,
            start_time=datetime.now()
        )

        print(f"🚀 Executing {workflow_name} [{execution_id}]")

        try:
            # PHASE 1: DESIGN VALIDATION
            validation = self._validate_input(input_data, design.input_schema)
            if not validation["valid"]:
                return self._build_response(
                    ExecutionStatus.FAILED,
                    error=f"Input validation failed: {validation['issues']}",
                    metrics=metrics
                )

            # Check cache
            cache_key = self._compute_cache_key(workflow_name, input_data)
            if use_cache and cache_key in self.cache:
                print(f"📦 Cache hit for {workflow_name}")
                cached = self.cache[cache_key]
                cached["from_cache"] = True
                return cached

            # PHASE 2: ORCHESTRATION
            if orchestration.pattern == "sequential":
                result = await self._execute_sequential(
                    orchestration.agents,
                    input_data,
                    design.quality_gates,
                    orchestration.retry_count,
                    metrics
                )
            elif orchestration.pattern == "parallel":
                result = await self._execute_parallel(
                    orchestration.agents,
                    input_data,
                    orchestration.parallel_limit,
                    metrics
                )
            elif orchestration.pattern == "evaluator_loop":
                result = await self._execute_evaluator_loop(
                    orchestration.agents,
                    input_data,
                    design.quality_gates,
                    orchestration.retry_count,
                    metrics
                )
            else:
                result = {"error": f"Unknown pattern: {orchestration.pattern}"}

            # PHASE 3: EXECUTION COMPLETION
            output_validation = self._validate_output(result, design.output_schema)
            if not output_validation["valid"]:
                result["output_warnings"] = output_validation["issues"]

            # Determine final status
            if result.get("status") == "failed":
                status = ExecutionStatus.FAILED
            elif result.get("output_warnings"):
                status = ExecutionStatus.PARTIAL
            elif metrics.retries > 0:
                status = ExecutionStatus.DEGRADED
            else:
                status = ExecutionStatus.SUCCESS

            response = self._build_response(status, result=result, metrics=metrics)

            # Cache successful results
            if use_cache and status in [ExecutionStatus.SUCCESS, ExecutionStatus.PARTIAL]:
                self.cache[cache_key] = response

            return response

        except asyncio.TimeoutError:
            print(f"⏰ Timeout executing {workflow_name}")
            if orchestration.fallback_handler:
                result = await orchestration.fallback_handler(input_data)
                return self._build_response(ExecutionStatus.DEGRADED, result=result, metrics=metrics)
            return self._build_response(ExecutionStatus.FAILED, error="Timeout", metrics=metrics)

        except Exception as e:
            print(f"❌ Error executing {workflow_name}: {e}")
            if orchestration.fallback_handler:
                result = await orchestration.fallback_handler(input_data)
                return self._build_response(ExecutionStatus.DEGRADED, result=result, metrics=metrics)
            return self._build_response(ExecutionStatus.FAILED, error=str(e), metrics=metrics)

        finally:
            metrics.end_time = datetime.now()
            metrics.latency_ms = int((metrics.end_time - metrics.start_time).total_seconds() * 1000)
            self.metrics_store.append(metrics)
            print(f"✅ Completed {workflow_name} [{execution_id}] in {metrics.latency_ms}ms")

            # PHASE 4: SELF-ANNEALING
            if self.enable_annealing and self.annealing_agent:
                try:
                    # Record execution for learning
                    self.annealing_agent.record_execution(response, input_data)

                    # Check if healing is needed
                    if self.annealing_agent.should_heal():
                        print("🏥 Triggering auto-heal...")
                        heal_result = self.annealing_agent.heal()
                        if heal_result.get("status") == "healed":
                            # Clear cache as part of healing
                            self.cache.clear()
                            print("   🗑️ Cache cleared")

                    # Check if optimization is needed
                    if self.annealing_agent.should_optimize():
                        print("🔧 Triggering auto-optimization...")
                        suggestions = self.annealing_agent.get_optimization_suggestions()
                        if suggestions:
                            self.annealing_agent.apply_optimizations(suggestions)
                except Exception as e:
                    print(f"⚠️ Annealing error (non-fatal): {e}")

            # PHASE 5: RALPH WIGGUM CHAOS CONTROL
            if self.enable_ralph and self.ralph_agent:
                try:
                    # Get annealing metrics for Ralph's assessment
                    annealing_metrics = {}
                    temperature = 0.5
                    if self.enable_annealing and self.annealing_agent:
                        annealing_metrics = self.annealing_agent.get_metrics_summary()
                        temperature = annealing_metrics.get("temperature", 0.5)

                    # Ralph assesses the situation
                    assessment = self.ralph_agent.assess_situation(
                        metrics=annealing_metrics,
                        annealing_temperature=temperature,
                        current_params=input_data
                    )

                    # Execute Ralph's recommended action if needed
                    if assessment["mode"].value != "observe":
                        print(f"🧠 Ralph recommends: {assessment['mode'].value}")
                        print(f"   Reason: {assessment['reason']}")

                        if assessment["mode"].value == "escape":
                            escape_result = self.ralph_agent.escape(
                                input_data,
                                self.annealing_agent
                            )
                            # Boost annealing temperature during escape
                            if self.annealing_agent:
                                self.annealing_agent.temperature = min(
                                    1.0,
                                    self.annealing_agent.temperature * 2
                                )
                            self.cache.clear()
                            print(f"   🚀 Escape executed: {escape_result['ralph_says']}")

                        elif assessment["mode"].value == "challenge":
                            challenges = self.ralph_agent.challenge(annealing_metrics)
                            for c in challenges[:2]:
                                print(f"   ❓ {c.question}")
                                print(f"      → {c.recommendation}")

                        elif assessment["mode"].value == "probe":
                            probes = self.ralph_agent.probe(input_data)
                            print(f"   🔍 Probed {len(probes)} parameters")

                        elif assessment["mode"].value == "mutate":
                            mutations = self.ralph_agent.mutate(input_data)
                            accepted = [m for m in mutations if m.accepted]
                            print(f"   🎲 Applied {len(accepted)} mutations")

                except Exception as e:
                    print(f"⚠️ Ralph error (non-fatal): {e}")

    async def _execute_sequential(
        self,
        agents: List,
        initial_input: Dict,
        quality_gates: List[QualityGateConfig],
        max_retries: int,
        metrics: ExecutionMetrics
    ) -> Dict:
        """Execute agents in sequence, passing output to next input."""

        result = initial_input
        default_gate = QualityGateConfig(name="default")

        for i, agent in enumerate(agents):
            agent_name = getattr(agent, 'name', agent.__class__.__name__)
            step_start = datetime.now()

            try:
                result = await agent.execute(result) if hasattr(agent, 'execute') else await agent(result)

                step_latency = (datetime.now() - step_start).total_seconds() * 1000
                metrics.agent_trace.append({
                    "agent": agent_name,
                    "step": i + 1,
                    "latency_ms": step_latency,
                    "status": "success"
                })

                if i < len(agents) - 1 and quality_gates:
                    gate = quality_gates[min(i, len(quality_gates) - 1)] if quality_gates else default_gate
                    gate_result = gate.evaluate(result)

                    if not gate_result["passed"]:
                        for retry in range(max_retries):
                            metrics.retries += 1
                            print(f"🔄 Retrying {agent_name} (attempt {retry + 1})")
                            result = await agent.execute(result) if hasattr(agent, 'execute') else await agent(result)
                            if gate.evaluate(result)["passed"]:
                                break

            except Exception as e:
                print(f"Agent {agent_name} failed: {e}")
                metrics.agent_trace.append({
                    "agent": agent_name,
                    "step": i + 1,
                    "status": "failed",
                    "error": str(e)
                })
                result["status"] = "failed"
                result["failed_at"] = agent_name
                break

        return result

    async def _execute_parallel(
        self,
        agents: List,
        input_data: Dict,
        parallel_limit: int,
        metrics: ExecutionMetrics
    ) -> Dict:
        """Execute agents in parallel, merge results."""

        semaphore = asyncio.Semaphore(parallel_limit)

        async def run_with_limit(agent):
            async with semaphore:
                try:
                    return await agent.execute(input_data) if hasattr(agent, 'execute') else await agent(input_data)
                except Exception as e:
                    return {"error": str(e), "agent": getattr(agent, 'name', 'unknown')}

        results = await asyncio.gather(*[run_with_limit(a) for a in agents])

        merged = {"parallel_results": results, "status": "success"}
        for r in results:
            if isinstance(r, dict):
                if r.get("error"):
                    merged["status"] = "partial"
                merged.update({k: v for k, v in r.items() if k not in merged})

        return merged

    async def _execute_evaluator_loop(
        self,
        agents: List,
        input_data: Dict,
        quality_gates: List[QualityGateConfig],
        max_iterations: int,
        metrics: ExecutionMetrics
    ) -> Dict:
        """Execute with evaluation loop until quality passes."""

        generator = agents[0]
        evaluator = agents[1] if len(agents) > 1 else None
        gate = quality_gates[0] if quality_gates else QualityGateConfig(name="default")

        result = input_data

        for iteration in range(max_iterations):
            result = await generator.execute(result) if hasattr(generator, 'execute') else await generator(result)

            if evaluator:
                eval_result = await evaluator.execute(result) if hasattr(evaluator, 'execute') else await evaluator(result)
                result.update(eval_result)

            gate_result = gate.evaluate(result)
            if gate_result["passed"]:
                break

            metrics.retries += 1
            print(f"🔄 Iteration {iteration + 1}: Quality not met, retrying...")

        return result

    def _validate_input(self, data: Dict, schema: Dict) -> Dict:
        """Validate input against design schema."""
        issues = []

        for field_name, field_type in schema.items():
            if "(required)" in str(field_type) and field_name not in data:
                issues.append(f"Missing required field: {field_name}")

        return {"valid": len(issues) == 0, "issues": issues}

    def _validate_output(self, data: Dict, schema: Dict) -> Dict:
        """Validate output against design schema."""
        issues = []

        for field_name, field_type in schema.items():
            if "(required)" in str(field_type) and field_name not in data:
                issues.append(f"Missing output field: {field_name}")

        return {"valid": len(issues) == 0, "issues": issues}

    def _compute_cache_key(self, workflow_name: str, input_data: Dict) -> str:
        """Compute cache key for input data."""
        content = f"{workflow_name}:{json.dumps(input_data, sort_keys=True)}"
        return hashlib.md5(content.encode()).hexdigest()

    def _build_response(
        self,
        status: ExecutionStatus,
        result: Dict = None,
        error: str = None,
        metrics: ExecutionMetrics = None
    ) -> Dict:
        """Build standardized response."""

        response = {
            "status": status.value,
            "timestamp": datetime.now().isoformat()
        }

        if result:
            response["result"] = result

        if error:
            response["error"] = error

        if metrics:
            response["metadata"] = {
                "execution_id": metrics.execution_id,
                "latency_ms": metrics.latency_ms,
                "retries": metrics.retries,
                "agent_trace": metrics.agent_trace
            }

        return response

    def get_metrics_summary(self) -> Dict:
        """Get summary of execution metrics."""

        if not self.metrics_store:
            return {"message": "No executions recorded"}

        total = len(self.metrics_store)
        success = sum(1 for m in self.metrics_store if m.status == ExecutionStatus.SUCCESS)
        avg_latency = sum(m.latency_ms for m in self.metrics_store) / total

        summary = {
            "total_executions": total,
            "success_rate": f"{(success / total) * 100:.1f}%",
            "avg_latency_ms": int(avg_latency),
            "total_cost_usd": sum(m.cost_usd for m in self.metrics_store)
        }

        # Add annealing metrics if available
        if self.enable_annealing and self.annealing_agent:
            annealing_metrics = self.annealing_agent.get_metrics_summary()
            summary["annealing"] = {
                "temperature": annealing_metrics.get("temperature", 0),
                "best_score": annealing_metrics.get("best_score", 0),
                "consecutive_failures": annealing_metrics.get("consecutive_failures", 0)
            }

        return summary

    def get_annealing_status(self) -> Dict:
        """Get self-annealing status and suggestions."""
        if not self.enable_annealing or not self.annealing_agent:
            return {"enabled": False, "message": "Self-annealing is disabled"}

        status = {
            "enabled": True,
            "metrics": self.annealing_agent.get_metrics_summary(),
            "should_optimize": self.annealing_agent.should_optimize(),
            "should_heal": self.annealing_agent.should_heal(),
            "suggestions": [
                {
                    "parameter": s.parameter,
                    "current": s.current_value,
                    "suggested": s.suggested_value,
                    "confidence": s.confidence,
                    "reason": s.reason
                }
                for s in self.annealing_agent.get_optimization_suggestions()
            ],
            "optimized_config": self.annealing_agent.get_optimized_config()
        }

        return status

    def trigger_optimization(self, confidence_threshold: float = 0.6) -> Dict:
        """Manually trigger optimization."""
        if not self.enable_annealing or not self.annealing_agent:
            return {"success": False, "message": "Self-annealing is disabled"}

        suggestions = self.annealing_agent.get_optimization_suggestions()
        result = self.annealing_agent.apply_optimizations(suggestions, confidence_threshold)

        return {
            "success": True,
            "applied": result.get("applied", []),
            "skipped": result.get("skipped", []),
            "temperature": result.get("temperature", 0)
        }

    def trigger_heal(self) -> Dict:
        """Manually trigger healing."""
        if not self.enable_annealing or not self.annealing_agent:
            return {"success": False, "message": "Self-annealing is disabled"}

        # Clear cache
        self.cache.clear()

        # Trigger heal
        return self.annealing_agent.heal()

    def clear_cache(self) -> Dict:
        """Clear the execution cache."""
        count = len(self.cache)
        self.cache.clear()
        return {"cleared": count}

    def get_ralph_status(self) -> Dict:
        """Get Ralph Wiggum chaos controller status."""
        if not self.enable_ralph or not self.ralph_agent:
            return {"enabled": False, "message": "Ralph Wiggum is disabled"}

        return {
            "enabled": True,
            "summary": self.ralph_agent.get_experiment_summary(),
            "mode": self.ralph_agent.mode.value,
            "chaos_intensity": self.ralph_agent.config.chaos_intensity
        }

    def trigger_ralph_action(self, action: str, params: Dict = None) -> Dict:
        """Manually trigger a Ralph action."""
        if not self.enable_ralph or not self.ralph_agent:
            return {"success": False, "message": "Ralph Wiggum is disabled"}

        params = params or {}

        if action == "probe":
            results = self.ralph_agent.probe(params)
            return {
                "success": True,
                "action": "probe",
                "results": [{"param": r.parameter, "probed": r.probed_values} for r in results]
            }
        elif action == "challenge":
            results = self.ralph_agent.challenge(params)
            return {
                "success": True,
                "action": "challenge",
                "results": [{"assumption": r.assumption, "validity": r.validity} for r in results]
            }
        elif action == "mutate":
            results = self.ralph_agent.mutate(params)
            return {
                "success": True,
                "action": "mutate",
                "results": [{"param": r.parameter, "accepted": r.accepted} for r in results]
            }
        elif action == "escape":
            result = self.ralph_agent.escape(params, self.annealing_agent)
            return {
                "success": True,
                "action": "escape",
                "result": result
            }
        else:
            return {"success": False, "error": f"Unknown action: {action}"}

    def adjust_ralph_chaos(self, direction: str, amount: float = 0.1) -> Dict:
        """Adjust Ralph's chaos intensity."""
        if not self.enable_ralph or not self.ralph_agent:
            return {"success": False, "message": "Ralph Wiggum is disabled"}

        new_intensity = self.ralph_agent.adjust_chaos(direction, amount)
        return {
            "success": True,
            "chaos_intensity": new_intensity,
            "direction": direction
        }

    def get_full_status(self) -> Dict:
        """Get combined status of DOE, Annealing, and Ralph."""
        return {
            "doe": {
                "workflows_registered": len(self.workflows),
                "executions_total": len(self.metrics_store),
                "cache_size": len(self.cache)
            },
            "annealing": self.get_annealing_status() if self.enable_annealing else {"enabled": False},
            "ralph": self.get_ralph_status() if self.enable_ralph else {"enabled": False},
            "metrics": self.get_metrics_summary()
        }


# Singleton instance
_doe_orchestrator = None

def get_doe_orchestrator(
    enable_annealing: bool = True,
    enable_ralph: bool = True
) -> DOEOrchestrator:
    """Get singleton DOE Orchestrator instance."""
    global _doe_orchestrator
    if _doe_orchestrator is None:
        _doe_orchestrator = DOEOrchestrator(
            enable_annealing=enable_annealing,
            enable_ralph=enable_ralph
        )
    return _doe_orchestrator
