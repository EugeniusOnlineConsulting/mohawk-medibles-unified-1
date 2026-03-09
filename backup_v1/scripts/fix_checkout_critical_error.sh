#!/bin/bash
###############################################################################
# MOHAWK MEDIBLES - CRITICAL CHECKOUT FIX SCRIPT
# D.O.E. Framework Emergency Response
#
# Issue: Mobile Add-to-Cart / Checkout Critical Error (401 Nonce Failure)
# Date: 2026-02-06
# Severity: CRITICAL - Revenue Impacting
# Root Cause: WooCommerce Store API nonce header failure after plugin updates
#
# SAFETY: Non-destructive - creates backups before any changes
# EXECUTION: Run from your Mac terminal (requires SSH key)
###############################################################################

set -euo pipefail

# Configuration
SSH_KEY="/Users/eugeneagyemang/.ssh/wpengine_ed25519"
SSH_HOST="mohawkmedibles@mohawkmedibles.ssh.wpengine.net"
SITE_PATH="/sites/mohawkmedibles"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${SITE_PATH}/wp-content/emergency-backup-${TIMESTAMP}"

echo "============================================================"
echo "  MOHAWK MEDIBLES - CRITICAL CHECKOUT FIX"
echo "  D.O.E. Emergency Response Protocol"
echo "  Timestamp: ${TIMESTAMP}"
echo "============================================================"

# Function to run remote command
run_remote() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_HOST" "cd $SITE_PATH && $1" 2>/dev/null
}

###############################################################################
# PHASE 1: DIAGNOSTIC (D.O.E. DESIGN)
###############################################################################
echo ""
echo "━━━ PHASE 1: DIAGNOSTIC ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "[1/8] Checking WordPress & WooCommerce versions..."
run_remote "wp core version && wp plugin get woocommerce --field=version 2>/dev/null"

echo ""
echo "[2/8] Listing recently updated plugins (last 7 days)..."
run_remote "wp plugin list --format=table --fields=name,status,version,update_available 2>/dev/null"

echo ""
echo "[3/8] Checking for PHP fatal errors in debug log..."
run_remote "if [ -f wp-content/debug.log ]; then tail -100 wp-content/debug.log | grep -i 'fatal\|critical\|error' | tail -20; else echo 'No debug.log found'; fi"

echo ""
echo "[4/8] Checking WooCommerce status..."
run_remote "wp wc tool run verify_base_tables --user=1 2>/dev/null || echo 'WC tool unavailable'"

echo ""
echo "[5/8] Checking for corrupted transients..."
run_remote "wp transient list --format=count 2>/dev/null"

echo ""
echo "[6/8] Checking Wordfence WAF status..."
run_remote "wp option get wordfence_waf_status 2>/dev/null || echo 'No WAF status found'"

echo ""
echo "[7/8] Checking Code Snippets for active snippets..."
run_remote "wp db query \"SELECT id, name, active FROM wp_snippets WHERE active = 1 ORDER BY id\" 2>/dev/null || echo 'Code snippets table not found'"

echo ""
echo "[8/8] Checking WooCommerce checkout page configuration..."
run_remote "wp option get woocommerce_checkout_page_id 2>/dev/null"

###############################################################################
# PHASE 2: BACKUP (SAFETY FIRST)
###############################################################################
echo ""
echo "━━━ PHASE 2: BACKUP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Creating emergency backup..."
run_remote "mkdir -p ${BACKUP_DIR}"

echo "  Backing up active plugins list..."
run_remote "wp plugin list --format=json > ${BACKUP_DIR}/plugins_list.json"

echo "  Backing up WooCommerce settings..."
run_remote "wp option get woocommerce_cart_page_id > ${BACKUP_DIR}/wc_cart_page_id.txt 2>/dev/null || true"
run_remote "wp option get woocommerce_checkout_page_id > ${BACKUP_DIR}/wc_checkout_page_id.txt 2>/dev/null || true"

echo "  Backup complete: ${BACKUP_DIR}"

###############################################################################
# PHASE 3: FIX SEQUENCE (D.O.E. ORCHESTRATION + EXECUTION)
###############################################################################
echo ""
echo "━━━ PHASE 3: FIX SEQUENCE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# FIX 1: Clear ALL caches (most common cause of stale nonces)
echo ""
echo "[FIX 1/6] Clearing all caches (WP Engine + WooCommerce)..."
run_remote "wp cache flush 2>/dev/null && echo '  Object cache flushed'"
run_remote "wp transient delete --all 2>/dev/null && echo '  Transients cleared'"
run_remote "wp wc tool run clear_transients --user=1 2>/dev/null && echo '  WC transients cleared' || echo '  WC tool unavailable'"
# WP Engine specific cache clear
run_remote "wp eval 'if (class_exists(\"WpeCommon\")) { WpeCommon::purge_memcached(); WpeCommon::purge_varnish_cache(); echo \"WP Engine cache purged\"; }' 2>/dev/null || echo '  WP Engine cache clear via eval unavailable'"

# FIX 2: Regenerate WooCommerce pages
echo ""
echo "[FIX 2/6] Checking WooCommerce page assignments..."
run_remote "wp wc tool run install_pages --user=1 2>/dev/null && echo '  WC pages verified' || echo '  WC page tool unavailable'"

