<?php
// Check for products with URL slugs that don't match the SEO format
// Expected format: buy-{product-slug}-{category}-canada

$args = array(
    'post_type' => 'product',
    'posts_per_page' => -1,
    'post_status' => 'publish'
);

$products = get_posts($args);

$missing_buy_prefix = array();
$missing_canada_suffix = array();
$correct_format = 0;

foreach ($products as $product) {
    $slug = $product->post_name;
    $id = $product->ID;
    $title = $product->post_title;

    $has_buy = (strpos($slug, 'buy-') === 0);
    $has_canada = (substr($slug, -7) === '-canada');

    if ($has_buy && $has_canada) {
        $correct_format++;
    } else {
        if (!$has_buy) {
            $missing_buy_prefix[] = array(
                'id' => $id,
                'title' => $title,
                'slug' => $slug
            );
        }
        if (!$has_canada) {
            $missing_canada_suffix[] = array(
                'id' => $id,
                'title' => $title,
                'slug' => $slug
            );
        }
    }
}

echo "=== URL FORMAT AUDIT ===\n\n";
echo "Correct format (buy-*-canada): $correct_format\n";
echo "Missing 'buy-' prefix: " . count($missing_buy_prefix) . "\n";
echo "Missing '-canada' suffix: " . count($missing_canada_suffix) . "\n";

echo "\n=== PRODUCTS MISSING 'buy-' PREFIX ===\n";
$count = 0;
foreach ($missing_buy_prefix as $p) {
    if ($count < 30) {
        echo "ID: {$p['id']} | {$p['title']}\n";
        echo "   Current slug: {$p['slug']}\n";
        echo "   Suggested: buy-{$p['slug']}\n";
    }
    $count++;
}
if (count($missing_buy_prefix) > 30) {
    echo "... and " . (count($missing_buy_prefix) - 30) . " more\n";
}

echo "\n=== PRODUCTS MISSING '-canada' SUFFIX ===\n";
$count = 0;
foreach ($missing_canada_suffix as $p) {
    if ($count < 30) {
        echo "ID: {$p['id']} | {$p['title']}\n";
        echo "   Current slug: {$p['slug']}\n";
    }
    $count++;
}
if (count($missing_canada_suffix) > 30) {
    echo "... and " . (count($missing_canada_suffix) - 30) . " more\n";
}
