<?php
// Get all products missing meta descriptions
$args = array(
    'post_type' => 'product',
    'posts_per_page' => -1,
    'post_status' => 'publish'
);

$products = get_posts($args);
$missing = array();

foreach ($products as $product) {
    $id = $product->ID;
    $meta_desc = get_post_meta($id, '_yoast_wpseo_metadesc', true);

    if (empty($meta_desc)) {
        $terms = wp_get_post_terms($id, 'product_cat', array('fields' => 'names'));
        $missing[] = array(
            'id' => $id,
            'title' => $product->post_title,
            'categories' => implode(', ', $terms)
        );
    }
}

echo "=== PRODUCTS MISSING META DESCRIPTIONS (" . count($missing) . ") ===\n\n";

foreach ($missing as $p) {
    echo "ID: {$p['id']}\n";
    echo "Title: {$p['title']}\n";
    echo "Categories: {$p['categories']}\n";
    echo "---\n";
}
