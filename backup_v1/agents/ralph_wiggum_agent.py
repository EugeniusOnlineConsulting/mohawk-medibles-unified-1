"""
Ralph Wiggum Agent - Chaos Controller for D.O.E. Framework
============================================================
"Me fail English? That's unpossible!"

The Ralph Wiggum Agent introduces controlled chaos into the optimization
process to escape local optima, challenge assumptions, and discover
edge cases that systematic approaches miss.

Philosophy:
- Naive exploration finds what sophisticated systems overlook
- Random perturbations prevent premature convergence
- Questioning assumptions reveals hidden constraints
- Accidental profundity leads to novel solutions

Integration with D.O.E. + Self-Annealing:
- Works alongside SelfAnnealingAgent as the "heat source"
- Triggers when system plateaus or gets stuck
- Injects controlled randomness to escape local minima
- Validates that optimizations don't break edge cases

Version: 1.0
Framework: D.O.E. (Design -> Orchestration -> Execution)
"""

import asyncio
import json
import random
import math
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from enum import Enum


class RalphMode(Enum):
    """Ralph's operational modes."""
    PROBE = "probe"           # Random exploration of parameter space
    CHALLENGE = "challenge"   # Naive questioning of assumptions
    MUTATE = "mutate"         # Random perturbations to escape optima
    ESCAPE = "escape"         # Force high-temperature exploration
    OBSERVE = "observe"       # Passive monitoring (Ralph is quiet)


@dataclass
class RalphConfig:
    """Configuration for Ralph Wiggum behavior."""
    # Chaos intensity (0.0 = no chaos, 1.0 = maximum chaos)
    chaos_intensity: float = 0.3

    # Probe settings
    probe_frequency: float = 0.2      # Probability of probing each run
    probe_depth: int = 3              # How many random variations to try

    # Challenge settings
    challenge_threshold: int = 5      # Runs before questioning assumptions
    min_variance_to_challenge: float = 0.1  # Min score variance to trigger

    # Mutation settings
    mutation_rate: float = 0.15       # Probability of mutating parameters
    mutation_magnitude: float = 0.2   # How much to mutate (0.2 = 20%)

    # Escape settings
    escape_trigger_failures: int = 3  # Consecutive failures to trigger escape
    escape_trigger_plateau: int = 5   # Runs with same score to trigger
    escape_heat_multiplier: float = 2.5  # Temperature boost during escape

    # Safety bounds - Ralph can be chaotic but not destructive
    parameter_bounds: Dict[str, Tuple[float, float]] = field(default_factory=lambda: {
        "retry_count": (1, 5),
        "timeout_ms": (30000, 300000),
        "quality_min_score": (5.0, 9.0),
        "title_min_length": (20, 40),
        "title_max_length": (50, 70),
        "meta_min_length": (100, 140),
        "meta_max_length": (150, 180),
        "batch_size": (5, 50),
        "parallel_limit": (1, 10)
    })

    # Persistence
    state_file: str = "data/ralph_state.json"

    # Ralph quotes for logging (because why not)
    quotes: List[str] = field(default_factory=lambda: [
        "I'm learnding!",
        "Me fail English? That's unpossible!",
        "The doctor said I wouldn't have so many nosebleeds if I kept my finger outta there.",
        "I bent my wookiee.",
        "My cat's breath smells like cat food.",
        "I found a moon rock in my nose!",
        "Hi, Super Nintendo Chalmers!",
        "When I grow up, I want to be a principal or a caterpillar.",
        "I'm a unitard!",
        "This is my sandbox. I'm not allowed to go in the deep end."
    ])


@dataclass
class ProbeResult:
    """Result of a probing exploration."""
    parameter: str
    original_value: Any
    probed_values: List[Any]
    best_probed_value: Any
    improvement: float
    exploration_path: List[Dict]


@dataclass
class ChallengeResult:
    """Result of challenging an assumption."""
    assumption: str
    question: str
    finding: str
    validity: float  # 0.0 = assumption is wrong, 1.0 = assumption is valid
    recommendation: str


@dataclass
class MutationResult:
    """Result of a mutation operation."""
    parameter: str
    original_value: Any
    mutated_value: Any
    accepted: bool
    reason: str