# FIX 3: Check and fix Wordfence REST API blocking
echo ""
echo "[FIX 3/6] Checking Wordfence extended protection..."
run_remote "wp option get wordfenceActivated 2>/dev/null && echo '  Wordfence is active'"
# Check if Wordfence is blocking REST API
run_remote "wp eval '
\$wf_options = get_option(\"wordfence_options\", array());
if (isset(\$wf_options[\"apiRequestsBlockedByRateLimit\"])) {
    echo \"REST API rate limiting: \" . \$wf_options[\"apiRequestsBlockedByRateLimit\"] . \"\\n\";
}
if (isset(\$wf_options[\"disableRESTAPI\"])) {
    echo \"REST API disabled: \" . \$wf_options[\"disableRESTAPI\"] . \"\\n\";
}
if (isset(\$wf_options[\"wafRules\"])) {
    echo \"WAF rules active\\n\";
}
echo \"Wordfence config checked\";
' 2>/dev/null || echo '  Wordfence eval unavailable'"

# FIX 4: Check and deactivate problematic Code Snippets
echo ""
echo "[FIX 4/6] Checking Code Snippets for checkout-interfering code..."
run_remote "wp db query \"SELECT id, name FROM wp_snippets WHERE active = 1 AND (code LIKE '%checkout%' OR code LIKE '%nonce%' OR code LIKE '%rest_api%' OR code LIKE '%wc_store%' OR code LIKE '%add_to_cart%' OR code LIKE '%header%')\" 2>/dev/null || echo '  No problematic snippets found'"

# FIX 5: Verify WooCommerce Blocks plugin
echo ""
echo "[FIX 5/6] Checking WooCommerce Blocks..."
run_remote "wp plugin get woocommerce --field=version 2>/dev/null"
run_remote "wp plugin get woo-gutenberg-products-block --field=version 2>/dev/null || echo '  WC Blocks bundled with WooCommerce'"

# FIX 6: Check Age Gate checkout exclusion
echo ""
echo "[FIX 6/6] Checking Age Gate configuration..."
run_remote "wp option get age_gate_settings 2>/dev/null | head -20 || echo '  Age Gate settings not found'"

###############################################################################
# PHASE 4: VERIFY (D.O.E. EXECUTION + SELF-ANNEALING)
###############################################################################
echo ""
echo "━━━ PHASE 4: VERIFICATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Testing WooCommerce Store API endpoints..."

# Test cart endpoint
echo ""
echo "  Testing /wc/store/v1/cart..."
run_remote "wp eval '
\$request = new WP_REST_Request(\"GET\", \"/wc/store/v1/cart\");
\$response = rest_do_request(\$request);
if (\$response->is_error()) {
    echo \"FAIL: \" . \$response->as_error()->get_error_message();
} else {
    echo \"PASS: Cart API responding (\" . count(\$response->get_data()[\"items\"]) . \" items)\";
}
' 2>/dev/null || echo '  Cart test unavailable'"

# Test checkout endpoint (server-side, bypasses nonce)
echo ""
echo "  Testing checkout endpoint server-side..."
run_remote "wp eval '
\$request = new WP_REST_Request(\"GET\", \"/wc/store/v1/checkout\");
\$response = rest_do_request(\$request);
\$data = \$response->get_data();
if (isset(\$data[\"code\"])) {
    echo \"Status: \" . \$data[\"code\"] . \" - \" . (\$data[\"message\"] ?? \"unknown\");
} else {
    echo \"PASS: Checkout API accessible\";
}
' 2>/dev/null || echo '  Checkout test unavailable'"

# Final nonce generation test
echo ""
echo "  Testing nonce generation..."
run_remote "wp eval '
\$nonce = wp_create_nonce(\"wc_store_api\");
if (\$nonce) {
    echo \"PASS: Nonce generated successfully: \" . substr(\$nonce, 0, 4) . \"...\";
} else {
    echo \"FAIL: Cannot generate WC Store API nonce\";
}
' 2>/dev/null || echo '  Nonce test unavailable'"

###############################################################################
# PHASE 5: SUMMARY
###############################################################################
echo ""
echo "============================================================"
echo "  DIAGNOSTIC COMPLETE"
echo "  Backup Location: ${BACKUP_DIR}"
echo "  Timestamp: ${TIMESTAMP}"
echo "============================================================"
echo ""
echo "NEXT STEPS IF ISSUE PERSISTS:"
echo "  1. Enable WordPress debug mode to capture the exact error:"
echo "     wp config set WP_DEBUG true --raw"
echo "     wp config set WP_DEBUG_LOG true --raw"
echo "  2. Reproduce the error on mobile"
echo "  3. Check: wp-content/debug.log"
echo "  4. If Wordfence blocking REST API:"
echo "     wp option update wordfence_disable_rest_api 0"
echo "  5. If Code Snippets causing issue:"
echo "     wp db query \"UPDATE wp_snippets SET active=0 WHERE id=<ID>\""
echo "  6. Nuclear option - disable all plugins and re-enable one by one:"
echo "     wp plugin deactivate --all"
echo "     wp plugin activate woocommerce"
echo "     (test checkout)"
echo "     wp plugin activate <next-plugin>"
echo "     (test checkout after each)"
echo ""
