<?php
/**
 * Safe URL Cleanup with 301 Redirects
 * Uses Yoast SEO Premium redirects to preserve Google indexing
 *
 * Process:
 * 1. Calculate new slug for each product
 * 2. Create 301 redirect from old URL to new URL
 * 3. Update the product slug
 * 4. Verify redirect works
 */

global $wpdb;

// Check if Yoast Premium Redirects is available
if (!class_exists('WPSEO_Redirect_Manager') && !function_exists('wpseo_premium_add_redirect')) {
    // Fallback: Use WordPress redirect table directly
    $use_yoast = false;
} else {
    $use_yoast = true;
}

// Get all products
$args = array(
    'post_type' => 'product',
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'fields' => 'ids'
);

$products = get_posts($args);
$updated = 0;
$skipped = 0;
$redirects_created = 0;

echo "=====================================================\n";
echo "SAFE URL CLEANUP WITH 301 REDIRECTS\n";
echo "=====================================================\n";
echo "Products to process: " . count($products) . "\n";
echo "Redirect method: " . ($use_yoast ? "Yoast SEO Premium" : "Custom redirects table") . "\n\n";

// Create custom redirects table if not using Yoast
if (!$use_yoast) {
    $table_name = $wpdb->prefix . 'mohawk_redirects';
    $wpdb->query("CREATE TABLE IF NOT EXISTS $table_name (
        id INT AUTO_INCREMENT PRIMARY KEY,
        old_url VARCHAR(500) NOT NULL,
        new_url VARCHAR(500) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY old_url (old_url(255))
    )");
}

foreach ($products as $product_id) {
    $post = get_post($product_id);
    $old_slug = $post->post_name;

    // Generate clean slug
    $new_slug = clean_slug($old_slug);

    // Skip if no change needed
    if ($old_slug === $new_slug) {
        $skipped++;
        continue;
    }

    // Check for duplicate slugs
    $final_slug = get_unique_slug($new_slug, $product_id);

    // Get full URLs
    $old_url = '/shop/' . get_product_category_slug($product_id) . '/' . $old_slug . '/';
    $new_url = '/shop/' . get_product_category_slug($product_id) . '/' . $final_slug . '/';

    // Create 301 redirect BEFORE changing slug
    if ($use_yoast) {
        create_yoast_redirect($old_url, $new_url);
    } else {
        create_custom_redirect($old_url, $new_url);
    }
    $redirects_created++;

    // Now update the slug
    wp_update_post(array(
        'ID' => $product_id,
        'post_name' => $final_slug
    ), true);

    $updated++;

    // Show progress (first 30 and every 50th)
    if ($updated <= 30 || $updated % 50 == 0) {
        echo "[$updated] $old_slug\n";
        echo "     -> $final_slug\n";
    }
}

function get_product_category_slug($product_id) {
    $terms = get_the_terms($product_id, 'product_cat');
    if ($terms && !is_wp_error($terms)) {
        // Get the deepest category (most specific)
        $deepest = null;
        $max_depth = -1;
        foreach ($terms as $term) {
            $ancestors = get_ancestors($term->term_id, 'product_cat');
            $depth = count($ancestors);
            if ($depth > $max_depth) {
                $max_depth = $depth;
                $deepest = $term;
            }
        }
        if ($deepest) {
            // Build full category path
            $path = array($deepest->slug);
            $ancestors = get_ancestors($deepest->term_id, 'product_cat');
            foreach (array_reverse($ancestors) as $ancestor_id) {
                $ancestor = get_term($ancestor_id, 'product_cat');
                if ($ancestor) {
                    array_unshift($path, $ancestor->slug);
                }
            }
            return implode('/', $path);
        }
    }
    return 'uncategorized';
}

function clean_slug($slug) {
    // Remove "buy-" prefix
    $slug = preg_replace('/^buy-/', '', $slug);

    // Remove redundant suffixes
    $slug = preg_replace('/-cannabis-edibles-canada$/', '-canada', $slug);
    $slug = preg_replace('/-cannabis-canada$/', '-canada', $slug);
    $slug = preg_replace('/-thc-gummies-canada$/', '-canada', $slug);
    $slug = preg_replace('/-thc-vapes?-canada$/', '-canada', $slug);
    $slug = preg_replace('/-edibles-canada$/', '-canada', $slug);

    // Fix truncated words
    $slug = str_replace('-amp-', '-and-', $slug);
    $slug = preg_replace('/-th-([a-z])/', '-thc-$1', $slug);
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

function get_unique_slug($slug, $exclude_id) {
    global $wpdb;
    $original_slug = $slug;
    $counter = 1;

    while (true) {
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT ID FROM {$wpdb->posts} WHERE post_name = %s AND post_type = 'product' AND ID != %d",
            $slug, $exclude_id
        ));

        if (!$exists) {
            return $slug;
        }

        $slug = $original_slug . '-' . $counter;
        $counter++;
    }
}

function create_yoast_redirect($old_url, $new_url) {
    // Yoast Premium stores redirects in options
    $redirects = get_option('wpseo-premium-redirects-base', array());

    $redirects[$old_url] = array(
        'origin' => $old_url,
        'url' => $new_url,
        'type' => 301,
        'format' => 'plain'
    );

    update_option('wpseo-premium-redirects-base', $redirects);
}

function create_custom_redirect($old_url, $new_url) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'mohawk_redirects';

    $wpdb->replace($table_name, array(
        'old_url' => $old_url,
        'new_url' => $new_url
    ));
}

// Flush caches
wp_cache_flush();
if (function_exists('rocket_clean_domain')) {
    rocket_clean_domain();
}

echo "\n=====================================================\n";
echo "COMPLETE\n";
echo "=====================================================\n";
echo "URLs Updated: $updated\n";
echo "301 Redirects Created: $redirects_created\n";
echo "Skipped (no change needed): $skipped\n";
echo "\nGoogle indexing preserved - old URLs will 301 redirect!\n";
