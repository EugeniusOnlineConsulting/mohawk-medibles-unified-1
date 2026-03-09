<?php
/**
 * Comprehensive Site Audit for Mohawk Medibles
 * Checks: 404s, broken links, SEO issues, redirects
 */

echo "=======================================================\n";
echo "MOHAWK MEDIBLES - COMPREHENSIVE SITE AUDIT\n";
echo "Generated: " . date('Y-m-d H:i:s') . "\n";
echo "=======================================================\n\n";

$issues = array(
    'critical' => array(),
    'warning' => array(),
    'info' => array()
);

// ============================================
// 1. CHECK ALL PRODUCTS FOR SEO ISSUES
// ============================================
echo "1. PRODUCT SEO AUDIT\n";
echo "--------------------\n";

$products = get_posts(array(
    'post_type' => 'product',
    'post_status' => 'publish',
    'posts_per_page' => -1
));

$seo_stats = array(
    'total' => count($products),
    'missing_meta_desc' => 0,
    'short_meta_desc' => 0,
    'missing_focus_kw' => 0,
    'short_content' => 0,
    'missing_images' => 0,
    'missing_alt_text' => 0
);

foreach ($products as $product) {
    // Check meta description
    $meta_desc = get_post_meta($product->ID, '_yoast_wpseo_metadesc', true);
    if (empty($meta_desc)) {
        $seo_stats['missing_meta_desc']++;
    } elseif (strlen($meta_desc) < 120) {
        $seo_stats['short_meta_desc']++;
    }

    // Check focus keyphrase
    $focus_kw = get_post_meta($product->ID, '_yoast_wpseo_focuskw', true);
    if (empty($focus_kw)) {
        $seo_stats['missing_focus_kw']++;
    }

    // Check content length
    $content_length = strlen(strip_tags($product->post_content));
    if ($content_length < 100) {
        $seo_stats['short_content']++;
        $issues['warning'][] = "Short content ({$content_length} chars): {$product->post_title}";
    }

    // Check featured image
    $thumbnail_id = get_post_thumbnail_id($product->ID);
    if (!$thumbnail_id) {
        $seo_stats['missing_images']++;
    } else {
        $alt = get_post_meta($thumbnail_id, '_wp_attachment_image_alt', true);
        if (empty($alt)) {
            $seo_stats['missing_alt_text']++;
        }
    }
}

echo "Total Products: {$seo_stats['total']}\n";
echo "Missing Meta Description: {$seo_stats['missing_meta_desc']}\n";
echo "Short Meta Description (<120 chars): {$seo_stats['short_meta_desc']}\n";
echo "Missing Focus Keyphrase: {$seo_stats['missing_focus_kw']}\n";
echo "Short Content (<100 chars): {$seo_stats['short_content']}\n";
echo "Missing Featured Image: {$seo_stats['missing_images']}\n";
echo "Missing Image Alt Text: {$seo_stats['missing_alt_text']}\n\n";

// ============================================
// 2. CHECK BLOG POSTS SEO
// ============================================
echo "2. BLOG SEO AUDIT\n";
echo "-----------------\n";

$blogs = get_posts(array(
    'post_type' => 'post',
    'post_status' => 'publish',
    'posts_per_page' => -1
));

echo "Total Published Blogs: " . count($blogs) . "\n";
foreach ($blogs as $blog) {
    $meta_desc = get_post_meta($blog->ID, '_yoast_wpseo_metadesc', true);
    $focus_kw = get_post_meta($blog->ID, '_yoast_wpseo_focuskw', true);
    $seo_title = get_post_meta($blog->ID, '_yoast_wpseo_title', true);
    $word_count = str_word_count(strip_tags($blog->post_content));

    $blog_issues = array();
    if (empty($meta_desc)) $blog_issues[] = "No meta desc";
    if (empty($focus_kw)) $blog_issues[] = "No focus KW";
    if (empty($seo_title)) $blog_issues[] = "No SEO title";
    if ($word_count < 300) $blog_issues[] = "Short ({$word_count} words)";

    $status = empty($blog_issues) ? "✅" : "⚠️";
    echo "$status {$blog->post_title}";
    if (!empty($blog_issues)) {
        echo " - " . implode(", ", $blog_issues);
    }
    echo "\n";
}
echo "\n";

// ============================================
// 3. CHECK CRITICAL PAGES
// ============================================
echo "3. CRITICAL PAGES CHECK\n";
echo "-----------------------\n";

$critical_pages = array(
    'Homepage' => get_option('page_on_front'),
    'Shop' => get_option('woocommerce_shop_page_id'),
    'Cart' => get_option('woocommerce_cart_page_id'),
    'Checkout' => get_option('woocommerce_checkout_page_id'),
    'My Account' => get_option('woocommerce_myaccount_page_id')
);