class RalphWiggumAgent:
    """
    Ralph Wiggum Agent - The Chaos Controller

    Key Capabilities:
    1. PROBE - Random exploration of parameter space
    2. CHALLENGE - Naive questioning of optimization assumptions
    3. MUTATE - Random perturbations to escape local optima
    4. ESCAPE - Force exploration when system is stuck

    Integration:
    - Works with SelfAnnealingAgent as complementary chaos source
    - Triggers based on system state (plateaus, failures, low variance)
    - Respects safety bounds to prevent destructive changes

    Usage:
        ralph = RalphWiggumAgent()

        # Get Ralph's recommendation for current state
        action = ralph.assess_situation(metrics, temperature)

        # Execute Ralph's action
        if action.mode == RalphMode.PROBE:
            result = ralph.probe(current_params)
        elif action.mode == RalphMode.CHALLENGE:
            result = ralph.challenge(assumptions)
        # etc.
    """

    name = "ralph_wiggum_agent"

    def __init__(self, config: RalphConfig = None):
        self.config = config or RalphConfig()
        self.mode = RalphMode.OBSERVE
        self.score_history: List[float] = []
        self.parameter_experiments: Dict[str, List[Dict]] = {}
        self.challenged_assumptions: List[ChallengeResult] = []
        self.escape_count: int = 0
        self.last_escape: Optional[datetime] = None
        self.consecutive_failures: int = 0

        # Load persisted state
        self._load_state()

        quote = random.choice(self.config.quotes)
        print(f"🧠 Ralph Wiggum Agent initialized")
        print(f"   \"{quote}\"")

    def assess_situation(
        self,
        metrics: Dict,
        annealing_temperature: float,
        current_params: Dict
    ) -> Dict:
        """
        Assess the current optimization situation and recommend an action.

        Returns:
            Dict with recommended mode and reasoning
        """
        recommendation = {
            "mode": RalphMode.OBSERVE,
            "reason": "System operating normally",
            "urgency": 0.0,
            "suggested_action": None
        }

        # Get key metrics
        success_rate = metrics.get("success_rate", 1.0)
        avg_score = metrics.get("avg_quality_score", 7.0)
        consecutive_failures = metrics.get("consecutive_failures", 0)

        # Track score history for plateau detection
        self.score_history.append(avg_score)
        if len(self.score_history) > 20:
            self.score_history = self.score_history[-20:]

        # Calculate score variance (plateau detection)
        if len(self.score_history) >= 5:
            recent_scores = self.score_history[-5:]
            score_variance = max(recent_scores) - min(recent_scores)
        else:
            score_variance = 1.0  # Assume variance if not enough data

        # Decision logic (priority order)

        # 1. ESCAPE: System is critically stuck
        if consecutive_failures >= self.config.escape_trigger_failures:
            recommendation = {
                "mode": RalphMode.ESCAPE,
                "reason": f"Critical: {consecutive_failures} consecutive failures",
                "urgency": 1.0,
                "suggested_action": {
                    "type": "heat_boost",
                    "multiplier": self.config.escape_heat_multiplier
                }
            }
            self.mode = RalphMode.ESCAPE

        # 2. ESCAPE: Plateau detected
        elif (len(self.score_history) >= self.config.escape_trigger_plateau and
              score_variance < self.config.min_variance_to_challenge):
            recommendation = {
                "mode": RalphMode.ESCAPE,
                "reason": f"Plateau detected: variance {score_variance:.3f} over {len(self.score_history)} runs",
                "urgency": 0.8,
                "suggested_action": {
                    "type": "random_jump",
                    "magnitude": self.config.mutation_magnitude * 2
                }
            }
            self.mode = RalphMode.ESCAPE

        # 3. CHALLENGE: System stabilized but suboptimal
        elif (annealing_temperature < 0.3 and
              avg_score < 8.0 and
              len(self.score_history) >= self.config.challenge_threshold):
            recommendation = {
                "mode": RalphMode.CHALLENGE,
                "reason": f"Low temp ({annealing_temperature:.2f}) but score only {avg_score:.1f}",
                "urgency": 0.5,
                "suggested_action": {
                    "type": "question_assumptions",
                    "target": self._identify_weakest_assumption(metrics)
                }
            }
            self.mode = RalphMode.CHALLENGE

        # 4. MUTATE: Random exploration opportunity
        elif random.random() < self.config.mutation_rate:
            recommendation = {
                "mode": RalphMode.MUTATE,
                "reason": "Random mutation opportunity (controlled chaos)",
                "urgency": 0.3,
                "suggested_action": {
                    "type": "perturb_parameter",
                    "parameter": self._select_mutation_target(current_params)
                }
            }
            self.mode = RalphMode.MUTATE

        # 5. PROBE: Systematic exploration when stable
        elif (random.random() < self.config.probe_frequency and
              annealing_temperature < 0.5):
            recommendation = {
                "mode": RalphMode.PROBE,
                "reason": "Probing parameter space for hidden optima",
                "urgency": 0.2,
                "suggested_action": {
                    "type": "explore_neighbors",
                    "depth": self.config.probe_depth
                }
            }
            self.mode = RalphMode.PROBE

        else:
            self.mode = RalphMode.OBSERVE

        return recommendation

    def probe(self, current_params: Dict) -> List[ProbeResult]:
        """
        Probe the parameter space around current values.

        Ralph randomly explores nearby parameter values to find
        potentially better configurations that systematic search missed.
        """
        results = []

        # Select parameters to probe
        probe_targets = random.sample(
            list(current_params.keys()),
            min(self.config.probe_depth, len(current_params))
        )

        print(f"   🔍 Ralph is probing: {probe_targets}")
        print(f"      \"{random.choice(self.config.quotes)}\"")

        for param in probe_targets:
            if param not in self.config.parameter_bounds:
                continue

            current_value = current_params[param]
            bounds = self.config.parameter_bounds[param]

            # Generate probe values (random neighbors)
            probed_values = []
            for _ in range(3):
                # Random perturbation within bounds
                if isinstance(current_value, (int, float)):
                    delta = (bounds[1] - bounds[0]) * random.uniform(-0.2, 0.2)
                    new_value = current_value + delta
                    new_value = max(bounds[0], min(bounds[1], new_value))
                    if isinstance(current_value, int):
                        new_value = int(new_value)
                    probed_values.append(new_value)

            result = ProbeResult(
                parameter=param,
                original_value=current_value,
                probed_values=probed_values,
                best_probed_value=probed_values[0] if probed_values else current_value,
                improvement=0.0,  # To be filled after evaluation
                exploration_path=[{
                    "value": v,
                    "timestamp": datetime.now().isoformat()
                } for v in probed_values]
            )
            results.append(result)

            # Track experiment
            if param not in self.parameter_experiments:
                self.parameter_experiments[param] = []
            self.parameter_experiments[param].append({
                "type": "probe",
                "original": current_value,
                "probed": probed_values,
                "timestamp": datetime.now().isoformat()
            })

        self._save_state()
        return results

    def challenge(self, current_state: Dict) -> List[ChallengeResult]:
        """
        Challenge current optimization assumptions.

        Ralph asks naive questions that might reveal flawed assumptions:
        - "Why is the title length set to 30-60?"
        - "What if we used more tags?"
        - "Why are we optimizing for this score?"
        """
        challenges = []

        print(f"   🤔 Ralph is questioning everything...")
        print(f"      \"{random.choice(self.config.quotes)}\"")

        # Common assumptions to challenge
        assumption_challenges = [
            {
                "assumption": "Title length must be 30-60 characters",
                "question": "What if shorter or longer titles perform better for cannabis products?",
                "test": lambda s: s.get("avg_title_length", 45) > 40 and s.get("avg_quality_score", 0) > 7.5,
                "alt_recommendation": "Consider testing title lengths 40-70 for product visibility"
            },
            {
                "assumption": "Meta descriptions should be 155-160 characters",
                "question": "Is Google even showing full descriptions for cannabis sites?",
                "test": lambda s: True,  # Always worth questioning
                "alt_recommendation": "Test shorter, punchier meta descriptions (100-120 chars)"
            },
            {
                "assumption": "8-15 tags per product is optimal",
                "question": "What if more specific, fewer tags rank better?",
                "test": lambda s: s.get("avg_tag_count", 10) > 10,
                "alt_recommendation": "Test 5-8 highly specific tags vs 15 general tags"
            },
            {
                "assumption": "Indigenous heritage content should be 3% max",
                "question": "Is this limiting brand differentiation opportunity?",
                "test": lambda s: s.get("indigenous_mention_rate", 0) < 0.5,
                "alt_recommendation": "Test 5-8% indigenous content for brand authenticity"
            },
            {
                "assumption": "Quality score 7.0 is the minimum threshold",
                "question": "What if products scoring 6.0-7.0 are converting better?",
                "test": lambda s: s.get("min_score", 7) >= 7,
                "alt_recommendation": "Analyze conversion data for 6.0-7.0 vs 7.0+ products"
            },
            {
                "assumption": "Sequential pipeline is optimal",
                "question": "What if parallel processing reduces latency significantly?",
                "test": lambda s: s.get("avg_latency_ms", 0) > 30000,
                "alt_recommendation": "Test parallel pipeline with 5 concurrent agents"
            }
        ]

        # Randomly select challenges
        selected = random.sample(
            assumption_challenges,
            min(3, len(assumption_challenges))
        )

        for challenge in selected:
            # Evaluate assumption validity
            validity = 1.0 if challenge["test"](current_state) else 0.5

            result = ChallengeResult(
                assumption=challenge["assumption"],
                question=challenge["question"],
                finding=f"Validity: {validity:.0%} based on current metrics",
                validity=validity,
                recommendation=challenge["alt_recommendation"] if validity < 0.8 else "Assumption appears valid"
            )
            challenges.append(result)
            self.challenged_assumptions.append(result)

        self._save_state()
        return challenges

    def mutate(self, current_params: Dict) -> List[MutationResult]:
        """
        Apply random mutations to parameters.

        Ralph introduces controlled randomness to prevent the system
        from getting stuck in local optima.
        """
        mutations = []

        print(f"   🎲 Ralph is mutating parameters...")
        print(f"      \"{random.choice(self.config.quotes)}\"")

        for param, value in current_params.items():
            # Random chance to mutate each parameter
            if random.random() > self.config.mutation_rate:
                continue

            if param not in self.config.parameter_bounds:
                continue

            bounds = self.config.parameter_bounds[param]

            # Calculate mutation
            if isinstance(value, (int, float)):
                # Gaussian mutation
                magnitude = (bounds[1] - bounds[0]) * self.config.mutation_magnitude
                delta = random.gauss(0, magnitude)
                new_value = value + delta
                new_value = max(bounds[0], min(bounds[1], new_value))

                if isinstance(value, int):
                    new_value = int(new_value)

                # Acceptance probability (simulated annealing style)
                accept_prob = self.config.chaos_intensity
                accepted = random.random() < accept_prob

                result = MutationResult(
                    parameter=param,
                    original_value=value,
                    mutated_value=new_value,
                    accepted=accepted,
                    reason=f"Random mutation (intensity: {self.config.chaos_intensity:.2f})"
                )
                mutations.append(result)

        self._save_state()
        return mutations

    def escape(self, current_params: Dict, annealing_agent: Any = None) -> Dict:
        """
        Force escape from local optimum.

        Ralph triggers when the system is stuck:
        - Drastically increases temperature
        - Applies large random jumps
        - Resets certain parameters to defaults
        - Clears stuck patterns
        """
        print(f"   🚀 Ralph is initiating ESCAPE sequence!")
        print(f"      \"{random.choice(self.config.quotes)}\"")

        self.escape_count += 1
        self.last_escape = datetime.now()

        escape_actions = []
        new_params = current_params.copy()

        # Action 1: Large random jump on 2-3 parameters
        jump_targets = random.sample(
            [p for p in current_params.keys() if p in self.config.parameter_bounds],
            min(3, len(current_params))
        )

        for param in jump_targets:
            bounds = self.config.parameter_bounds[param]
            # Jump to random point in parameter space
            if isinstance(current_params[param], int):
                new_value = random.randint(int(bounds[0]), int(bounds[1]))
            else:
                new_value = random.uniform(bounds[0], bounds[1])

            escape_actions.append({
                "action": "random_jump",
                "parameter": param,
                "old_value": current_params[param],
                "new_value": new_value
            })
            new_params[param] = new_value

        # Action 2: Request temperature boost from annealing agent
        if annealing_agent:
            escape_actions.append({
                "action": "temperature_boost",
                "multiplier": self.config.escape_heat_multiplier,
                "target": "annealing_agent"
            })

        # Action 3: Clear score history (fresh start)
        old_history_len = len(self.score_history)
        self.score_history = []
        escape_actions.append({
            "action": "clear_history",
            "cleared_entries": old_history_len
        })

        # Action 4: Reset consecutive failures
        self.consecutive_failures = 0

        result = {
            "status": "escaped",
            "escape_number": self.escape_count,
            "actions_taken": escape_actions,
            "new_params": new_params,
            "timestamp": datetime.now().isoformat(),
            "ralph_says": random.choice(self.config.quotes)
        }

        self._save_state()
        return result

    def get_experiment_summary(self) -> Dict:
        """Get summary of Ralph's experiments."""
        return {
            "mode": self.mode.value,
            "total_escapes": self.escape_count,
            "last_escape": self.last_escape.isoformat() if self.last_escape else None,
            "score_history_length": len(self.score_history),
            "parameters_explored": list(self.parameter_experiments.keys()),
            "assumptions_challenged": len(self.challenged_assumptions),
            "recent_challenges": [
                {
                    "assumption": c.assumption,
                    "validity": c.validity,
                    "recommendation": c.recommendation
                }
                for c in self.challenged_assumptions[-3:]
            ],
            "chaos_intensity": self.config.chaos_intensity
        }

    def adjust_chaos(self, direction: str, amount: float = 0.1) -> float:
        """Adjust chaos intensity up or down."""
        if direction == "increase":
            self.config.chaos_intensity = min(1.0, self.config.chaos_intensity + amount)
        elif direction == "decrease":
            self.config.chaos_intensity = max(0.0, self.config.chaos_intensity - amount)

        print(f"   🎛️ Chaos intensity adjusted to {self.config.chaos_intensity:.2f}")
        self._save_state()
        return self.config.chaos_intensity

    async def execute(self, input_data: Dict) -> Dict:
        """D.O.E. compatible execute method."""
        action = input_data.get("action", "assess")

        if action == "assess":
            metrics = input_data.get("metrics", {})
            temperature = input_data.get("temperature", 0.5)
            params = input_data.get("params", {})
            assessment = self.assess_situation(metrics, temperature, params)
            return {
                "status": "success",
                "assessment": assessment,
                "ralph_mode": self.mode.value,
                "ralph_says": random.choice(self.config.quotes)
            }

        elif action == "probe":
            params = input_data.get("params", {})
            results = self.probe(params)
            return {
                "status": "success",
                "probe_results": [
                    {
                        "parameter": r.parameter,
                        "original": r.original_value,
                        "probed": r.probed_values
                    }
                    for r in results
                ]
            }

        elif action == "challenge":
            state = input_data.get("state", {})
            results = self.challenge(state)
            return {
                "status": "success",
                "challenges": [
                    {
                        "assumption": r.assumption,
                        "question": r.question,
                        "validity": r.validity,
                        "recommendation": r.recommendation
                    }
                    for r in results
                ]
            }

        elif action == "mutate":
            params = input_data.get("params", {})
            results = self.mutate(params)
            return {
                "status": "success",
                "mutations": [
                    {
                        "parameter": r.parameter,
                        "original": r.original_value,
                        "mutated": r.mutated_value,
                        "accepted": r.accepted
                    }
                    for r in results
                ]
            }

        elif action == "escape":
            params = input_data.get("params", {})
            annealer = input_data.get("annealing_agent")
            result = self.escape(params, annealer)
            return {
                "status": "success",
                "escape_result": result
            }

        elif action == "summary":
            return {
                "status": "success",
                "summary": self.get_experiment_summary()
            }

        elif action == "adjust_chaos":
            direction = input_data.get("direction", "increase")
            amount = input_data.get("amount", 0.1)
            new_intensity = self.adjust_chaos(direction, amount)
            return {
                "status": "success",
                "chaos_intensity": new_intensity
            }

        else:
            return {
                "status": "failed",
                "error": f"Unknown action: {action}",
                "ralph_says": "That's unpossible!"
            }

    def _identify_weakest_assumption(self, metrics: Dict) -> str:
        """Identify which assumption is likely weakest based on metrics."""
        # Simple heuristic - return area with lowest performance
        if metrics.get("avg_quality_score", 10) < 7:
            return "quality_threshold"
        elif metrics.get("success_rate", 1) < 0.8:
            return "retry_strategy"
        elif metrics.get("avg_latency_ms", 0) > 60000:
            return "timeout_settings"
        else:
            return "content_framework"

    def _select_mutation_target(self, params: Dict) -> str:
        """Select a parameter to mutate."""
        if not params:
            return "retry_count"  # Default parameter

        # Prefer parameters that haven't been explored recently
        unexplored = [
            p for p in params.keys()
            if p in self.config.parameter_bounds and
               p not in self.parameter_experiments
        ]

        if unexplored:
            return random.choice(unexplored)

        # Otherwise pick randomly from bounded params
        bounded = [p for p in params.keys() if p in self.config.parameter_bounds]
        if bounded:
            return random.choice(bounded)

        # Fallback to any key or default
        return list(params.keys())[0] if params else "retry_count"

    def _save_state(self) -> None:
        """Persist Ralph's state."""
        state = {
            "mode": self.mode.value,
            "chaos_intensity": self.config.chaos_intensity,
            "score_history": self.score_history[-50:],
            "escape_count": self.escape_count,
            "last_escape": self.last_escape.isoformat() if self.last_escape else None,
            "consecutive_failures": self.consecutive_failures,
            "parameter_experiments": {
                k: v[-10:] for k, v in self.parameter_experiments.items()
            },
            "challenged_assumptions": [
                {
                    "assumption": c.assumption,
                    "question": c.question,
                    "validity": c.validity,
                    "recommendation": c.recommendation
                }
                for c in self.challenged_assumptions[-20:]
            ]
        }

        state_path = Path(self.config.state_file)
        state_path.parent.mkdir(parents=True, exist_ok=True)

        with open(state_path, 'w') as f:
            json.dump(state, f, indent=2)

    def _load_state(self) -> None:
        """Load Ralph's persisted state."""
        state_path = Path(self.config.state_file)

        if not state_path.exists():
            return

        try:
            with open(state_path, 'r') as f:
                state = json.load(f)

            self.mode = RalphMode(state.get("mode", "observe"))
            self.config.chaos_intensity = state.get("chaos_intensity", 0.3)
            self.score_history = state.get("score_history", [])
            self.escape_count = state.get("escape_count", 0)
            self.last_escape = (
                datetime.fromisoformat(state["last_escape"])
                if state.get("last_escape") else None
            )
            self.consecutive_failures = state.get("consecutive_failures", 0)
            self.parameter_experiments = state.get("parameter_experiments", {})

            # Reconstruct challenged assumptions
            self.challenged_assumptions = [
                ChallengeResult(
                    assumption=c["assumption"],
                    question=c["question"],
                    finding="Loaded from state",
                    validity=c["validity"],
                    recommendation=c["recommendation"]
                )
                for c in state.get("challenged_assumptions", [])
            ]

            print(f"   📂 Ralph loaded: {self.escape_count} escapes, mode={self.mode.value}")

        except Exception as e:
            print(f"   ⚠️ Ralph couldn't load state: {e}")


