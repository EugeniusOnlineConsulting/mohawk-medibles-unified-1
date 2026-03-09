<?php
// Comprehensive category audit for vapes, nicotine, and related products

echo "=== VAPE & NICOTINE CATEGORY AUDIT ===\n\n";

// Get all products with 'vape', 'disposable', 'cartridge', 'nicotine', 'pouch', 'pod' in title
$args = array(
    'post_type' => 'product',
    'posts_per_page' => -1,
    'post_status' => 'publish',
    's' => ''
);

$products = get_posts($args);

// Category IDs
$thc_vapes_parent = 1262;      // Vapes (THC)
$thc_disposables = 1264;       // Vapes > Disposables
$thc_cartridges = 1265;        // Vapes > Cartridges
$nicotine_parent = 1255;       // Nicotine
$nicotine_vapes = 1256;        // Nicotine > Vapes
$nicotine_pouches = 1258;      // Nicotine > Pouches
$nicotine_pods = 1257;         // Nicotine > Pods

$issues = array();
$thc_vape_products = array();
$nicotine_vape_products = array();
$nicotine_pouch_products = array();
$nicotine_pod_products = array();
$miscategorized = array();

foreach ($products as $product) {
    $title = strtolower($product->post_title);
    $id = $product->ID;

    // Get product categories
    $terms = wp_get_post_terms($id, 'product_cat', array('fields' => 'all'));
    $cat_ids = array();
    $cat_names = array();
    foreach ($terms as $term) {
        $cat_ids[] = $term->term_id;
        $cat_names[] = $term->name;
    }

    // Classify product type based on title
    $is_nicotine = (strpos($title, 'nicotine') !== false || strpos($title, 'nic ') !== false);
    $is_vape = (strpos($title, 'vape') !== false || strpos($title, 'disposable') !== false);
    $is_cartridge = (strpos($title, 'cartridge') !== false);
    $is_pouch = (strpos($title, 'pouch') !== false);
    $is_pod = (strpos($title, 'pod') !== false && strpos($title, 'pouch') === false);
    $is_thc = (strpos($title, 'thc') !== false || strpos($title, 'thca') !== false ||
               strpos($title, 'live resin') !== false || strpos($title, 'rosin') !== false ||
               strpos($title, 'delta') !== false);

    // Skip if not vape/nicotine related
    if (!$is_vape && !$is_cartridge && !$is_pouch && !$is_pod && !$is_nicotine) {
        continue;
    }

    $product_info = array(
        'id' => $id,
        'title' => $product->post_title,
        'categories' => implode(', ', $cat_names),
        'cat_ids' => $cat_ids
    );

    // Check categorization
    if ($is_nicotine && $is_pouch) {
        // Should be in Nicotine > Pouches (1258)
        $nicotine_pouch_products[] = $product_info;
        if (!in_array($nicotine_pouches, $cat_ids) && !in_array($nicotine_parent, $cat_ids)) {
            $miscategorized[] = array_merge($product_info, array(
                'issue' => 'Nicotine pouch not in Nicotine category',
                'should_be' => 'Nicotine > Pouches'
            ));
        }
    } elseif ($is_nicotine && $is_pod) {
        // Should be in Nicotine > Pods (1257)
        $nicotine_pod_products[] = $product_info;
        if (!in_array($nicotine_pods, $cat_ids) && !in_array($nicotine_parent, $cat_ids)) {
            $miscategorized[] = array_merge($product_info, array(
                'issue' => 'Nicotine pod not in Nicotine category',
                'should_be' => 'Nicotine > Pods'
            ));
        }
    } elseif ($is_nicotine && $is_vape) {
        // Should be in Nicotine > Vapes (1256)
        $nicotine_vape_products[] = $product_info;
        if (!in_array($nicotine_vapes, $cat_ids) && !in_array($nicotine_parent, $cat_ids)) {
            $miscategorized[] = array_merge($product_info, array(
                'issue' => 'Nicotine vape not in Nicotine category',
                'should_be' => 'Nicotine > Vapes'
            ));
        }
        // Also check if incorrectly in THC vapes
        if (in_array($thc_vapes_parent, $cat_ids) || in_array($thc_disposables, $cat_ids)) {
            $miscategorized[] = array_merge($product_info, array(
                'issue' => 'Nicotine vape incorrectly in THC Vapes category!',
                'should_be' => 'Nicotine > Vapes (NOT THC Vapes)'
            ));
        }
    } elseif (($is_thc || !$is_nicotine) && ($is_vape || $is_cartridge)) {
        // THC vape/cartridge - should be in Vapes (1262) or subcategories
        $thc_vape_products[] = $product_info;
        if (!in_array($thc_vapes_parent, $cat_ids) && !in_array($thc_disposables, $cat_ids) &&
            !in_array($thc_cartridges, $cat_ids)) {
            // Check if it's incorrectly in nicotine
            if (in_array($nicotine_vapes, $cat_ids) || in_array($nicotine_parent, $cat_ids)) {
                $miscategorized[] = array_merge($product_info, array(
                    'issue' => 'THC vape incorrectly in Nicotine category!',
                    'should_be' => 'Vapes > Disposables or Vapes > Cartridges'
                ));
            }
        }
    }
}

// Output results
echo "=== THC VAPE PRODUCTS (" . count($thc_vape_products) . ") ===\n";
foreach ($thc_vape_products as $p) {
    echo "ID: {$p['id']} | {$p['title']}\n";
    echo "   Categories: {$p['categories']}\n";
}

echo "\n=== NICOTINE VAPE PRODUCTS (" . count($nicotine_vape_products) . ") ===\n";
foreach ($nicotine_vape_products as $p) {
    echo "ID: {$p['id']} | {$p['title']}\n";
    echo "   Categories: {$p['categories']}\n";
}

echo "\n=== NICOTINE POUCH PRODUCTS (" . count($nicotine_pouch_products) . ") ===\n";
foreach ($nicotine_pouch_products as $p) {
    echo "ID: {$p['id']} | {$p['title']}\n";
    echo "   Categories: {$p['categories']}\n";
}

echo "\n=== NICOTINE POD PRODUCTS (" . count($nicotine_pod_products) . ") ===\n";
foreach ($nicotine_pod_products as $p) {
    echo "ID: {$p['id']} | {$p['title']}\n";
    echo "   Categories: {$p['categories']}\n";
}

echo "\n\n========================================\n";
echo "=== MISCATEGORIZED PRODUCTS (" . count($miscategorized) . ") ===\n";
echo "========================================\n";
if (count($miscategorized) > 0) {
    foreach ($miscategorized as $m) {
        echo "\n❌ ID: {$m['id']} | {$m['title']}\n";
        echo "   Current: {$m['categories']}\n";
        echo "   Issue: {$m['issue']}\n";
        echo "   Should be: {$m['should_be']}\n";
    }
} else {
    echo "✅ No miscategorized products found!\n";
}