foreach ($critical_pages as $name => $page_id) {
    if ($page_id) {
        $page = get_post($page_id);
        if ($page && $page->post_status == 'publish') {
            echo "✅ $name (ID: $page_id) - Published\n";
        } else {
            echo "❌ $name (ID: $page_id) - NOT PUBLISHED\n";
            $issues['critical'][] = "$name page not published";
        }
    } else {
        echo "❌ $name - NOT SET\n";
        $issues['critical'][] = "$name page not configured";
    }
}
echo "\n";

// ============================================
// 4. CHECK YOAST REDIRECTS COUNT
// ============================================
echo "4. REDIRECTS STATUS\n";
echo "-------------------\n";

$redirects = get_option('wpseo-premium-redirects-base', array());
echo "Total 301 Redirects: " . count($redirects) . "\n\n";

// ============================================
// 5. CHECK FOR COMMON SEO ISSUES
// ============================================
echo "5. SITE-WIDE SEO CHECK\n";
echo "----------------------\n";

// Check robots.txt accessibility
$robots_content = @file_get_contents(home_url('/robots.txt'));
if ($robots_content && strpos($robots_content, 'Disallow: /') !== 0) {
    echo "✅ robots.txt accessible\n";
} else {
    echo "⚠️ robots.txt may have issues\n";
}

// Check sitemap
$sitemap_url = home_url('/sitemap_index.xml');
echo "✅ Sitemap URL: $sitemap_url\n";

// Check SSL
if (is_ssl()) {
    echo "✅ SSL enabled\n";
} else {
    echo "❌ SSL not enabled\n";
    $issues['critical'][] = "SSL not enabled";
}

echo "\n";

// ============================================
// 6. CATEGORY CHECK
// ============================================
echo "6. PRODUCT CATEGORIES\n";
echo "---------------------\n";

$categories = get_terms(array(
    'taxonomy' => 'product_cat',
    'hide_empty' => false
));

$empty_cats = 0;
foreach ($categories as $cat) {
    if ($cat->count == 0) {
        $empty_cats++;
    }
}

echo "Total Categories: " . count($categories) . "\n";
echo "Empty Categories: $empty_cats\n\n";

// ============================================
// 7. SAMPLE URL TESTS
// ============================================
echo "7. SAMPLE URL STATUS CHECKS\n";
echo "---------------------------\n";

$test_urls = array(
    home_url('/'),
    home_url('/mohawk-medibles-deseronto-online-shop/'),
    home_url('/product-category/flower/'),
    home_url('/product-category/edibles/'),
    home_url('/product-category/concentrates/'),
    home_url('/about-us/'),
    home_url('/contact/'),
    home_url('/faq/')
);

foreach ($test_urls as $url) {
    $response = wp_remote_head($url, array('timeout' => 5, 'sslverify' => false));
    if (is_wp_error($response)) {
        echo "❌ ERROR: $url\n";
        $issues['critical'][] = "Page error: $url";
    } else {
        $code = wp_remote_retrieve_response_code($response);
        if ($code == 200) {
            echo "✅ 200: $url\n";
        } elseif ($code == 301 || $code == 302) {
            echo "↪️ $code: $url\n";
        } else {
            echo "❌ $code: $url\n";
            $issues['warning'][] = "HTTP $code: $url";
        }
    }
}

echo "\n";

// ============================================
// SUMMARY
// ============================================
echo "=======================================================\n";
echo "AUDIT SUMMARY\n";
echo "=======================================================\n";

echo "\n🔴 CRITICAL ISSUES: " . count($issues['critical']) . "\n";
foreach ($issues['critical'] as $issue) {
    echo "   - $issue\n";
}

echo "\n🟡 WARNINGS: " . count($issues['warning']) . "\n";
if (count($issues['warning']) <= 10) {
    foreach ($issues['warning'] as $issue) {
        echo "   - $issue\n";
    }
} else {
    echo "   (First 10 shown)\n";
    for ($i = 0; $i < 10; $i++) {
        echo "   - {$issues['warning'][$i]}\n";
    }
}

echo "\n=======================================================\n";
echo "SEO HEALTH SCORE\n";
echo "=======================================================\n";

$total_products = $seo_stats['total'];
$issues_count = $seo_stats['missing_meta_desc'] + $seo_stats['missing_focus_kw'] + $seo_stats['short_content'];
$score = round((1 - ($issues_count / ($total_products * 3))) * 100);

echo "Product SEO Score: $score / 100\n";

if ($score >= 90) {
    echo "Grade: A - Excellent!\n";
} elseif ($score >= 80) {
    echo "Grade: B - Good\n";
} elseif ($score >= 70) {
    echo "Grade: C - Needs Improvement\n";
} else {
    echo "Grade: D - Significant Issues\n";
}

echo "\n";
