<?php
// Generate SEO meta for vapes missing meta descriptions and focus keyphrases
// Based on product title and category

$vape_ids_missing_seo = array(
    22090, 22089, 22088, 22087, 22086, 22085, 22072, 22069, 22070, 22056,
    22057, 22053, 22055, 21990, 21992, 21993, 21994, 21984, 21989, 21988,
    21987, 21985, 21983, 21978, 21977, 21975, 19564, 19302, 19248, 19167,
    18981, 18940, 17736
);

$updated = 0;
$skipped = 0;

echo "=== GENERATING VAPE SEO META ===\n\n";

foreach ($vape_ids_missing_seo as $product_id) {
    $post = get_post($product_id);
    if (!$post) {
        echo "Product $product_id not found\n";
        continue;
    }

    $title = $post->post_title;
    // Clean title - remove "| Mohawk Medibles" if present
    $clean_title = preg_replace('/\s*\|\s*Mohawk Medibles.*$/', '', $title);

    // Get categories
    $terms = wp_get_post_terms($product_id, 'product_cat', array('fields' => 'names'));
    $is_nicotine = in_array('Nicotine', $terms) || in_array('Vapes', $terms) && stripos($title, 'nicotine') !== false;
    $is_cbd = stripos($title, 'CBD') !== false || stripos($title, 'SleeBD') !== false;

    // Determine product type from title
    $size = '';
    if (preg_match('/(\d+(\.\d+)?)\s*(g|G|ml|ML)/i', $clean_title, $matches)) {
        $size = $matches[1] . strtoupper($matches[3]);
    }

    // Extract brand name (usually first word or two)
    $brand = '';
    $brand_patterns = array(
        'DOZO', 'Dozo', 'DRIZZLE FACTORY', 'Drizzle Factory', 'ZILLIONAIRE', 'Zillionaire',
        'STRAIGHT GOODS', 'Straight Goods', 'GAS GANG', 'Gas Gang', 'BURN', 'Burn',
        'ASEND', 'Asend', 'RITUAL', 'Ritual', 'Diamond', 'DIAMOND', 'Hemp Geek',
        'Heisenberg', 'Torch X Pressure', 'SleeBD', 'PEM', 'Pineapple Express'
    );
    foreach ($brand_patterns as $pattern) {
        if (stripos($clean_title, $pattern) !== false) {
            $brand = $pattern;
            break;
        }
    }

    // Check existing SEO
    $existing_meta = get_post_meta($product_id, '_yoast_wpseo_metadesc', true);
    $existing_focus = get_post_meta($product_id, '_yoast_wpseo_focuskw', true);

    if (!empty($existing_meta) && !empty($existing_focus)) {
        echo "Skipped $product_id - already has SEO\n";
        $skipped++;
        continue;
    }

    // Generate meta description (155-160 chars)
    if ($is_nicotine) {
        $meta_desc = "Shop $clean_title at Mohawk Medibles. Premium nicotine vape with fast Canadian delivery. Indigenous-owned dispensary with quality products.";
    } elseif ($is_cbd) {
        $meta_desc = "Buy $clean_title at Mohawk Medibles. Premium CBD vape for relaxation and wellness. Fast shipping across Canada from Indigenous-owned dispensary.";
    } else {
        // THC vape
        $meta_desc = "Buy $clean_title at Mohawk Medibles. Premium THC vape with potent effects. Fast Canadian delivery from Indigenous-owned cannabis dispensary.";
    }

    // Ensure meta is within limits
    if (strlen($meta_desc) > 160) {
        $meta_desc = substr($meta_desc, 0, 157) . '...';
    }

    // Generate focus keyphrase
    // Format: {product name without brand} canada OR {brand} {product type} canada
    $focus_kw = strtolower($clean_title) . ' canada';
    // Clean up focus keyphrase
    $focus_kw = preg_replace('/\s+/', ' ', $focus_kw);
    $focus_kw = trim($focus_kw);

    // Update if missing
    $updated_meta = false;
    $updated_focus = false;

    if (empty($existing_meta)) {
        update_post_meta($product_id, '_yoast_wpseo_metadesc', $meta_desc);
        $updated_meta = true;
    }

    if (empty($existing_focus)) {
        update_post_meta($product_id, '_yoast_wpseo_focuskw', $focus_kw);
        $updated_focus = true;
    }

    if ($updated_meta || $updated_focus) {
        echo "✅ Updated $product_id - $clean_title\n";
        if ($updated_meta) {
            echo "   Meta: $meta_desc\n";
        }
        if ($updated_focus) {
            echo "   Focus: $focus_kw\n";
        }
        echo "\n";
        $updated++;
    }
}

echo "\n=== SUMMARY ===\n";
echo "Updated: $updated\n";
echo "Skipped (already has SEO): $skipped\n";
echo "Total processed: " . count($vape_ids_missing_seo) . "\n";