# Singleton instance
_ralph_wiggum_agent = None

def get_ralph_wiggum_agent() -> RalphWiggumAgent:
    """Get singleton Ralph Wiggum Agent instance."""
    global _ralph_wiggum_agent
    if _ralph_wiggum_agent is None:
        _ralph_wiggum_agent = RalphWiggumAgent()
    return _ralph_wiggum_agent


# ═══════════════════════════════════════════════════════════════════
# Quick Test
# ═══════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import asyncio

    async def test_ralph():
        print("🧪 Testing Ralph Wiggum Agent")
        print("=" * 60)

        ralph = get_ralph_wiggum_agent()

        # Test assessment
        metrics = {
            "success_rate": 0.75,
            "avg_quality_score": 6.8,
            "avg_latency_ms": 45000,
            "consecutive_failures": 2
        }

        params = {
            "retry_count": 2,
            "timeout_ms": 60000,
            "quality_min_score": 7.0,
            "batch_size": 20
        }

        print("\n1. Assessment Test:")
        assessment = ralph.assess_situation(metrics, 0.4, params)
        print(f"   Mode: {assessment['mode'].value}")
        print(f"   Reason: {assessment['reason']}")
        print(f"   Urgency: {assessment['urgency']}")

        print("\n2. Probe Test:")
        probe_results = ralph.probe(params)
        for r in probe_results:
            print(f"   {r.parameter}: {r.original_value} -> {r.probed_values}")

        print("\n3. Challenge Test:")
        challenges = ralph.challenge(metrics)
        for c in challenges:
            print(f"   Q: {c.question}")
            print(f"   A: {c.recommendation}")
            print()

        print("\n4. Mutation Test:")
        mutations = ralph.mutate(params)
        for m in mutations:
            print(f"   {m.parameter}: {m.original_value} -> {m.mutated_value} (accepted: {m.accepted})")

        print("\n5. Summary:")
        summary = ralph.get_experiment_summary()
        print(f"   Mode: {summary['mode']}")
        print(f"   Escapes: {summary['total_escapes']}")
        print(f"   Chaos: {summary['chaos_intensity']}")

        print("\n" + "=" * 60)
        print("Ralph says:", random.choice(ralph.config.quotes))

    asyncio.run(test_ralph())
