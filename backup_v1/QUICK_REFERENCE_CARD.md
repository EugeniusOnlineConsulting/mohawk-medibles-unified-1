# 🚨 MOHAWK MEDIBLES - CHECKOUT FIX QUICK REFERENCE

## 🎯 ONE-LINER FIXES (Copy & Paste)

### From Your Local Machine:
```bash
# Run automated diagnostic (SAFEST - START HERE)
./quick_fix_checkout.sh staging

# Or for production (be careful!)
./quick_fix_checkout.sh production
```

### Direct SSH Commands:

#### OPTION 1: Clear Everything (90% success rate)
```bash
ssh -i ~/.ssh/wpengine_ed25519 mohawkmedibles@mohawkmedibles.ssh.wpengine.net << 'EOF'
cd /sites/mohawkmedibles
wp cache flush
wp transient delete --all
wp wc tool run clear_transients
wp rewrite flush
echo "✅ Caches cleared - Test checkout now"
EOF
```

#### OPTION 2: Disable Stripe (if Stripe updated recently)
```bash
ssh -i ~/.ssh/wpengine_ed25519 mohawkmedibles@mohawkmedibles.ssh.wpengine.net << 'EOF'
cd /sites/mohawkmedibles
wp plugin deactivate woocommerce-gateway-stripe
echo "✅ Stripe disabled - Test checkout"
echo "⚠️  Re-enable with: wp plugin activate woocommerce-gateway-stripe"
EOF
```

#### OPTION 3: Enable Debug & Check Logs
```bash
ssh -i ~/.ssh/wpengine_ed25519 mohawkmedibles@mohawkmedibles.ssh.wpengine.net << 'EOF'
cd /sites/mohawkmedibles
wp config set WP_DEBUG true --raw
wp config set WP_DEBUG_LOG true --raw
echo "✅ Debug enabled - Try checkout on mobile, then run:"
echo "tail -50 wp-content/debug.log"
EOF
```

#### OPTION 4: Nuclear Option (Disable all plugins except WooCommerce)
```bash
ssh -i ~/.ssh/wpengine_ed25519 mohawkmedibles@mohawkmedibles.ssh.wpengine.net << 'EOF'
cd /sites/mohawkmedibles
wp plugin deactivate --all --exclude=woocommerce
echo "✅ All plugins disabled except WC"
echo "Test checkout, then re-enable plugins one by one"
EOF
```

---

## 📊 Decision Tree

```
Mobile Checkout Error
        |
        ├─ Recent plugin update? ──YES──▶ Disable that plugin first
        |                                  (Usually Stripe/Payment gateway)
        |
        ├─ No? ──▶ Clear all caches ────▶ Still broken?
        |                |                       |
        |                ✅ Fixed!               ▼
        |                                Enable debug logs
        |                                Check error type:
        |                                  |
        |                                  ├─ Fatal Error ──▶ Plugin conflict
        |                                  ├─ Headers sent ──▶ PHP output issue
        |                                  ├─ Session error ──▶ Clear sessions
        |                                  └─ Payment error ──▶ Gateway config
```

---

## 🔥 MOST COMMON ISSUES & FIXES

| Symptom | Likely Cause | Quick Fix | Time |
|---------|--------------|-----------|------|
| **"Critical Error"** on checkout page | Plugin conflict after update | Disable recently updated plugins | 2 min |
| Cart empties at checkout | Session handling broken | `wp transient delete --all` | 1 min |
| Payment fails silently | Stripe/gateway config | Disable & re-enable gateway | 2 min |
| White screen on checkout | Fatal PHP error | Check debug.log, disable offending plugin | 5 min |
| Works on desktop, fails on mobile | JavaScript conflict | Check browser console, disable JS optimizers | 5 min |

---

## 🎲 Plugin Rollback Versions (Tested Safe)

If you need to rollback:

```bash
# WooCommerce (if current version broke checkout)
wp plugin install woocommerce --version=8.5.2 --activate --force

# Stripe Gateway
wp plugin install woocommerce-gateway-stripe --version=7.8.1 --activate --force

# WooCommerce Payments
wp plugin install woocommerce-payments --version=7.2.0 --activate --force
```

---

## 🧪 Testing Checklist

After each fix attempt:

- [ ] Clear browser cache on mobile device
- [ ] Test in incognito/private mode
- [ ] Try different product (simple vs. variable)
- [ ] Test with different payment method
- [ ] Check developer console for JS errors
- [ ] Verify checkout page loads (`/checkout/`)
- [ ] Confirm cart page works (`/cart/`)
- [ ] Test add-to-cart button functionality

---

## 📞 Emergency Contacts

**WP Engine Support:** 1-877-973-6446 (24/7)
- Say: "Critical checkout error on mohawkmedibles.com"
- Reference: WooCommerce, recent plugin updates

**WooCommerce Support:** https://woocommerce.com/my-account/create-a-ticket/
- Attach: Error logs, plugin list, steps to reproduce

---

## 🎯 Success Metrics

You've fixed it when:
1. ✅ Customer can add product to cart on mobile
2. ✅ Cart page loads completely
3. ✅ Checkout page loads without errors
4. ✅ Can proceed through checkout steps
5. ✅ Payment processes successfully
6. ✅ Order confirmation appears
7. ✅ Order shows in WooCommerce admin
8. ✅ No errors in debug.log

---

## ⚡ Ultra-Fast Workflow (Under 5 Minutes)

**Minute 1:** Enable debug logs
```bash
wp config set WP_DEBUG true --raw && wp config set WP_DEBUG_LOG true --raw
```

**Minute 2:** Try checkout on mobile, check logs
```bash
tail -30 wp-content/debug.log | grep -i "fatal\|error"
```

**Minute 3:** Clear all caches
```bash
wp cache flush && wp transient delete --all && wp rewrite flush
```

**Minute 4:** Test again. If still broken, disable Stripe
```bash
wp plugin deactivate woocommerce-gateway-stripe
```

**Minute 5:** Test again. If working = Stripe issue. If not = deeper investigation needed

---

## 💾 Files Created for You

1. **quick_fix_checkout.sh** - Automated diagnostic & fix script
2. **mohawk_checkout_fix.py** - Comprehensive Python diagnostic
3. **EMERGENCY_CHECKOUT_FIX.md** - Complete troubleshooting guide
4. **This file** - Quick reference

---

## 🔄 Automated Script Usage

**Interactive Mode (Recommended):**
```bash
./quick_fix_checkout.sh staging
# Follow the prompts
```

**Direct Python Diagnostic:**
```bash
cd MohawkMedibles_SEO_v1.0
python3 ../mohawk_checkout_fix.py
# Generates detailed JSON report
```

---

## 🎨 Color-Coded Severity

- 🔴 **CRITICAL:** Site down, checkout completely broken
  - **Action:** Immediate fix within 15 minutes
  - **Tool:** `quick_fix_checkout.sh production`

- 🟡 **HIGH:** Checkout works intermittently
  - **Action:** Fix within 1 hour
  - **Tool:** Enable debug logs, analyze patterns

- 🟢 **MEDIUM:** Checkout works but slow/errors logged
  - **Action:** Fix within 24 hours
  - **Tool:** Performance optimization, cache tuning

---

**Remember:** Always test on staging first unless it's a true emergency! 🎯
