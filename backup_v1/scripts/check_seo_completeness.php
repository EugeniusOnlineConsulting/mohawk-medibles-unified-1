<?php
// Check SEO completeness for all published products
$args = array(
    'post_type' => 'product',
    'posts_per_page' => -1,
    'post_status' => 'publish'
);

$products = get_posts($args);
$total = count($products);

$missing_meta = array();
$missing_focus_kw = array();
$missing_content = array();
$empty_content = array();
$short_content = array();

echo "=== SEO COMPLETENESS AUDIT ===\n";
echo "Total published products: $total\n\n";

foreach ($products as $product) {
    $id = $product->ID;
    $title = $product->post_title;
    $content = $product->post_content;

    // Check Yoast meta description
    $meta_desc = get_post_meta($id, '_yoast_wpseo_metadesc', true);
    if (empty($meta_desc)) {
        $missing_meta[] = array('id' => $id, 'title' => $title);
    }

    // Check Yoast focus keyphrase
    $focus_kw = get_post_meta($id, '_yoast_wpseo_focuskw', true);
    if (empty($focus_kw)) {
        $missing_focus_kw[] = array('id' => $id, 'title' => $title);
    }

    // Check content
    $clean_content = strip_tags($content);
    $clean_content = trim($clean_content);

    if (empty($clean_content)) {
        $empty_content[] = array('id' => $id, 'title' => $title);
    } elseif (strlen($clean_content) < 100) {
        $short_content[] = array('id' => $id, 'title' => $title, 'length' => strlen($clean_content));
    }
}

echo "=== MISSING META DESCRIPTIONS (" . count($missing_meta) . ") ===\n";
$count = 0;
foreach ($missing_meta as $p) {
    if ($count < 20) {
        echo "ID: {$p['id']} | {$p['title']}\n";
    }
    $count++;
}
if (count($missing_meta) > 20) {
    echo "... and " . (count($missing_meta) - 20) . " more\n";
}

echo "\n=== MISSING FOCUS KEYPHRASE (" . count($missing_focus_kw) . ") ===\n";
$count = 0;
foreach ($missing_focus_kw as $p) {
    if ($count < 20) {
        echo "ID: {$p['id']} | {$p['title']}\n";
    }
    $count++;
}
if (count($missing_focus_kw) > 20) {
    echo "... and " . (count($missing_focus_kw) - 20) . " more\n";
}

echo "\n=== EMPTY CONTENT (" . count($empty_content) . ") ===\n";
foreach ($empty_content as $p) {
    echo "❌ ID: {$p['id']} | {$p['title']}\n";
}

echo "\n=== SHORT CONTENT < 100 chars (" . count($short_content) . ") ===\n";
$count = 0;
foreach ($short_content as $p) {
    if ($count < 20) {
        echo "⚠️ ID: {$p['id']} ({$p['length']} chars) | {$p['title']}\n";
    }
    $count++;
}
if (count($short_content) > 20) {
    echo "... and " . (count($short_content) - 20) . " more\n";
}

echo "\n=== SUMMARY ===\n";
echo "Total products: $total\n";
echo "Missing meta description: " . count($missing_meta) . " (" . round(count($missing_meta) / $total * 100, 1) . "%)\n";
echo "Missing focus keyphrase: " . count($missing_focus_kw) . " (" . round(count($missing_focus_kw) / $total * 100, 1) . "%)\n";
echo "Empty content: " . count($empty_content) . "\n";
echo "Short content (<100 chars): " . count($short_content) . "\n";
