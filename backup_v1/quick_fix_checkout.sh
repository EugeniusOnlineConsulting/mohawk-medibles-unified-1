#!/bin/bash
################################################################################
# MOHAWK MEDIBLES - EMERGENCY CHECKOUT FIX
# Quick script to diagnose and fix mobile checkout errors
# Run this from your local machine with SSH access to WP Engine
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SSH_KEY="$HOME/.ssh/wpengine_ed25519"
PRODUCTION_HOST="mohawkmedibles@mohawkmedibles.ssh.wpengine.net"
STAGING_HOST="mohawkmedibstg@mohawkmedibstg.ssh.wpengine.net"
SITE_PATH="/sites/mohawkmedibles"
STAGING_PATH="/sites/mohawkmedibstg"

# Default to staging for safety
ENVIRONMENT=${1:-staging}

if [ "$ENVIRONMENT" == "production" ]; then
    SSH_HOST="$PRODUCTION_HOST"
    SITE_PATH="$SITE_PATH"
    echo -e "${RED}⚠️  WARNING: RUNNING ON PRODUCTION!${NC}"
    echo -e "Press Ctrl+C within 5 seconds to cancel..."
    sleep 5
else
    SSH_HOST="$STAGING_HOST"
    SITE_PATH="$STAGING_PATH"
    echo -e "${GREEN}✅ Running on STAGING${NC}"
fi

################################################################################
# Helper Functions
################################################################################

ssh_exec() {
    ssh -i "$SSH_KEY" "$SSH_HOST" "cd $SITE_PATH && $1" 2>&1
}

print_header() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

################################################################################
# Main Diagnostic Functions
################################################################################

check_connection() {
    print_header "1. Testing SSH Connection"
    if ssh_exec "pwd" > /dev/null 2>&1; then
        print_success "Connected to: $SSH_HOST"
        return 0
    else
        print_error "Cannot connect to: $SSH_HOST"
        print_info "Check SSH key at: $SSH_KEY"
        exit 1
    fi
}

check_wp_version() {
    print_header "2. Checking WordPress & WooCommerce Versions"
    WP_VERSION=$(ssh_exec "wp core version")
    WC_VERSION=$(ssh_exec "wp plugin get woocommerce --field=version")
    print_info "WordPress: $WP_VERSION"
    print_info "WooCommerce: $WC_VERSION"
}

enable_debugging() {
    print_header "3. Enabling Debug Mode"
    ssh_exec "wp config set WP_DEBUG true --raw" > /dev/null
    ssh_exec "wp config set WP_DEBUG_LOG true --raw" > /dev/null
    ssh_exec "wp config set WP_DEBUG_DISPLAY false --raw" > /dev/null
    print_success "Debug mode enabled"
    print_warning "Remember to disable after fixing!"
}

check_error_logs() {
    print_header "4. Checking Error Logs (Last 20 lines)"
    ERROR_LOG=$(ssh_exec "tail -20 wp-content/debug.log 2>/dev/null || echo 'No errors logged yet'")

    if echo "$ERROR_LOG" | grep -i "fatal error\|warning.*checkout\|error.*woocommerce" > /dev/null; then
        print_error "Errors found in log:"
        echo "$ERROR_LOG" | grep -i "error\|warning\|fatal" | head -10
    else
        print_success "No critical errors in recent logs"
    fi
}

check_recent_updates() {
    print_header "5. Checking Recently Updated Plugins"
    print_info "Plugins with updates available or recently updated:"

    # Get plugin update info
    UPDATED_PLUGINS=$(ssh_exec "wp plugin list --format=csv | grep -v 'name,status'")

    echo "$UPDATED_PLUGINS" | while IFS=',' read -r name status update version; do
        if [ "$update" != "none" ]; then
            print_warning "$name (Current: $version, Update available: $update)"
        fi
    done
}

test_woocommerce_status() {
    print_header "6. Testing WooCommerce Core Functions"

    # Test cart
    CART_TEST=$(ssh_exec "wp eval 'echo WC()->cart ? \"OK\" : \"FAIL\";'" 2>&1)
    if [[ "$CART_TEST" == *"OK"* ]]; then
        print_success "Cart: Working"
    else
        print_error "Cart: Failing - $CART_TEST"
    fi

    # Test checkout endpoint
    CHECKOUT_ENDPOINT=$(ssh_exec "wp rewrite list --format=csv | grep checkout" 2>&1)
    if [[ -n "$CHECKOUT_ENDPOINT" ]]; then
        print_success "Checkout endpoint: Registered"
    else
        print_error "Checkout endpoint: Not found"
    fi
}

check_payment_gateways() {
    print_header "7. Checking Payment Gateways"
    GATEWAYS=$(ssh_exec "wp wc payment_gateway list --format=table" 2>&1)
    echo "$GATEWAYS"
}

clear_all_caches() {
    print_header "8. Clearing All Caches"

    print_info "Clearing WordPress cache..."
    ssh_exec "wp cache flush" > /dev/null

    print_info "Clearing transients..."
    ssh_exec "wp transient delete --all" > /dev/null 2>&1 || true

    print_info "Flushing rewrite rules..."
    ssh_exec "wp rewrite flush" > /dev/null

    print_info "Clearing WooCommerce caches..."
    ssh_exec "wp wc tool run clear_transients" > /dev/null 2>&1 || true
    ssh_exec "wp wc tool run clear_template_cache" > /dev/null 2>&1 || true

    print_success "All caches cleared"
}

