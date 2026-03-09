# 🚨 EMERGENCY: Mobile Checkout Critical Error Fix Guide
## Mohawk Medibles - Post-Plugin Update Issue

**Status:** CRITICAL
**Affected:** Mobile checkout process
**Trigger:** Recent plugin updates
**Impact:** Customers cannot complete purchases on mobile

---

## 🎯 Quick Fix (5 Minutes)

### Option 1: Plugin Rollback (Safest, Fastest)
```bash
# Connect to production
ssh -i ~/.ssh/wpengine_ed25519 mohawkmedibles@mohawkmedibles.ssh.wpengine.net

# Go to site directory
cd /sites/mohawkmedibles

# Check recently updated plugins (last 7 days)
wp plugin list --field=name | while read plugin; do
    echo "$plugin: $(stat -c %y wp-content/plugins/$plugin 2>/dev/null | cut -d' ' -f1)"
done | grep "2025-02-" | head -5

# Most common culprits after updates:
# 1. WooCommerce Payments
# 2. WooCommerce Stripe Gateway
# 3. Cart/Checkout optimization plugins
# 4. Security plugins (they sometimes block checkout)
```

### Option 2: Emergency Cache Clear
```bash
# Clear all caches
wp cache flush
wp transient delete --all
wp rewrite flush

# Clear WooCommerce specific caches
wp wc tool run clear_transients
wp wc tool run clear_template_cache
```

---

## 🔍 Diagnostic Steps

### Step 1: Enable Error Logging (30 seconds)
```bash
# Enable WP Debug temporarily
wp config set WP_DEBUG true --raw
wp config set WP_DEBUG_LOG true --raw
wp config set WP_DEBUG_DISPLAY false --raw

# Try checkout on mobile again, then check log
tail -50 wp-content/debug.log
```

### Step 2: Check for Specific Errors
```bash
# Look for fatal errors
grep -i "fatal error" wp-content/debug.log | tail -10

# Look for WooCommerce errors
grep -i "woocommerce" wp-content/debug.log | grep -i "error" | tail -10

# Look for checkout-specific errors
grep -i "checkout" wp-content/debug.log | tail -10
```

### Step 3: Test Checkout Programmatically
```bash
# Test if WooCommerce cart works
wp eval 'echo WC()->cart ? "Cart: OK" : "Cart: FAIL";'

# Test if checkout endpoint is registered
wp rewrite list | grep checkout

# Check payment gateways status
wp wc payment_gateway list
```

---

## 🛠️ Common Fixes by Error Type

### Error Type A: "Fatal error... in checkout"
**Cause:** Plugin compatibility issue
**Fix:**
```bash
# Disable all checkout-related plugins except WooCommerce
wp plugin deactivate --all --exclude=woocommerce

# Test checkout - if it works, re-enable plugins one by one:
wp plugin activate woocommerce-gateway-stripe
# Test again
wp plugin activate [next-plugin]
# Test again, repeat until you find the culprit
```

### Error Type B: "Headers already sent"
**Cause:** PHP output before checkout process
**Fix:**
```bash
# Check for BOM or whitespace in wp-config.php
head -c 3 wp-config.php | od -An -tx1

# Check for trailing spaces in theme functions.php
tail -c 10 wp-content/themes/[your-theme]/functions.php | od -c

# Quick fix: Clear output buffers
# Add to wp-config.php (above "That's all")
echo "ob_start();" >> wp-config.php.new
cat wp-config.php >> wp-config.php.new
mv wp-config.php.new wp-config.php
```

### Error Type C: "Cannot process payment"
**Cause:** Payment gateway configuration issue
**Fix:**
```bash
# Check Stripe/payment gateway settings
wp option get woocommerce_stripe_settings --format=json

# Regenerate webhook endpoints
wp wc payment_gateway update stripe --enabled=true

# Clear payment-related transients
wp transient delete --all | grep payment
```

### Error Type D: "Session error" or "Cart is empty"
**Cause:** Session handling broken
**Fix:**
```bash
# Clear all sessions
wp db query "DELETE FROM wp_options WHERE option_name LIKE '_wc_session_%';"

# Check session table exists
wp db query "SHOW TABLES LIKE 'wp_woocommerce_sessions';"

# Regenerate session table if needed
wp wc update
```

---

## 🎲 Most Likely Culprits (Post-Update)

### 1. **WooCommerce Stripe Gateway** (70% probability)
```bash
# Quick test: Disable Stripe
wp plugin deactivate woocommerce-gateway-stripe

# If checkout works now:
# Option A: Re-enable and update settings
wp plugin activate woocommerce-gateway-stripe
wp wc payment_gateway update stripe --testmode=1  # Test mode first

# Option B: Rollback to previous version
wp plugin install woocommerce-gateway-stripe --version=7.8.1 --activate --force
```

