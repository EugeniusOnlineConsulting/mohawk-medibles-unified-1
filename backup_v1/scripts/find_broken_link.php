<?php
/**
 * Search for the broken concatenated URL in the database
 */

global $wpdb;

$search_patterns = array(
    '%20%20%20https',
    '   https://mohawkmedibles',
    'mohawk-medibles-deseronto-online-shop/%20',
    'thca-diamonds-sauce-canada/%20',
    'dispensary-near-me-canada-2026-guide/'
);

echo "Searching for broken URL patterns in database...\n\n";

// Search in posts content
echo "=== Searching Posts ===\n";
foreach ($search_patterns as $pattern) {
    $results = $wpdb->get_results($wpdb->prepare(
        "SELECT ID, post_title, post_type FROM {$wpdb->posts} WHERE post_content LIKE %s LIMIT 5",
        '%' . $wpdb->esc_like($pattern) . '%'
    ));

    if ($results) {
        echo "Found '$pattern' in:\n";
        foreach ($results as $r) {
            echo "  [{$r->ID}] {$r->post_title} ({$r->post_type})\n";
        }
    }
}

// Search in post meta (Elementor, Yoast, etc.)
echo "\n=== Searching Post Meta ===\n";
foreach ($search_patterns as $pattern) {
    $results = $wpdb->get_results($wpdb->prepare(
        "SELECT post_id, meta_key FROM {$wpdb->postmeta} WHERE meta_value LIKE %s LIMIT 5",
        '%' . $wpdb->esc_like($pattern) . '%'
    ));

    if ($results) {
        echo "Found '$pattern' in meta:\n";
        foreach ($results as $r) {
            $post = get_post($r->post_id);
            echo "  Post [{$r->post_id}] {$post->post_title} - meta_key: {$r->meta_key}\n";
        }
    }
}

// Search in options (widgets, menus, theme settings)
echo "\n=== Searching Options ===\n";
foreach ($search_patterns as $pattern) {
    $results = $wpdb->get_results($wpdb->prepare(
        "SELECT option_name FROM {$wpdb->options} WHERE option_value LIKE %s LIMIT 5",
        '%' . $wpdb->esc_like($pattern) . '%'
    ));

    if ($results) {
        echo "Found '$pattern' in options:\n";
        foreach ($results as $r) {
            echo "  Option: {$r->option_name}\n";
        }
    }
}

// Search in Revolution Slider
echo "\n=== Searching Revolution Slider ===\n";
$slider_results = $wpdb->get_results(
    "SELECT id, slide_order FROM {$wpdb->prefix}revslider_slides WHERE layers LIKE '%dispensary-near-me%' OR layers LIKE '%thca-diamonds%'"
);
if ($slider_results) {
    foreach ($slider_results as $r) {
        echo "  Slide ID: {$r->id}\n";
    }
}

echo "\nSearch complete.\n";
