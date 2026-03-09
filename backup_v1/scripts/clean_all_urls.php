<?php
/**
 * Bulk URL Cleanup Script for Mohawk Medibles
 * Cleans product slugs to be shorter and SEO-friendly
 *
 * Pattern: product-name-canada (removes buy-, redundant suffixes, truncations)
 */

// Get all published products
$args = array(
    'post_type' => 'product',
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'fields' => 'ids'
);

$products = get_posts($args);
$updated = 0;
$skipped = 0;
$errors = array();

echo "===========================================\n";
echo "BULK URL CLEANUP - " . count($products) . " Products\n";
echo "===========================================\n\n";

foreach ($products as $product_id) {
    $post = get_post($product_id);
    $old_slug = $post->post_name;
    $title = $post->post_title;

    // Generate clean slug from title
    $new_slug = generate_clean_slug($title, $old_slug);

    // Skip if already clean or no change needed
    if ($old_slug === $new_slug) {
        $skipped++;
        continue;
    }

    // Check if new slug already exists
    $existing = get_page_by_path($new_slug, OBJECT, 'product');
    if ($existing && $existing->ID !== $product_id) {
        // Add product ID to make unique
        $new_slug = $new_slug . '-' . $product_id;
    }

    // Update the post slug
    $result = wp_update_post(array(
        'ID' => $product_id,
        'post_name' => $new_slug
    ));

    if (is_wp_error($result)) {
        $errors[] = "ID $product_id: " . $result->get_error_message();
    } else {
        $updated++;
        echo "[$product_id] $old_slug\n";
        echo "    -> $new_slug\n\n";
    }
}

function generate_clean_slug($title, $old_slug) {
    // Start with sanitized title
    $slug = sanitize_title($title);

    // Remove common prefixes
    $slug = preg_replace('/^buy-/', '', $slug);

    // Remove brand repetition at end (like "mohawk-medibles" suffix)
    $slug = preg_replace('/-mohawk-medibles$/', '', $slug);

    // Remove redundant category words at end
    $remove_suffixes = array(
        '-cannabis-canada$',
        '-cannabis-edibles-canada$',
        '-thc-gummies-canada$',
        '-thc-vape-canada$',
        '-thc-vapes-canada$',
        '-edibles-canada$',
        '-concentrates-canada$',
        '-hash-canada$',
        '-flower-canada$',
        '-pre-rolls-canada$',
        '-cbd-canada$',
    );

    foreach ($remove_suffixes as $suffix) {
        $slug = preg_replace('/' . $suffix . '/', '-canada', $slug);
    }

    // Clean up truncated words (like "th-" should be "thc-" or removed)
    $slug = preg_replace('/-th-/', '-thc-', $slug);
    $slug = preg_replace('/-bo-/', '-', $slug); // boxing truncated
    $slug = preg_replace('/-w-/', '-', $slug);  // week truncated
    $slug = preg_replace('/-m-/', 'mg-', $slug); // mg truncated
    $slug = preg_replace('/-sa-/', '-sauce-', $slug); // sauce truncated
    $slug = preg_replace('/-amp-/', '-', $slug); // &amp; artifact

    // Remove promotional words
    $promo_words = array(
        '-special-boxing-week-sale',
        '-special-boxing',
        '-boxing-week',
        '-special-sale',
        '-deal',
        '-special',
    );
    foreach ($promo_words as $word) {
        $slug = str_replace($word, '', $slug);
    }

    // Ensure ends with -canada if not already
    if (!preg_match('/-canada$/', $slug)) {
        $slug .= '-canada';
    }

    // Clean up double dashes
    $slug = preg_replace('/-+/', '-', $slug);

    // Remove trailing/leading dashes
    $slug = trim($slug, '-');

    return $slug;
}

echo "===========================================\n";
echo "SUMMARY\n";
echo "===========================================\n";
echo "Updated: $updated\n";
echo "Skipped (already clean): $skipped\n";
echo "Errors: " . count($errors) . "\n";

if (count($errors) > 0) {
    echo "\nErrors:\n";
    foreach ($errors as $error) {
        echo "  - $error\n";
    }
}

echo "\nDone! Remember to flush cache and set up 301 redirects for old URLs.\n";