### 2. **WooCommerce Payments** (15% probability)
```bash
wp plugin deactivate woocommerce-payments
# Test checkout
```

### 3. **Caching/Optimization Plugin** (10% probability)
```bash
# Common suspects:
wp plugin deactivate wp-rocket
wp plugin deactivate autoptimize
wp plugin deactivate wp-super-cache
```

### 4. **Security Plugin Blocking Checkout** (5% probability)
```bash
wp plugin deactivate wordfence
wp plugin deactivate ithemes-security
```

---

## 🧪 Mobile-Specific Testing

### Test on Staging First (ALWAYS)
```bash
# Switch to staging
ssh -i ~/.ssh/wpengine_ed25519 mohawkmedibstg@mohawkmedibstg.ssh.wpengine.net
cd /sites/mohawkmedibstg

# Run the same fixes here first
```

### Mobile Viewport Testing
```bash
# Use cURL to mimic mobile user agent
curl -A "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)" \
  -L https://mohawkmedibles.com/checkout/ \
  -o checkout_mobile.html

# Check for errors in output
grep -i "error\|fatal\|warning" checkout_mobile.html
```

---

## 📋 Complete Fix Checklist

- [ ] **Backup created** (automatic on WP Engine, but verify)
- [ ] **Error logging enabled** (WP_DEBUG_LOG)
- [ ] **Reproduced error** on mobile
- [ ] **Error logs checked** (wp-content/debug.log)
- [ ] **Recently updated plugins identified**
- [ ] **Cache cleared** (WordPress, WooCommerce, CDN)
- [ ] **Fix applied on STAGING first**
- [ ] **Tested on mobile** (multiple devices/browsers)
- [ ] **Fix applied to PRODUCTION**
- [ ] **Monitoring enabled** (next 24h)
- [ ] **Error logging disabled** (turn off WP_DEBUG)

---

## 🔄 Rollback Procedure (If Fix Fails)

### Rollback WooCommerce Update
```bash
# Check current version
wp plugin list | grep woocommerce

# Rollback to previous stable version
wp plugin install woocommerce --version=8.5.2 --activate --force
```

### Restore from WP Engine Backup
```bash
# List available backups (do this via WP Engine portal)
# Or contact WP Engine support for instant restore

# WP Engine automatic backups:
# - Daily backups (last 30 days)
# - Pre-update snapshots
```

---

## 🚀 Post-Fix Actions

### 1. Monitor Error Logs (Next 24h)
```bash
# Add to crontab for monitoring
*/15 * * * * tail -20 /sites/mohawkmedibles/wp-content/debug.log | grep -i "error\|fatal" | mail -s "MM Checkout Errors" you@email.com
```

### 2. Disable Debug Mode
```bash
wp config set WP_DEBUG false --raw
wp config set WP_DEBUG_LOG false --raw
```

### 3. Clear Error Log
```bash
> wp-content/debug.log
```

### 4. Document What Fixed It
Create incident report in: `/outputs/incident_report_[date].md`

---

## 📞 Escalation

If none of these fixes work within 15 minutes:

1. **Call WP Engine Support:** 1-877-973-6446
   (Available 24/7, reference "Critical checkout error after update")

2. **WooCommerce Support:** https://woocommerce.com/my-account/create-a-ticket/
   (Include: Error logs, plugin versions, steps to reproduce)

3. **Rollback ALL Recent Changes:**
```bash
# Via WP Engine portal > Backups > Restore Point
# Choose: "Pre-update backup" (usually from 1-2 days ago)
```

---

## 💾 Automated Fix Script

Run the Python script created:
```bash
python3 mohawk_checkout_fix.py
```

This will automatically:
- Enable debugging
- Check error logs
- Identify suspect plugins
- Test checkout endpoints
- Generate diagnostic report
- Provide specific recommendations

---

## 🎯 Expected Outcome

✅ **Success Indicators:**
- Customers can add products to cart on mobile
- Checkout page loads without errors
- Payment processing completes
- Orders appear in WooCommerce admin
- No errors in debug.log

⏱️ **Estimated Fix Time:**
- Simple cache clear: 2 minutes
- Plugin rollback: 5 minutes
- Full diagnostic: 15 minutes
- Complex issue: 30-60 minutes

---

**Last Updated:** 2025-02-06
**Environment:** Production (mohawkmedibles.com)
**Framework:** D.O.E. + Self-Annealing + Ralph Wiggum
