<?php
// Fix URL slugs to match the SEO format: buy-{slug}-{category}-canada
// This preserves Google's indexed URLs

$args = array(
    'post_type' => 'product',
    'posts_per_page' => -1,
    'post_status' => 'publish'
);

$products = get_posts($args);

$fixed_truncated = 0;
$fixed_prefix = 0;
$fixed_suffix = 0;
$already_correct = 0;
$errors = array();

// Category suffixes based on product category
function get_category_suffix($product_id) {
    $terms = wp_get_post_terms($product_id, 'product_cat', array('fields' => 'slugs'));

    // Priority order for suffix
    if (in_array('thc-vapes', $terms) || in_array('thc-disposable', $terms) || in_array('thc-cartridges', $terms)) {
        return 'thc-vape-canada';
    }
    if (in_array('thc-gummies', $terms) || in_array('edibles', $terms)) {
        return 'thc-gummies-canada';
    }
    if (in_array('hash', $terms)) {
        return 'canada'; // hash products just end with -canada
    }
    if (in_array('nicotine', $terms)) {
        return 'canada';
    }
    if (in_array('mushrooms', $terms) || in_array('psilocybin', $terms)) {
        return 'cannabis-canada';
    }

    // Default
    return 'cannabis-canada';
}

echo "=== FIXING URL SLUGS ===\n\n";

foreach ($products as $product) {
    $id = $product->ID;
    $slug = $product->post_name;
    $title = $product->post_title;
    $new_slug = $slug;
    $needs_update = false;

    // Check for truncated slugs (ending in -cana, -can, etc. instead of -canada)
    if (preg_match('/-(cana|can|ca)$/', $slug)) {
        // These are truncated - fix them
        $new_slug = preg_replace('/-(cana|can|ca)$/', '-canada', $new_slug);
        $needs_update = true;
        $fixed_truncated++;
    }

    // Check if missing buy- prefix (but already has proper format)
    $has_buy = (strpos($slug, 'buy-') === 0);
    $has_canada = (substr($new_slug, -7) === '-canada');

    if ($has_buy && $has_canada) {
        $already_correct++;
        continue;
    }

    // Only add prefix/suffix if the slug doesn't have them
    // AND the slug currently has no format (to avoid double-formatting)
    if (!$has_buy && strpos($slug, 'buy-') === false) {
        // Add buy- prefix for products that should have it
        // Skip if it looks like it was never meant to have the SEO format
        if (!$has_canada && strlen($slug) < 60) {
            // This is an older format product - add full SEO format
            $suffix = get_category_suffix($id);

            // Clean the slug first
            $base_slug = $slug;
            $base_slug = preg_replace('/-cannabis$|-thc$|-gummies$|-vape$/', '', $base_slug);

            $new_slug = 'buy-' . $base_slug . '-' . $suffix;
            $needs_update = true;
            $fixed_prefix++;
        }
    }

    if ($needs_update) {
        // Sanitize and update
        $new_slug = sanitize_title($new_slug);

        // Ensure slug is unique
        $check_slug = $new_slug;
        $counter = 2;
        while (get_page_by_path($check_slug, OBJECT, 'product') && get_page_by_path($check_slug, OBJECT, 'product')->ID != $id) {
            $check_slug = $new_slug . '-' . $counter;
            $counter++;
        }
        $new_slug = $check_slug;

        $result = wp_update_post(array(
            'ID' => $id,
            'post_name' => $new_slug
        ));

        if (is_wp_error($result)) {
            $errors[] = "Error updating $id: " . $result->get_error_message();
        } else {
            echo "Updated $id: $slug -> $new_slug\n";
        }
    }
}

echo "\n=== SUMMARY ===\n";
echo "Already correct: $already_correct\n";
echo "Fixed truncated slugs: $fixed_truncated\n";
echo "Fixed with prefix/suffix: $fixed_prefix\n";
echo "Errors: " . count($errors) . "\n";

if (count($errors) > 0) {
    echo "\nErrors:\n";
    foreach ($errors as $e) {
        echo "  $e\n";
    }
}
