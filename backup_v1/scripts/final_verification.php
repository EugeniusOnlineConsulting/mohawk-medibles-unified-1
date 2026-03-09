<?php
/**
 * Final Site Verification Report
 */

echo "================================================================\n";
echo "MOHAWK MEDIBLES - FINAL VERIFICATION REPORT\n";
echo "Generated: " . date('Y-m-d H:i:s') . "\n";
echo "================================================================\n\n";

// Product Stats
$products = get_posts(array('post_type' => 'product', 'post_status' => 'publish', 'posts_per_page' => -1));
$total = count($products);

$missing_meta = 0;
$missing_focus = 0;
$missing_alt = 0;
$short_content = 0;

foreach ($products as $p) {
    if (empty(get_post_meta($p->ID, '_yoast_wpseo_metadesc', true))) $missing_meta++;
    if (empty(get_post_meta($p->ID, '_yoast_wpseo_focuskw', true))) $missing_focus++;
    $thumb = get_post_thumbnail_id($p->ID);
    if ($thumb && empty(get_post_meta($thumb, '_wp_attachment_image_alt', true))) $missing_alt++;
    if (strlen(strip_tags($p->post_content)) < 100) $short_content++;
}

echo "PRODUCT SEO STATUS\n";
echo "==================\n";
echo "Total Products: $total\n";
echo "✅ Meta Descriptions: " . ($total - $missing_meta) . "/$total (" . round((($total - $missing_meta) / $total) * 100) . "%)\n";
echo "✅ Focus Keyphrases: " . ($total - $missing_focus) . "/$total (" . round((($total - $missing_focus) / $total) * 100) . "%)\n";
echo "✅ Image Alt Text: " . ($total - $missing_alt) . "/$total (" . round((($total - $missing_alt) / $total) * 100) . "%)\n";
echo "✅ Content Length (>100 chars): " . ($total - $short_content) . "/$total\n\n";

// URL Redirects
$redirects = get_option('wpseo-premium-redirects-base', array());
echo "URL REDIRECTS\n";
echo "=============\n";
echo "Total 301 Redirects Active: " . count($redirects) . "\n\n";

// Blog Status
$blogs = get_posts(array('post_type' => 'post', 'post_status' => 'publish', 'posts_per_page' => -1));
echo "BLOG STATUS\n";
echo "===========\n";
echo "Published Blogs: " . count($blogs) . "\n";
foreach ($blogs as $blog) {
    $has_meta = !empty(get_post_meta($blog->ID, '_yoast_wpseo_metadesc', true));
    $has_focus = !empty(get_post_meta($blog->ID, '_yoast_wpseo_focuskw', true));
    $status = ($has_meta && $has_focus) ? "✅" : "⚠️";
    echo "$status {$blog->post_title}\n";
}
echo "\n";

// Critical Pages
echo "CRITICAL PAGES\n";
echo "==============\n";
$pages = array(
    'Homepage' => get_option('page_on_front'),
    'Shop' => get_option('woocommerce_shop_page_id'),
    'Cart' => get_option('woocommerce_cart_page_id'),
    'Checkout' => get_option('woocommerce_checkout_page_id'),
    'My Account' => get_option('woocommerce_myaccount_page_id')
);
foreach ($pages as $name => $id) {
    $page = get_post($id);
    $status = ($page && $page->post_status == 'publish') ? "✅" : "❌";
    echo "$status $name (ID: $id)\n";
}
echo "\n";

// Calculate Overall Score
$scores = array(
    'meta_desc' => ($total - $missing_meta) / $total * 100,
    'focus_kw' => ($total - $missing_focus) / $total * 100,
    'alt_text' => ($total - $missing_alt) / $total * 100,
    'content' => ($total - $short_content) / $total * 100
);
$overall = array_sum($scores) / count($scores);

echo "================================================================\n";
echo "OVERALL SEO HEALTH SCORE: " . round($overall) . "/100\n";
echo "================================================================\n";

if ($overall >= 95) echo "GRADE: A+ - Excellent!\n";
elseif ($overall >= 90) echo "GRADE: A - Great!\n";
elseif ($overall >= 80) echo "GRADE: B - Good\n";
elseif ($overall >= 70) echo "GRADE: C - Needs Work\n";
else echo "GRADE: D - Significant Issues\n";

echo "\n";
