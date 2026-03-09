"""
Self-Annealing Agent for D.O.E. Framework
==========================================
Implements automatic self-optimization and healing capabilities.

Self-Annealing Features:
1. Performance Monitoring - Track execution metrics over time
2. Threshold Adjustment - Auto-tune quality gates based on results
3. Failure Recovery - Learn from failures and adjust strategies
4. Parameter Optimization - Optimize agent parameters for better results
5. Feedback Loop - Continuous improvement cycle

Inspired by simulated annealing: gradually "cool" aggressive parameters
to find optimal configuration over time.
"""

import asyncio
import json
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
import random
import math


@dataclass
class AnnealingConfig:
    """Configuration for self-annealing behavior."""
    # Temperature controls (simulated annealing)
    initial_temperature: float = 1.0
    cooling_rate: float = 0.95
    min_temperature: float = 0.01

    # Learning parameters
    learning_rate: float = 0.1
    memory_size: int = 100  # Number of executions to remember

    # Optimization triggers
    min_executions_before_optimize: int = 5
    optimize_interval_minutes: int = 30

    # Thresholds
    success_rate_threshold: float = 0.8
    latency_threshold_ms: int = 60000
    quality_score_threshold: float = 7.0

    # Auto-healing
    max_consecutive_failures: int = 3
    auto_heal_enabled: bool = True

    # Persistence
    state_file: str = "data/annealing_state.json"


@dataclass
class ExecutionMemory:
    """Memory of past executions for learning."""
    workflow_name: str
    execution_id: str
    timestamp: datetime
    status: str
    latency_ms: int
    quality_score: float
    retries: int
    parameters: Dict[str, Any] = field(default_factory=dict)
    issues: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict:
        return {
            "workflow_name": self.workflow_name,
            "execution_id": self.execution_id,
            "timestamp": self.timestamp.isoformat(),
            "status": self.status,
            "latency_ms": self.latency_ms,
            "quality_score": self.quality_score,
            "retries": self.retries,
            "parameters": self.parameters,
            "issues": self.issues
        }

    @staticmethod
    def from_dict(data: Dict) -> 'ExecutionMemory':
        return ExecutionMemory(
            workflow_name=data["workflow_name"],
            execution_id=data["execution_id"],
            timestamp=datetime.fromisoformat(data["timestamp"]),
            status=data["status"],
            latency_ms=data["latency_ms"],
            quality_score=data["quality_score"],
            retries=data["retries"],
            parameters=data.get("parameters", {}),
            issues=data.get("issues", [])
        )


@dataclass
class OptimizationSuggestion:
    """Suggestion for parameter optimization."""
    parameter: str
    current_value: Any
    suggested_value: Any
    reason: str
    confidence: float
    expected_improvement: float


