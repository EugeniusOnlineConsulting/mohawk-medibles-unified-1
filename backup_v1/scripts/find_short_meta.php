<?php
/**
 * Find products with short meta descriptions (<120 chars)
 */

$products = get_posts(array(
    'post_type' => 'product',
    'post_status' => 'publish',
    'posts_per_page' => -1
));

$short_products = array();

foreach ($products as $product) {
    $meta_desc = get_post_meta($product->ID, '_yoast_wpseo_metadesc', true);
    $length = strlen($meta_desc);

    if ($length < 120) {
        // Get product category
        $terms = get_the_terms($product->ID, 'product_cat');
        $category = '';
        if ($terms && !is_wp_error($terms)) {
            $category = $terms[0]->name;
        }

        $short_products[] = array(
            'id' => $product->ID,
            'title' => html_entity_decode($product->post_title),
            'category' => $category,
            'current_meta' => $meta_desc,
            'length' => $length
        );
    }
}

echo "Found " . count($short_products) . " products with short meta descriptions\n\n";

// Output first 20 as sample
echo "Sample (first 20):\n";
echo "==================\n";
for ($i = 0; $i < min(20, count($short_products)); $i++) {
    $p = $short_products[$i];
    echo "[{$p['id']}] {$p['title']}\n";
    echo "    Category: {$p['category']}\n";
    echo "    Current ({$p['length']} chars): {$p['current_meta']}\n\n";
}

// Output all IDs and categories for processing
echo "\n\nALL PRODUCTS BY CATEGORY:\n";
echo "=========================\n";

$by_category = array();
foreach ($short_products as $p) {
    $cat = $p['category'] ?: 'Uncategorized';
    if (!isset($by_category[$cat])) {
        $by_category[$cat] = array();
    }
    $by_category[$cat][] = $p;
}

foreach ($by_category as $cat => $products) {
    echo "\n$cat (" . count($products) . " products):\n";
    foreach ($products as $p) {
        echo "  [{$p['id']}] {$p['title']}\n";
    }
}
