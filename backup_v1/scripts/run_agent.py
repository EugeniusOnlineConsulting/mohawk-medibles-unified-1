#!/usr/bin/env python3
"""
Mohawk Medibles SEO Agent - Unified Runner v1.0
D.O.E. Framework + Self-Annealing + Ralph Wiggum Chaos Control

Continuous operation mode for staging environment.
One task at a time, with full audit trail.
"""

import sys
import json
import asyncio
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import argparse

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from agents.seo_agent import SEOAgent
from agents.compliance_agent import ComplianceAgent
from agents.vision_agent import VisionAgent
from agents.self_annealing_agent import SelfAnnealingAgent, AnnealingConfig
from agents.ralph_wiggum_agent import RalphWiggumAgent, RalphConfig
from orchestrator.doe_orchestrator import DOEOrchestrator, WorkflowDesign, WorkflowOrchestration, QualityGateConfig


class MohawkSEORunner:
    """
    Unified SEO Agent Runner with D.O.E. Framework integration.

    Features:
    - Continuous operation mode (one task at a time)
    - Full D.O.E. (Design → Orchestration → Execution) compliance
    - Self-Annealing optimization
    - Ralph Wiggum chaos control
    - Vision-enabled image analysis
    - Compliance checking
    - Automatic backups before changes
    """

    def __init__(self, config_path: str = None):
        # Load configuration
        self.config = self._load_config(config_path)

        # Initialize agents
        self.seo_agent = SEOAgent()
        self.compliance_agent = ComplianceAgent()
        self.vision_agent = VisionAgent(self.config.get('agent', {}))

        # Initialize D.O.E. components
        annealing_config = AnnealingConfig(
            state_file=str(Path(__file__).parent.parent / 'data' / 'annealing_state.json')
        )
        self.annealing_agent = SelfAnnealingAgent(annealing_config)

        ralph_config = RalphConfig(
            state_file=str(Path(__file__).parent.parent / 'data' / 'ralph_state.json')
        )
        self.ralph_agent = RalphWiggumAgent(ralph_config)

        # Task queue for continuous operation
        self.task_queue: List[Dict] = []
        self.completed_tasks: List[Dict] = []
        self.current_task: Optional[Dict] = None

        # Get SSH configuration
        env = self.config.get('wpengine', {}).get('active_environment', 'staging')
        self.ssh_config = self.config.get('wpengine', {}).get(env, {})

        print("=" * 60)
        print("🦅 Mohawk Medibles SEO Agent v1.0")
        print("=" * 60)
        print(f"   Environment: {env.upper()}")
        print(f"   D.O.E. Framework: Enabled")
        print(f"   Self-Annealing: {self.config.get('doe_framework', {}).get('enable_annealing', True)}")
        print(f"   Ralph Wiggum: {self.config.get('doe_framework', {}).get('enable_ralph_wiggum', True)}")
        print(f"   Vision Analysis: {self.config.get('agent', {}).get('vision_analysis', True)}")
        print("=" * 60)

    def _load_config(self, config_path: str = None) -> Dict:
        """Load configuration from file."""
        if config_path is None:
            config_path = Path(__file__).parent.parent / 'configs' / 'credentials.json'

        if Path(config_path).exists():
            with open(config_path) as f:
                return json.load(f)
        return {}

    def fetch_products(self, limit: int = 20, offset: int = 0) -> List[Dict]:
        """Fetch products from WP Engine via SSH."""
        ssh_key = self.ssh_config.get('ssh_key_path', '')
        ssh_host = f"{self.ssh_config.get('ssh_user')}@{self.ssh_config.get('ssh_host')}"
        site_path = self.ssh_config.get('site_path', '')

        cmd = f'''ssh -i {ssh_key} -o StrictHostKeyChecking=no {ssh_host} "cd {site_path} && wp post list --post_type=product --posts_per_page={limit} --offset={offset} --format=json --fields=ID,post_title,post_content,post_excerpt,post_modified" 2>/dev/null'''

        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
            if result.returncode == 0:
                # Parse JSON, filtering out PHP warnings
                output = result.stdout
                # Find the JSON array
                start = output.find('[')
                end = output.rfind(']') + 1
                if start >= 0 and end > start:
                    products = json.loads(output[start:end])
                    print(f"✅ Fetched {len(products)} products")
                    return products
        except Exception as e:
            print(f"❌ Error fetching products: {e}")

        return []

    def fetch_product_meta(self, product_id: int) -> Dict:
        """Fetch full product metadata including Yoast SEO fields."""
        ssh_key = self.ssh_config.get('ssh_key_path', '')
        ssh_host = f"{self.ssh_config.get('ssh_user')}@{self.ssh_config.get('ssh_host')}"
        site_path = self.ssh_config.get('site_path', '')

        cmd = f'''ssh -i {ssh_key} -o StrictHostKeyChecking=no {ssh_host} "cd {site_path} && wp post meta list {product_id} --format=json" 2>/dev/null'''

        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                output = result.stdout
                start = output.find('[')
                end = output.rfind(']') + 1
                if start >= 0 and end > start:
                    meta = json.loads(output[start:end])
                    return {item['meta_key']: item['meta_value'] for item in meta}
        except Exception as e:
            print(f"⚠️ Error fetching meta for {product_id}: {e}")

        return {}

    def create_backup(self, product_id: int, data: Dict) -> str:
        """Create backup before making changes."""
        backup_dir = Path(__file__).parent.parent / 'backups' / datetime.now().strftime('%Y%m%d')
        backup_dir.mkdir(parents=True, exist_ok=True)

        backup_file = backup_dir / f"product_{product_id}_{datetime.now().strftime('%H%M%S')}.json"
        with open(backup_file, 'w') as f:
            json.dump(data, f, indent=2)

        return str(backup_file)

    def analyze_product(self, product: Dict) -> Dict:
        """Run full analysis on a single product."""
        product_id = product.get('ID', product.get('id', 0))
        name = product.get('post_title', product.get('Name', ''))

        print(f"\n📊 Analyzing: {name} (ID: {product_id})")

        # Fetch full metadata
        meta = self.fetch_product_meta(product_id)
        full_product = {
            'ID': product_id,
            'Name': name,
            'Description': product.get('post_content', ''),
            'Short description': product.get('post_excerpt', ''),
            **{f'Meta: {k}': v for k, v in meta.items()}
        }

        # Create backup
        if self.config.get('agent', {}).get('auto_backup', True):
            backup_path = self.create_backup(product_id, full_product)
            print(f"   💾 Backup: {backup_path}")

        # Run all analyses
        results = {
            'product_id': product_id,
            'product_name': name,
            'timestamp': datetime.now().isoformat(),
            'analyses': {}
        }

        # 1. SEO Analysis (8 dimensions)
        print("   🔍 Running SEO analysis...")
        results['analyses']['seo'] = self.seo_agent.analyze_product(full_product)

        # 2. Compliance Check
        print("   ⚖️ Running compliance check...")
        results['analyses']['compliance'] = self.compliance_agent.scan_product(full_product)

        # 3. Vision/Image Analysis
        if self.config.get('agent', {}).get('vision_analysis', True):
            print("   👁️ Running vision analysis...")
            results['analyses']['vision'] = self.vision_agent.analyze_product_images(full_product)

        # 4. Generate Optimizations
        print("   ✨ Generating optimizations...")
        results['optimizations'] = self.seo_agent.generate_optimized_content(
            full_product,
            results['analyses']['seo']
        )

        # Calculate overall score
        seo_score = results['analyses']['seo'].get('overall_score', 0)
        compliance_score = results['analyses']['compliance'].get('compliance_score', 0)
        vision_score = results['analyses'].get('vision', {}).get('score', 100)

        results['overall_score'] = round((seo_score * 0.5 + compliance_score * 0.3 + vision_score * 0.2), 1)
        results['priority'] = self._determine_priority(results['overall_score'])

        print(f"   📈 Overall Score: {results['overall_score']}/100 ({results['priority']} priority)")

        return results

    def _determine_priority(self, score: int) -> str:
        """Determine task priority based on score."""
        if score >= 80:
            return 'LOW'
        elif score >= 60:
            return 'MEDIUM'
        elif score >= 40:
            return 'HIGH'
        else:
            return 'CRITICAL'

    def add_task(self, task_type: str, target: Dict, priority: str = 'MEDIUM'):
        """Add a task to the queue."""
        task = {
            'id': f"task_{len(self.task_queue) + len(self.completed_tasks) + 1}",
            'type': task_type,
            'target': target,
            'priority': priority,
            'status': 'queued',
            'created_at': datetime.now().isoformat()
        }
        self.task_queue.append(task)
        print(f"📋 Task added: {task['id']} - {task_type}")

    def process_next_task(self) -> Optional[Dict]:
        """Process the next task in queue (one at a time)."""
        if not self.task_queue:
            print("📭 No tasks in queue")
            return None

        # Sort by priority
        priority_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
        self.task_queue.sort(key=lambda x: priority_order.get(x['priority'], 2))

        self.current_task = self.task_queue.pop(0)
        self.current_task['status'] = 'in_progress'
        self.current_task['started_at'] = datetime.now().isoformat()

        print(f"\n🔄 Processing: {self.current_task['id']} ({self.current_task['type']})")

        try:
            if self.current_task['type'] == 'analyze':
                result = self.analyze_product(self.current_task['target'])
            elif self.current_task['type'] == 'optimize':
                result = self._apply_optimizations(self.current_task['target'])
            elif self.current_task['type'] == 'compliance_fix':
                result = self._fix_compliance_issues(self.current_task['target'])
            else:
                result = {'error': f"Unknown task type: {self.current_task['type']}"}

            self.current_task['result'] = result
            self.current_task['status'] = 'completed'

        except Exception as e:
            self.current_task['status'] = 'failed'
            self.current_task['error'] = str(e)
            result = {'error': str(e)}

        self.current_task['completed_at'] = datetime.now().isoformat()
        self.completed_tasks.append(self.current_task)
        self.current_task = None

        # Record for annealing
        self.annealing_agent.record_execution(
            {'status': 'success' if 'error' not in result else 'failed', 'result': result},
            self.current_task['target'] if self.current_task else {}
        )

        return result

    def _apply_optimizations(self, target: Dict) -> Dict:
        """Apply SEO optimizations to a product."""
        # First analyze
        analysis = self.analyze_product(target)

        # Get optimizations
        optimizations = analysis.get('optimizations', {})

        # Apply via SSH/WP-CLI
        product_id = target.get('ID', target.get('id', 0))

        results = {
            'product_id': product_id,
            'applied': [],
            'failed': []
        }

        # Apply SEO title
        if optimizations.get('seo_title'):
            success = self._update_meta(product_id, '_yoast_wpseo_title', optimizations['seo_title'])
            if success:
                results['applied'].append('seo_title')
            else:
                results['failed'].append('seo_title')

        # Apply meta description
        if optimizations.get('meta_description'):
            success = self._update_meta(product_id, '_yoast_wpseo_metadesc', optimizations['meta_description'])
            if success:
                results['applied'].append('meta_description')
            else:
                results['failed'].append('meta_description')

        # Apply focus keyphrase
        if optimizations.get('focus_keyphrase'):
            success = self._update_meta(product_id, '_yoast_wpseo_focuskw', optimizations['focus_keyphrase'])
            if success:
                results['applied'].append('focus_keyphrase')
            else:
                results['failed'].append('focus_keyphrase')

        return results

    def _fix_compliance_issues(self, target: Dict) -> Dict:
        """Fix compliance issues in a product."""
        product_id = target.get('ID', target.get('id', 0))

        # Scan for issues
        scan = self.compliance_agent.scan_product(target)

        if scan['compliant']:
            return {'product_id': product_id, 'status': 'already_compliant'}

        # Fix content
        description = target.get('Description', target.get('post_content', ''))
        fixed_content, changes = self.compliance_agent.fix_content(description)

        if changes:
            # Update via SSH
            success = self._update_post_content(product_id, fixed_content)
            return {
                'product_id': product_id,
                'changes': changes,
                'applied': success
            }

        return {'product_id': product_id, 'status': 'no_fixable_issues'}

    def _update_meta(self, product_id: int, meta_key: str, meta_value: str) -> bool:
        """Update product meta via WP-CLI."""
        ssh_key = self.ssh_config.get('ssh_key_path', '')
        ssh_host = f"{self.ssh_config.get('ssh_user')}@{self.ssh_config.get('ssh_host')}"
        site_path = self.ssh_config.get('site_path', '')

        # Escape the value
        escaped_value = meta_value.replace('"', '\\"').replace("'", "\\'")

        cmd = f'''ssh -i {ssh_key} -o StrictHostKeyChecking=no {ssh_host} "cd {site_path} && wp post meta update {product_id} {meta_key} '{escaped_value}'" 2>/dev/null'''

        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
            return result.returncode == 0
        except Exception as e:
            print(f"⚠️ Error updating meta: {e}")
            return False

    def _update_post_content(self, product_id: int, content: str) -> bool:
        """Update post content via WP-CLI."""
        # This is more complex - would need to handle HTML properly
        # For now, return False to indicate not implemented for safety
        print("⚠️ Post content updates require manual review for safety")
        return False

    def run_continuous(self, limit: int = 20):
        """Run in continuous mode - process all products one at a time."""
        print("\n🚀 Starting continuous operation mode...")

        # Fetch products
        products = self.fetch_products(limit=limit)

        if not products:
            print("❌ No products to process")
            return

        # Queue all for analysis
        for product in products:
            self.add_task('analyze', product, 'MEDIUM')

        # Process queue one at a time
        while self.task_queue:
            result = self.process_next_task()

            # Ralph Wiggum assessment
            if self.config.get('doe_framework', {}).get('enable_ralph_wiggum', True):
                metrics = self.annealing_agent.get_metrics_summary()
                assessment = self.ralph_agent.assess_situation(
                    metrics,
                    self.annealing_agent.temperature,
                    {}
                )

                if assessment['mode'].value != 'observe':
                    print(f"   🧠 Ralph says: {assessment['reason']}")

            # Small delay between tasks
            print("   ⏳ Waiting 2 seconds before next task...")
            import time
            time.sleep(2)

        # Generate final report
        self._generate_report()

    def _generate_report(self):
        """Generate summary report of completed tasks."""
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_tasks': len(self.completed_tasks),
            'successful': sum(1 for t in self.completed_tasks if t['status'] == 'completed'),
            'failed': sum(1 for t in self.completed_tasks if t['status'] == 'failed'),
            'tasks': self.completed_tasks
        }

        report_path = Path(__file__).parent.parent / 'outputs' / f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        report_path.parent.mkdir(parents=True, exist_ok=True)

        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)

        print(f"\n📄 Report saved: {report_path}")
        print(f"   ✅ Completed: {report['successful']}")
        print(f"   ❌ Failed: {report['failed']}")

    def get_status(self) -> Dict:
        """Get current agent status."""
        return {
            'queue_length': len(self.task_queue),
            'completed_tasks': len(self.completed_tasks),
            'current_task': self.current_task,
            'annealing': self.annealing_agent.get_metrics_summary(),
            'ralph': self.ralph_agent.get_experiment_summary()
        }


def main():
    parser = argparse.ArgumentParser(description='Mohawk Medibles SEO Agent v1.0')
    parser.add_argument('--limit', type=int, default=20, help='Number of products to process')
    parser.add_argument('--mode', choices=['continuous', 'single', 'status'], default='continuous')
    parser.add_argument('--product-id', type=int, help='Specific product ID for single mode')
    parser.add_argument('--config', type=str, help='Path to config file')

    args = parser.parse_args()

    runner = MohawkSEORunner(config_path=args.config)

    if args.mode == 'continuous':
        runner.run_continuous(limit=args.limit)
    elif args.mode == 'single' and args.product_id:
        result = runner.analyze_product({'ID': args.product_id, 'id': args.product_id})
        print(json.dumps(result, indent=2))
    elif args.mode == 'status':
        status = runner.get_status()
        print(json.dumps(status, indent=2))
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
