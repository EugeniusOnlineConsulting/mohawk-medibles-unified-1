<?php
/**
 * Fix missing image alt text for products
 * Generates alt text from product title
 */

$products = get_posts(array(
    'post_type' => 'product',
    'post_status' => 'publish',
    'posts_per_page' => -1
));

$fixed = 0;

foreach ($products as $product) {
    $thumbnail_id = get_post_thumbnail_id($product->ID);

    if ($thumbnail_id) {
        $current_alt = get_post_meta($thumbnail_id, '_wp_attachment_image_alt', true);

        if (empty($current_alt)) {
            // Generate alt text from product title
            $alt_text = html_entity_decode($product->post_title) . ' - Mohawk Medibles Canada';
            update_post_meta($thumbnail_id, '_wp_attachment_image_alt', $alt_text);
            $fixed++;
        }
    }
}

echo "Fixed missing alt text for $fixed product images\n";