class SelfAnnealingAgent:
    """
    Self-Annealing Agent that optimizes D.O.E. workflows automatically.

    Key Capabilities:
    1. MONITOR - Track all execution metrics
    2. ANALYZE - Identify patterns in successes/failures
    3. OPTIMIZE - Adjust parameters using simulated annealing
    4. HEAL - Recover from failures automatically
    5. PERSIST - Save learned state for continuity

    Usage:
        annealer = SelfAnnealingAgent()

        # Record execution
        annealer.record_execution(result, parameters)

        # Get optimization suggestions
        suggestions = annealer.get_optimization_suggestions()

        # Apply optimizations
        annealer.apply_optimizations(suggestions)

        # Auto-heal if needed
        if annealer.should_heal():
            annealer.heal()
    """

    name = "self_annealing_agent"

    def __init__(self, config: AnnealingConfig = None):
        self.config = config or AnnealingConfig()
        self.memory: List[ExecutionMemory] = []
        self.temperature = self.config.initial_temperature
        self.consecutive_failures = 0
        self.last_optimization = datetime.now()
        self.parameter_history: Dict[str, List[Any]] = {}
        self.best_parameters: Dict[str, Any] = {}
        self.best_score: float = 0.0

        # Load persisted state
        self._load_state()

        print(f"🔥 Self-Annealing Agent initialized (T={self.temperature:.3f})")

    def record_execution(
        self,
        result: Dict,
        parameters: Dict[str, Any] = None
    ) -> None:
        """Record an execution for learning."""

        # Extract metrics from D.O.E. result
        metadata = result.get("metadata", {})
        report = result.get("result", {}).get("report", {})
        summary = report.get("summary", {})

        memory = ExecutionMemory(
            workflow_name=metadata.get("workflow_name", "unknown"),
            execution_id=metadata.get("execution_id", "unknown"),
            timestamp=datetime.now(),
            status=result.get("status", "unknown"),
            latency_ms=metadata.get("latency_ms", 0),
            quality_score=summary.get("average_seo_score", 0),
            retries=metadata.get("retries", 0),
            parameters=parameters or {},
            issues=report.get("top_issues", [])
        )

        self.memory.append(memory)

        # Trim memory to max size
        if len(self.memory) > self.config.memory_size:
            self.memory = self.memory[-self.config.memory_size:]

        # Track consecutive failures
        if result.get("status") == "failed":
            self.consecutive_failures += 1
            print(f"⚠️ Failure recorded ({self.consecutive_failures} consecutive)")
        else:
            self.consecutive_failures = 0

        # Update best parameters if this was successful
        if result.get("status") == "success":
            score = summary.get("average_seo_score", 0)
            if score > self.best_score:
                self.best_score = score
                self.best_parameters = parameters or {}
                print(f"🏆 New best score: {score:.2f}")

        # Cool down temperature
        self._cool_down()

        # Save state
        self._save_state()

    def get_metrics_summary(self) -> Dict:
        """Get summary of execution metrics."""
        if not self.memory:
            return {"message": "No executions recorded yet"}

        recent = self.memory[-20:]  # Last 20 executions

        success_count = sum(1 for m in recent if m.status == "success")
        avg_latency = sum(m.latency_ms for m in recent) / len(recent)
        avg_quality = sum(m.quality_score for m in recent) / len(recent)
        total_retries = sum(m.retries for m in recent)

        # Issue frequency
        issue_counts = {}
        for m in recent:
            for issue in m.issues:
                key = issue.split("(")[0].strip()
                issue_counts[key] = issue_counts.get(key, 0) + 1

        return {
            "total_executions": len(self.memory),
            "recent_executions": len(recent),
            "success_rate": success_count / len(recent),
            "avg_latency_ms": int(avg_latency),
            "avg_quality_score": round(avg_quality, 2),
            "total_retries": total_retries,
            "temperature": round(self.temperature, 3),
            "consecutive_failures": self.consecutive_failures,
            "top_issues": sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)[:5],
            "best_score": self.best_score
        }

    def should_optimize(self) -> bool:
        """Check if optimization should be triggered."""
        if len(self.memory) < self.config.min_executions_before_optimize:
            return False

        # Check time since last optimization
        minutes_since = (datetime.now() - self.last_optimization).total_seconds() / 60
        if minutes_since < self.config.optimize_interval_minutes:
            return False

        # Check if metrics are below threshold
        metrics = self.get_metrics_summary()
        if metrics.get("success_rate", 1) < self.config.success_rate_threshold:
            return True
        if metrics.get("avg_quality_score", 10) < self.config.quality_score_threshold:
            return True
        if metrics.get("avg_latency_ms", 0) > self.config.latency_threshold_ms:
            return True

        return False

    def get_optimization_suggestions(self) -> List[OptimizationSuggestion]:
        """Generate optimization suggestions based on execution history."""
        suggestions = []
        metrics = self.get_metrics_summary()

        if not self.memory:
            return suggestions

        # Analyze patterns
        recent_failures = [m for m in self.memory[-20:] if m.status == "failed"]
        recent_successes = [m for m in self.memory[-20:] if m.status == "success"]

        # Suggestion 1: Adjust retry count based on failure rate
        if metrics.get("success_rate", 1) < 0.8:
            suggestions.append(OptimizationSuggestion(
                parameter="retry_count",
                current_value=2,
                suggested_value=3,
                reason=f"Success rate {metrics['success_rate']:.0%} below threshold",
                confidence=0.8,
                expected_improvement=0.1
            ))

        # Suggestion 2: Adjust timeout based on latency
        avg_latency = metrics.get("avg_latency_ms", 0)
        if avg_latency > 50000:
            suggestions.append(OptimizationSuggestion(
                parameter="timeout_ms",
                current_value=60000,
                suggested_value=120000,
                reason=f"Average latency {avg_latency}ms is high",
                confidence=0.7,
                expected_improvement=0.15
            ))

        # Suggestion 3: Adjust quality thresholds based on score distribution
        avg_quality = metrics.get("avg_quality_score", 7)
        if avg_quality < 6.5:
            suggestions.append(OptimizationSuggestion(
                parameter="quality_min_score",
                current_value=7.0,
                suggested_value=6.0,
                reason=f"Average quality {avg_quality:.1f} consistently below threshold",
                confidence=0.6,
                expected_improvement=0.2
            ))

        # Suggestion 4: Issue-specific optimizations
        top_issues = metrics.get("top_issues", [])
        for issue, count in top_issues[:3]:
            if "title" in issue.lower() and count > 5:
                suggestions.append(OptimizationSuggestion(
                    parameter="title_min_length",
                    current_value=30,
                    suggested_value=25,
                    reason=f"'{issue}' occurring frequently ({count} times)",
                    confidence=0.5,
                    expected_improvement=0.05
                ))
            elif "meta" in issue.lower() and count > 5:
                suggestions.append(OptimizationSuggestion(
                    parameter="meta_max_length",
                    current_value=160,
                    suggested_value=180,
                    reason=f"'{issue}' occurring frequently ({count} times)",
                    confidence=0.5,
                    expected_improvement=0.05
                ))

        # Apply simulated annealing - add randomness based on temperature
        if self.temperature > 0.1:
            for suggestion in suggestions:
                # Higher temperature = more likely to accept aggressive changes
                perturbation = random.uniform(-0.1, 0.1) * self.temperature
                suggestion.confidence += perturbation
                suggestion.confidence = max(0, min(1, suggestion.confidence))

        return suggestions

    def should_heal(self) -> bool:
        """Check if auto-healing should be triggered."""
        if not self.config.auto_heal_enabled:
            return False
        return self.consecutive_failures >= self.config.max_consecutive_failures

    def heal(self) -> Dict:
        """Perform auto-healing actions."""
        print("🏥 Auto-healing triggered...")

        actions_taken = []

        # Action 1: Reset to best known parameters
        if self.best_parameters:
            actions_taken.append({
                "action": "reset_to_best_parameters",
                "parameters": self.best_parameters
            })
            print(f"   ✅ Reset to best parameters (score: {self.best_score})")

        # Action 2: Increase temperature (allow more exploration)
        old_temp = self.temperature
        self.temperature = min(1.0, self.temperature * 2)
        actions_taken.append({
            "action": "increase_temperature",
            "old_value": old_temp,
            "new_value": self.temperature
        })
        print(f"   ✅ Increased temperature: {old_temp:.3f} → {self.temperature:.3f}")

        # Action 3: Clear failure streak
        self.consecutive_failures = 0
        actions_taken.append({
            "action": "reset_failure_counter"
        })

        # Action 4: Invalidate cache (in orchestrator)
        actions_taken.append({
            "action": "invalidate_cache",
            "recommendation": "Clear DOE orchestrator cache"
        })

        self._save_state()

        return {
            "status": "healed",
            "actions_taken": actions_taken,
            "new_temperature": self.temperature,
            "timestamp": datetime.now().isoformat()
        }

    def apply_optimizations(
        self,
        suggestions: List[OptimizationSuggestion],
        confidence_threshold: float = 0.6
    ) -> Dict:
        """Apply optimization suggestions above confidence threshold."""
        applied = []
        skipped = []

        for suggestion in suggestions:
            if suggestion.confidence >= confidence_threshold:
                # Record parameter change
                if suggestion.parameter not in self.parameter_history:
                    self.parameter_history[suggestion.parameter] = []
                self.parameter_history[suggestion.parameter].append({
                    "old": suggestion.current_value,
                    "new": suggestion.suggested_value,
                    "timestamp": datetime.now().isoformat()
                })
                applied.append(suggestion)
                print(f"   ✅ Applied: {suggestion.parameter} = {suggestion.suggested_value}")
            else:
                skipped.append(suggestion)

        self.last_optimization = datetime.now()
        self._save_state()

        return {
            "applied": [s.parameter for s in applied],
            "skipped": [s.parameter for s in skipped],
            "temperature": self.temperature
        }

    def get_optimized_config(self) -> Dict:
        """Get current optimized configuration."""
        config = {
            "retry_count": 2,
            "timeout_ms": 120000,
            "quality_min_score": 7.0,
            "title_min_length": 30,
            "title_max_length": 60,
            "meta_min_length": 120,
            "meta_max_length": 160,
            "min_content_length": 300
        }

        # Apply learned adjustments
        for param, history in self.parameter_history.items():
            if history and param in config:
                config[param] = history[-1]["new"]

        return config

    async def execute(self, input_data: Dict) -> Dict:
        """D.O.E. compatible execute method."""
        action = input_data.get("action", "status")

        if action == "status":
            return {
                "status": "success",
                "metrics": self.get_metrics_summary(),
                "temperature": self.temperature,
                "should_optimize": self.should_optimize(),
                "should_heal": self.should_heal()
            }

        elif action == "optimize":
            suggestions = self.get_optimization_suggestions()
            threshold = input_data.get("confidence_threshold", 0.6)
            result = self.apply_optimizations(suggestions, threshold)
            return {
                "status": "success",
                "optimizations": result,
                "suggestions": [
                    {
                        "parameter": s.parameter,
                        "suggested": s.suggested_value,
                        "confidence": s.confidence,
                        "reason": s.reason
                    }
                    for s in suggestions
                ]
            }

        elif action == "heal":
            return self.heal()

        elif action == "config":
            return {
                "status": "success",
                "optimized_config": self.get_optimized_config(),
                "best_parameters": self.best_parameters,
                "best_score": self.best_score
            }

        else:
            return {"status": "failed", "error": f"Unknown action: {action}"}

    def _cool_down(self) -> None:
        """Cool down temperature (simulated annealing)."""
        self.temperature = max(
            self.config.min_temperature,
            self.temperature * self.config.cooling_rate
        )

    def _save_state(self) -> None:
        """Persist state to file."""
        state = {
            "temperature": self.temperature,
            "consecutive_failures": self.consecutive_failures,
            "last_optimization": self.last_optimization.isoformat(),
            "best_score": self.best_score,
            "best_parameters": self.best_parameters,
            "parameter_history": self.parameter_history,
            "memory": [m.to_dict() for m in self.memory[-50:]]  # Last 50
        }

        state_path = Path(self.config.state_file)
        state_path.parent.mkdir(parents=True, exist_ok=True)

        with open(state_path, 'w') as f:
            json.dump(state, f, indent=2)

    def _load_state(self) -> None:
        """Load persisted state."""
        state_path = Path(self.config.state_file)

        if not state_path.exists():
            return

        try:
            with open(state_path, 'r') as f:
                state = json.load(f)

            self.temperature = state.get("temperature", self.config.initial_temperature)
            self.consecutive_failures = state.get("consecutive_failures", 0)
            self.last_optimization = datetime.fromisoformat(
                state.get("last_optimization", datetime.now().isoformat())
            )
            self.best_score = state.get("best_score", 0)
            self.best_parameters = state.get("best_parameters", {})
            self.parameter_history = state.get("parameter_history", {})
            self.memory = [
                ExecutionMemory.from_dict(m)
                for m in state.get("memory", [])
            ]

            print(f"   📂 Loaded state: {len(self.memory)} memories, T={self.temperature:.3f}")

        except Exception as e:
            print(f"   ⚠️ Could not load state: {e}")


