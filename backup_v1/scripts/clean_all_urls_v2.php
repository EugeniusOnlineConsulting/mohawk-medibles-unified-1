<?php
/**
 * Bulk URL Cleanup Script v2 for Mohawk Medibles
 * Cleans product slugs to be shorter and SEO-friendly
 */

$args = array(
    'post_type' => 'product',
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'fields' => 'ids'
);

$products = get_posts($args);
$updated = 0;
$skipped = 0;

echo "===========================================\n";
echo "BULK URL CLEANUP - " . count($products) . " Products\n";
echo "===========================================\n\n";

foreach ($products as $product_id) {
    $post = get_post($product_id);
    $old_slug = $post->post_name;

    $new_slug = clean_slug($old_slug);

    if ($old_slug === $new_slug) {
        $skipped++;
        continue;
    }

    // Check for duplicates
    $check_slug = $new_slug;
    $counter = 1;
    while (slug_exists($check_slug, $product_id)) {
        $check_slug = $new_slug . '-' . $counter;
        $counter++;
    }
    $new_slug = $check_slug;

    wp_update_post(array(
        'ID' => $product_id,
        'post_name' => $new_slug
    ));

    $updated++;
    if ($updated <= 50) { // Show first 50 changes
        echo "$old_slug\n-> $new_slug\n\n";
    }
}

function slug_exists($slug, $exclude_id) {
    global $wpdb;
    $exists = $wpdb->get_var($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_name = %s AND post_type = 'product' AND ID != %d",
        $slug, $exclude_id
    ));
    return !empty($exists);
}

function clean_slug($slug) {
    // Remove "buy-" prefix
    $slug = preg_replace('/^buy-/', '', $slug);

    // Remove redundant suffixes (keep -canada at end)
    $slug = preg_replace('/-cannabis-edibles-canada$/', '-canada', $slug);
    $slug = preg_replace('/-cannabis-canada$/', '-canada', $slug);
    $slug = preg_replace('/-thc-gummies-canada$/', '-canada', $slug);
    $slug = preg_replace('/-thc-vapes?-canada$/', '-canada', $slug);
    $slug = preg_replace('/-edibles-canada$/', '-canada', $slug);

    // Fix truncated words
    $slug = str_replace('-amp-', '-and-', $slug);
    $slug = preg_replace('/-th-([a-z])/', '-thc-$1', $slug); // th- to thc-
    $slug = preg_replace('/-m-/', 'mg-', $slug);
    $slug = preg_replace('/-sa-/', '-sauce-', $slug);

    // Remove promotional words
    $slug = preg_replace('/-special-boxing-week-s/', '', $slug);
    $slug = preg_replace('/-special-boxing/', '', $slug);
    $slug = preg_replace('/-special-bo/', '', $slug);
    $slug = preg_replace('/-boxing-week/', '', $slug);
    $slug = preg_replace('/-boxing-w/', '', $slug);
    $slug = preg_replace('/-deal/', '', $slug);
    $slug = preg_replace('/-special/', '', $slug);

    // Ensure -canada ending
    if (!preg_match('/-canada$/', $slug)) {
        $slug .= '-canada';
    }

    // Clean double dashes
    $slug = preg_replace('/-+/', '-', $slug);
    $slug = trim($slug, '-');

    return $slug;
}

echo "===========================================\n";
echo "COMPLETE\n";
echo "===========================================\n";
echo "Updated: $updated\n";
echo "Skipped: $skipped\n";
echo "\nCache flushed. Old URLs should 404 - set up redirects!\n";

// Flush cache
wp_cache_flush();
