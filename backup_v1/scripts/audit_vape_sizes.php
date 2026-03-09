<?php
// Audit vape sizes (1g-9g) to ensure they're properly categorized and have SEO
$args = array(
    'post_type' => 'product',
    'posts_per_page' => -1,
    'post_status' => 'publish',
    'tax_query' => array(
        array(
            'taxonomy' => 'product_cat',
            'field' => 'term_id',
            'terms' => array(1262, 1264, 1265, 1256), // THC Vapes, Disposables, Cartridges, Nicotine Vapes
            'operator' => 'IN'
        )
    )
);

$products = get_posts($args);

echo "=== VAPE SIZE AUDIT ===\n\n";

// Organize by size
$by_size = array(
    '1g' => array(),
    '2g' => array(),
    '3g' => array(),
    '4g' => array(),
    '5g' => array(),
    '6g' => array(),
    '9g' => array(),
    'other' => array()
);

$missing_seo = array();

foreach ($products as $product) {
    $id = $product->ID;
    $title = strtolower($product->post_title);
    $original_title = $product->post_title;

    // Get SEO data
    $meta_desc = get_post_meta($id, '_yoast_wpseo_metadesc', true);
    $focus_kw = get_post_meta($id, '_yoast_wpseo_focuskw', true);
    $permalink = get_permalink($id);

    // Check SEO completeness
    $has_seo = !empty($meta_desc) && !empty($focus_kw);

    // Detect size from title
    $size = 'other';
    if (preg_match('/(\d+(\.\d+)?)\s*(g|gram|ml)/i', $title, $matches)) {
        $num = floatval($matches[1]);
        if ($num <= 1.5) $size = '1g';
        elseif ($num <= 2.5) $size = '2g';
        elseif ($num <= 3.5) $size = '3g';
        elseif ($num <= 4.5) $size = '4g';
        elseif ($num <= 5.5) $size = '5g';
        elseif ($num <= 7) $size = '6g';
        elseif ($num >= 8) $size = '9g';
    }

    // Get categories
    $terms = wp_get_post_terms($id, 'product_cat', array('fields' => 'names'));
    $cats = implode(', ', $terms);

    $product_info = array(
        'id' => $id,
        'title' => $original_title,
        'categories' => $cats,
        'has_seo' => $has_seo,
        'url' => $permalink
    );

    $by_size[$size][] = $product_info;

    if (!$has_seo) {
        $missing_seo[] = $product_info;
    }
}

// Output by size
foreach ($by_size as $size => $products) {
    if (count($products) == 0) continue;

    echo "=== " . strtoupper($size) . " VAPES (" . count($products) . ") ===\n";
    foreach ($products as $p) {
        $seo_status = $p['has_seo'] ? '✅' : '⚠️ No SEO';
        echo "ID: {$p['id']} | {$p['title']}\n";
        echo "   Categories: {$p['categories']}\n";
        echo "   SEO: $seo_status\n";
    }
    echo "\n";
}

echo "\n=== VAPES MISSING SEO (" . count($missing_seo) . ") ===\n";
foreach ($missing_seo as $p) {
    echo "❌ ID: {$p['id']} | {$p['title']}\n";
    echo "   Categories: {$p['categories']}\n";
}

echo "\n=== SIZE DISTRIBUTION ===\n";
foreach ($by_size as $size => $products) {
    $count = count($products);
    if ($count > 0) {
        echo "$size: $count products\n";
    }
}