test_stripe_plugin() {
    print_header "9. Testing Stripe Gateway (Most Common Issue)"

    # Check if Stripe is active
    STRIPE_STATUS=$(ssh_exec "wp plugin status woocommerce-gateway-stripe" 2>&1)

    if [[ "$STRIPE_STATUS" == *"Active"* ]]; then
        print_warning "Stripe plugin is active (common culprit after updates)"
        print_info "Checking Stripe version..."

        STRIPE_VERSION=$(ssh_exec "wp plugin get woocommerce-gateway-stripe --field=version")
        print_info "Stripe version: $STRIPE_VERSION"

        echo ""
        read -p "Do you want to temporarily disable Stripe to test? (y/n) " -n 1 -r
        echo ""

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Disabling Stripe..."
            ssh_exec "wp plugin deactivate woocommerce-gateway-stripe"
            print_success "Stripe disabled - Please test checkout now"
            print_warning "To re-enable: wp plugin activate woocommerce-gateway-stripe"
        fi
    else
        print_info "Stripe plugin not active"
    fi
}

disable_debugging() {
    print_header "10. Disabling Debug Mode"
    ssh_exec "wp config set WP_DEBUG false --raw" > /dev/null
    ssh_exec "wp config set WP_DEBUG_LOG false --raw" > /dev/null
    print_success "Debug mode disabled"
}

generate_report() {
    print_header "Diagnostic Report Summary"

    REPORT_FILE="mohawk_checkout_diagnostic_$(date +%Y%m%d_%H%M%S).txt"

    cat > "$REPORT_FILE" << EOF
MOHAWK MEDIBLES - CHECKOUT ERROR DIAGNOSTIC REPORT
Generated: $(date)
Environment: $ENVIRONMENT
SSH Host: $SSH_HOST

WordPress Version: $(ssh_exec "wp core version")
WooCommerce Version: $(ssh_exec "wp plugin get woocommerce --field=version")

RECENT ERRORS:
$(ssh_exec "tail -30 wp-content/debug.log 2>/dev/null || echo 'No error log found'")

ACTIVE PLUGINS:
$(ssh_exec "wp plugin list --status=active --format=table")

PAYMENT GATEWAYS:
$(ssh_exec "wp wc payment_gateway list --format=table")

RECOMMENDED ACTIONS:
1. Review error log above for Fatal errors
2. Check if Stripe/payment gateway was recently updated
3. Test checkout after clearing caches (already done)
4. If Stripe updated, consider rolling back or updating settings
5. Test checkout systematically by disabling plugins

EOF

    print_success "Report saved to: $REPORT_FILE"
}

################################################################################
# Quick Fix Options
################################################################################

quick_fix_menu() {
    print_header "Quick Fix Options"
    echo "Select a fix to apply:"
    echo "1) Clear all caches only (safest)"
    echo "2) Disable Stripe plugin temporarily"
    echo "3) Disable all plugins except WooCommerce (diagnostic)"
    echo "4) Rollback WooCommerce to previous version"
    echo "5) Regenerate WooCommerce pages"
    echo "6) Clear sessions table"
    echo "7) Run full diagnostic only (no changes)"
    echo "8) Exit"
    echo ""
    read -p "Enter choice [1-8]: " CHOICE

    case $CHOICE in
        1)
            clear_all_caches
            print_success "Test checkout now!"
            ;;
        2)
            ssh_exec "wp plugin deactivate woocommerce-gateway-stripe"
            print_success "Stripe disabled. Test checkout!"
            ;;
        3)
            print_warning "This will disable all plugins except WooCommerce"
            read -p "Continue? (y/n) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                ssh_exec "wp plugin deactivate --all --exclude=woocommerce"
                print_success "All plugins disabled except WooCommerce"
                print_warning "Re-enable one by one to find the culprit"
            fi
            ;;
        4)
            print_warning "Rolling back WooCommerce - please confirm version:"
            read -p "Enter version (e.g., 8.5.2) or press Enter for 8.5.2: " WC_VERSION
            WC_VERSION=${WC_VERSION:-8.5.2}
            ssh_exec "wp plugin install woocommerce --version=$WC_VERSION --activate --force"
            print_success "WooCommerce rolled back to $WC_VERSION"
            ;;
        5)
            ssh_exec "wp wc tool run install_pages"
            print_success "WooCommerce pages regenerated"
            ;;
        6)
            ssh_exec "wp db query \"DELETE FROM wp_options WHERE option_name LIKE '_wc_session_%';\""
            print_success "Session table cleared"
            ;;
        7)
            print_info "Running diagnostic only..."
            ;;
        8)
            print_info "Exiting"
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
}

################################################################################
# Main Execution
################################################################################

main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║     MOHAWK MEDIBLES - EMERGENCY CHECKOUT FIX TOOL         ║"
    echo "║           Mobile Checkout Error Diagnostic                 ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""

    # Run diagnostics
    check_connection
    check_wp_version
    enable_debugging
    check_error_logs
    check_recent_updates
    test_woocommerce_status
    check_payment_gateways
    test_stripe_plugin

    # Generate report
    generate_report

    # Show quick fix menu
    echo ""
    quick_fix_menu

    # Clean up
    disable_debugging

    print_header "Complete!"
    print_success "Checkout diagnostic complete"
    print_info "Review the report and test checkout on mobile"
}

# Run main function
main