# Singleton instance
_self_annealing_agent = None

def get_self_annealing_agent() -> SelfAnnealingAgent:
    """Get singleton Self-Annealing Agent instance."""
    global _self_annealing_agent
    if _self_annealing_agent is None:
        _self_annealing_agent = SelfAnnealingAgent()
    return _self_annealing_agent


# ═══════════════════════════════════════════════════════════════════
# Quick Test
# ═══════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import asyncio

    async def test_annealing():
        print("🧪 Testing Self-Annealing Agent")
        print("=" * 60)

        annealer = get_self_annealing_agent()

        # Simulate some executions
        for i in range(5):
            result = {
                "status": "success" if i % 2 == 0 else "partial",
                "result": {
                    "report": {
                        "summary": {
                            "average_seo_score": 6.5 + random.random() * 2
                        },
                        "top_issues": ["Title too short", "Meta missing"]
                    }
                },
                "metadata": {
                    "execution_id": f"test_{i}",
                    "latency_ms": 30000 + random.randint(0, 20000),
                    "retries": random.randint(0, 2)
                }
            }
            annealer.record_execution(result, {"limit": 20})

        # Get status
        status = await annealer.execute({"action": "status"})
        print(f"\nStatus: {json.dumps(status, indent=2, default=str)}")

        # Get suggestions
        suggestions = annealer.get_optimization_suggestions()
        print(f"\nSuggestions: {len(suggestions)}")
        for s in suggestions:
            print(f"   • {s.parameter}: {s.current_value} → {s.suggested_value} (confidence: {s.confidence:.2f})")

        # Get config
        config = await annealer.execute({"action": "config"})
        print(f"\nOptimized Config: {json.dumps(config, indent=2)}")

    asyncio.run(test_annealing())
