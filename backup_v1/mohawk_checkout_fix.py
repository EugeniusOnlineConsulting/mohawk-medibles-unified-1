#!/usr/bin/env python3
"""
Mohawk Medibles - Critical Checkout Error Diagnostic & Fix
Emergency response script for mobile checkout issues after plugin updates
"""

import subprocess
import json
import re
from datetime import datetime
from pathlib import Path

class MohawkCheckoutFixer:
    """
    Diagnose and fix critical mobile checkout errors on WooCommerce sites.
    Common causes after plugin updates:
    - WooCommerce payment gateway conflicts
    - PHP fatal errors in checkout process
    - JavaScript conflicts on mobile
    - Session handling issues
    - Plugin hook conflicts
    """

    def __init__(self, ssh_host, ssh_user, ssh_key_path, site_path):
        self.ssh_host = ssh_host
        self.ssh_user = ssh_user
        self.ssh_key_path = ssh_key_path
        self.site_path = site_path
        self.ssh_base = f"ssh -i {ssh_key_path} {ssh_user}@{ssh_host}"

    def run_ssh_command(self, command):
        """Execute SSH command safely"""
        full_cmd = f"{self.ssh_base} 'cd {self.site_path} && {command}'"
        try:
            result = subprocess.run(full_cmd, shell=True, capture_output=True, text=True, timeout=30)
            return {
                'success': result.returncode == 0,
                'output': result.stdout,
                'error': result.stderr
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def check_error_logs(self):
        """Check WordPress and PHP error logs for checkout issues"""
        print("🔍 Checking error logs...")

        # Check WordPress debug log
        result = self.run_ssh_command("tail -100 wp-content/debug.log 2>/dev/null || echo 'No debug log'")

        if result['success']:
            errors = self._parse_errors(result['output'])
            return errors
        return []

    def _parse_errors(self, log_content):
        """Parse error log for critical issues"""
        errors = []
        patterns = [
            r'Fatal error:.*in.*on line \d+',
            r'PHP Warning:.*checkout.*',
            r'WooCommerce.*error',
            r'Payment.*failed',
            r'Critical.*checkout'
        ]

        for line in log_content.split('\n'):
            for pattern in patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    errors.append(line.strip())

        return errors

    def get_recently_updated_plugins(self):
        """Find plugins updated in the last 7 days"""
        print("📦 Checking recently updated plugins...")

        cmd = """wp plugin list --format=json | jq -r '.[] | select(.update != "none") | .name'"""
        result = self.run_ssh_command(cmd)

        if result['success']:
            return result['output'].strip().split('\n')
        return []

    def check_woocommerce_status(self):
        """Get WooCommerce system status"""
        print("🛒 Checking WooCommerce status...")

        cmd = "wp woocommerce status"
        result = self.run_ssh_command(cmd)

        return result.get('output', '')

    def disable_plugin_safely(self, plugin_slug):
        """Disable a plugin and create backup"""
        print(f"⚠️ Disabling plugin: {plugin_slug}")

        # Create backup first
        backup_cmd = f"cp -r wp-content/plugins/{plugin_slug} wp-content/plugins/{plugin_slug}.backup.$(date +%s)"
        self.run_ssh_command(backup_cmd)

        # Disable plugin
        cmd = f"wp plugin deactivate {plugin_slug}"
        result = self.run_ssh_command(cmd)

        return result['success']

    def enable_wp_debug(self):
        """Enable WordPress debugging temporarily"""
        print("🐛 Enabling WordPress debug mode...")

        cmd = """wp config set WP_DEBUG true --raw && wp config set WP_DEBUG_LOG true --raw"""
        return self.run_ssh_command(cmd)

    def disable_wp_debug(self):
        """Disable WordPress debugging"""
        cmd = """wp config set WP_DEBUG false --raw && wp config set WP_DEBUG_LOG false --raw"""
        return self.run_ssh_command(cmd)

    def test_checkout_endpoint(self):
        """Test if checkout endpoint is accessible"""
        print("🧪 Testing checkout endpoint...")

        cmd = """wp eval 'echo WC()->cart ? "Cart OK" : "Cart Error";'"""
        result = self.run_ssh_command(cmd)

        return result

    def get_active_payment_gateways(self):
        """List active payment gateways"""
        print("💳 Checking payment gateways...")

        cmd = """wp option get woocommerce_active_payment_methods --format=json"""
        result = self.run_ssh_command(cmd)

        if result['success']:
            try:
                return json.loads(result['output'])
            except:
                return []
        return []

    def flush_cache_and_transients(self):
        """Clear all caches and transients"""
        print("🧹 Flushing caches and transients...")

        commands = [
            "wp cache flush",
            "wp transient delete --all",
            "wp rewrite flush"
        ]

        for cmd in commands:
            self.run_ssh_command(cmd)

    def diagnose_mobile_checkout_error(self):
        """
        Comprehensive diagnostic for mobile checkout issues
        Returns dict with findings and recommended fixes
        """
        print("="*60)
        print("🚨 MOHAWK MEDIBLES - MOBILE CHECKOUT ERROR DIAGNOSTIC")
        print("="*60)

        findings = {
            'timestamp': datetime.now().isoformat(),
            'errors': [],
            'suspect_plugins': [],
            'recommended_fixes': []
        }

        # Step 1: Check error logs
        errors = self.check_error_logs()
        if errors:
            findings['errors'] = errors
            print(f"❌ Found {len(errors)} errors in logs")
            for err in errors[:5]:  # Show first 5
                print(f"   → {err[:100]}...")

        # Step 2: Check recently updated plugins
        updated_plugins = self.get_recently_updated_plugins()
        if updated_plugins:
            findings['suspect_plugins'] = updated_plugins
            print(f"📦 Recently updated plugins: {', '.join(updated_plugins)}")

        # Step 3: Test checkout endpoint
        checkout_test = self.test_checkout_endpoint()
        if not checkout_test['success']:
            findings['recommended_fixes'].append("Checkout endpoint is failing")

        # Step 4: Check payment gateways
        gateways = self.get_active_payment_gateways()
        findings['payment_gateways'] = gateways

        # Generate recommendations based on findings
        self._generate_recommendations(findings)

        return findings

    def _generate_recommendations(self, findings):
        """Generate fix recommendations based on diagnostic findings"""

        # Common mobile checkout error patterns
        if any('Fatal error' in err for err in findings['errors']):
            findings['recommended_fixes'].append({
                'priority': 'CRITICAL',
                'action': 'PHP Fatal Error Detected',
                'fix': 'Review error log, likely plugin compatibility issue',
                'command': 'Enable WP_DEBUG and reproduce error'
            })

        if 'woocommerce-stripe' in findings.get('suspect_plugins', []):
            findings['recommended_fixes'].append({
                'priority': 'HIGH',
                'action': 'Stripe plugin recently updated',
                'fix': 'Temporarily disable Stripe, test checkout, update Stripe settings',
                'command': 'wp plugin deactivate woocommerce-stripe-gateway'
            })

        if any('session' in err.lower() for err in findings['errors']):
            findings['recommended_fixes'].append({
                'priority': 'HIGH',
                'action': 'Session handling issue',
                'fix': 'Clear sessions and transients',
                'command': 'wp transient delete --all && wp cache flush'
            })

        if not findings['recommended_fixes']:
            findings['recommended_fixes'].append({
                'priority': 'MEDIUM',
                'action': 'No specific error found',
                'fix': 'Systematically disable plugins to isolate issue',
                'command': 'Start with payment gateway plugins'
            })

    def emergency_fix_procedure(self):
        """
        Emergency procedure to restore checkout functionality
        This is a safe, conservative approach
        """
        print("\n" + "="*60)
        print("🚑 EMERGENCY FIX PROCEDURE")
        print("="*60)

        steps = []

        # Step 1: Enable debugging
        print("\n[1/6] Enabling WordPress debugging...")
        result = self.enable_wp_debug()
        steps.append(('Enable Debug', result['success']))

        # Step 2: Flush caches
        print("[2/6] Flushing all caches and transients...")
        self.flush_cache_and_transients()
        steps.append(('Flush Caches', True))

        # Step 3: Check WooCommerce status
        print("[3/6] Checking WooCommerce system status...")
        wc_status = self.check_woocommerce_status()
        steps.append(('WC Status Check', bool(wc_status)))

        # Step 4: Get detailed diagnostics
        print("[4/6] Running full diagnostic...")
        findings = self.diagnose_mobile_checkout_error()
        steps.append(('Diagnostics', True))

        # Step 5: Save diagnostic report
        print("[5/6] Saving diagnostic report...")
        report_path = f"mohawk_checkout_diagnostic_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_path, 'w') as f:
            json.dump(findings, f, indent=2)
        print(f"   📄 Report saved: {report_path}")
        steps.append(('Save Report', True))

        # Step 6: Disable debug mode
        print("[6/6] Disabling debug mode...")
        self.disable_wp_debug()
        steps.append(('Disable Debug', True))

        # Summary
        print("\n" + "="*60)
        print("📊 PROCEDURE SUMMARY")
        print("="*60)
        for step_name, success in steps:
            status = "✅" if success else "❌"
            print(f"{status} {step_name}")

        print("\n🔍 FINDINGS:")
        if findings['errors']:
            print(f"   • {len(findings['errors'])} errors detected in logs")
        if findings['suspect_plugins']:
            print(f"   • {len(findings['suspect_plugins'])} recently updated plugins")

        print("\n💡 RECOMMENDED FIXES:")
        for i, fix in enumerate(findings['recommended_fixes'], 1):
            if isinstance(fix, dict):
                print(f"\n   {i}. [{fix['priority']}] {fix['action']}")
                print(f"      Fix: {fix['fix']}")
                print(f"      Command: {fix['command']}")
            else:
                print(f"   {i}. {fix}")

        return findings


def main():
    """Main execution"""
    print("🏥 Mohawk Medibles Checkout Fix Tool")
    print("-" * 60)

    # Load credentials
    config_path = Path(__file__).parent / "MohawkMedibles_SEO_v1.0" / "configs" / "credentials.json"

    if not config_path.exists():
        print("❌ Configuration file not found!")
        print(f"   Looking for: {config_path}")
        return

    with open(config_path) as f:
        config = json.load(f)

    # Get environment (staging or production)
    env = config['wpengine'].get('active_environment', 'staging')
    print(f"🌍 Environment: {env.upper()}")

    env_config = config['wpengine'][env]

    # Initialize fixer
    fixer = MohawkCheckoutFixer(
        ssh_host=env_config['ssh_host'],
        ssh_user=env_config['ssh_user'],
        ssh_key_path=env_config['ssh_key_path'],
        site_path=env_config['site_path']
    )

    # Run emergency fix procedure
    findings = fixer.emergency_fix_procedure()

    print("\n" + "="*60)
    print("✅ Diagnostic complete! Review the report above.")
    print("="*60)


if __name__ == "__main__":
    main()
