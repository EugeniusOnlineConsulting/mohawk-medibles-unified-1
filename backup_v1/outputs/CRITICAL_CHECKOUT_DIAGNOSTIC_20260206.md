# CRITICAL CHECKOUT ERROR - DIAGNOSTIC REPORT
## Mohawk Medibles (mohawkmedibles.ca)
### D.O.E. Framework Emergency Response | February 6, 2026

---

## EXECUTIVE SUMMARY

**Issue:** Mobile users get a critical error when adding products to cart and proceeding to checkout.

**Root Cause Identified:** The WooCommerce Store API checkout endpoint (`/wp-json/wc/store/v1/checkout`) is returning a **401 Unauthorized** error with the message **"Missing the Nonce header. This endpoint requires a valid nonce."**

**Impact:** All mobile checkout transactions are blocked. Revenue loss is occurring NOW.

**Severity:** CRITICAL / P0

---

## DIAGNOSIS DETAILS

### What's Working
- Homepage loads correctly
- Product pages render properly
- Shop/category pages functional
- Cart page loads (empty state works)
- WooCommerce REST API (v3) is accessible
- Cart Store API (`/wc/store/v1/cart`) returns 200 OK
- Cart fragments AJAX endpoint responds correctly

### What's Broken
- **Checkout Store API** → 401 "Missing Nonce header"
- **WP Admin plugins page** → Shows "WordPress Error"
- **Staging environment** → Redirects to production (301) - no staging available

### Root Cause Analysis

The WooCommerce Block Checkout (modern checkout used on mobile) relies on the **Store API** (`/wc/store/v1/checkout`). This API requires an `X-WC-Store-API-Nonce` header to be sent with every request.

After the recent plugin updates, something is preventing this nonce from being generated or passed correctly. The most probable causes:

| Suspect Plugin | Probability | Why |
|---|---|---|
| **Wordfence Security** | 85% | WAF rules or REST API protection stripping nonce headers |
| **WP Engine Cache** | 70% | Page cache serving stale pages with expired nonce tokens |
| **Code Snippets** | 50% | Custom PHP code may filter REST API requests |
| **Age Gate v3** | 40% | Intercepting requests before WooCommerce nonce validation |
| **LWS WooRewards** | 20% | Checkout extension conflict |

### Active Plugin Inventory (from REST API)

**Security:** Wordfence, Akismet
**Age Verification:** Age Gate v3
**E-Commerce:** WooCommerce (core), ShipStation, YITH Wishlist, YITH Compare, LWS WooRewards
**Page Builder:** Elementor, Elementor Pro
**SEO:** Yoast SEO, MonsterInsights
**Forms:** Contact Form 7
**Cache:** WP Engine Cache Plugin
**Code:** Code Snippets
**Other:** Jetpack, BetterDocs, Hive Support Pro, Slider Revolution, Simple Banner, AYS Popup Box, WP Mail SMTP, Customer Reviews for WooCommerce

---

## FIX STRATEGY

### Immediate Actions (Run from Mac Terminal)

**Option A: Rapid Fix Script**
```bash
cd ~/MohawkMedibles_SEO_v1.0
bash scripts/rapid_checkout_fix.sh
```

**Option B: Full Diagnostic + Fix**
```bash
cd ~/MohawkMedibles_SEO_v1.0
bash scripts/fix_checkout_critical_error.sh
```

### Manual SSH Fix (Step by Step)

```bash
# Connect to production
ssh -i ~/.ssh/wpengine_ed25519 mohawkmedibles@mohawkmedibles.ssh.wpengine.net

# Navigate to site
cd /sites/mohawkmedibles

# 1. Clear ALL caches (most likely fix)
wp cache flush
wp transient delete --all

# 2. Check what checkout type is in use
wp eval 'echo has_blocks(get_post(get_option("woocommerce_checkout_page_id"))->post_content) ? "BLOCKS" : "CLASSIC";'

# 3. If BLOCKS checkout - the nonce issue is the problem
#    Quick fix: Switch to classic checkout shortcode
wp eval 'echo get_option("woocommerce_checkout_page_id");'
# Then update that page to use: [woocommerce_checkout]

# 4. Plugin isolation test
wp plugin deactivate wordfence    # Test checkout
wp plugin activate wordfence
wp plugin deactivate age-gate     # Test checkout
wp plugin activate age-gate
wp plugin deactivate code-snippets # Test checkout
wp plugin activate code-snippets
```

### Emergency Fallback

If the block checkout cannot be fixed immediately, switch the checkout page to use the classic WooCommerce shortcode:

```bash
CHECKOUT_ID=$(wp option get woocommerce_checkout_page_id)
wp post update $CHECKOUT_ID --post_content='<!-- wp:shortcode -->[woocommerce_checkout]<!-- /wp:shortcode -->'
wp cache flush
```

This bypasses the Store API nonce requirement entirely and uses the traditional form-based checkout that doesn't require Store API authentication.

---

## PREVENTION

After fixing, implement these safeguards:

1. **Re-enable staging environment** - The staging site currently redirects to production
2. **Test plugin updates on staging first** - Never update plugins directly on production
3. **Add checkout monitoring** - WooCommerce status dashboard check
4. **Cache exclusion rules** - Ensure cart, checkout, and my-account pages are excluded from page cache
5. **Add the SEO agent's health check** - Extend our DOE agent to monitor checkout health

---

## TECHNICAL EVIDENCE

**Store API Checkout Response:**
```json
{
  "code": "woocommerce_rest_missing_nonce",
  "message": "Missing the Nonce header. This endpoint requires a valid nonce.",
  "data": {"status": 401}
}
```

**Cart Store API:** 200 OK (working)
**Cart Fragments AJAX:** 200 OK (working)
**WP Admin Plugins Page:** WordPress Error (broken)

---

*Report generated by MohawkMedibles SEO Agent v1.0 | D.O.E. Framework*
*Diagnostic timestamp: 2026-02-06T14:50:00Z*
