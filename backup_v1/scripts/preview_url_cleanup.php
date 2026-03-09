<?php
/**
 * PREVIEW ONLY - Shows what URLs would change
 */

$args = array(
    'post_type' => 'product',
    'post_status' => 'publish',
    'posts_per_page' => 30,
    'fields' => 'ids'
);

$products = get_posts($args);

echo "URL CLEANUP PREVIEW (First 30 products)\n";
echo "========================================\n\n";

$changes = 0;
foreach ($products as $product_id) {
    $post = get_post($product_id);
    $old_slug = $post->post_name;
    $title = html_entity_decode($post->post_title);

    $new_slug = generate_clean_slug($title, $old_slug);

    if ($old_slug !== $new_slug) {
        $changes++;
        echo "OLD: $old_slug\n";
        echo "NEW: $new_slug\n";
        echo "---\n";
    }
}

function generate_clean_slug($title, $old_slug) {
    $slug = sanitize_title($title);
    $slug = preg_replace('/^buy-/', '', $slug);
    $slug = preg_replace('/-mohawk-medibles$/', '', $slug);

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

    $slug = preg_replace('/-th-/', '-thc-', $slug);
    $slug = preg_replace('/-bo-/', '-', $slug);
    $slug = preg_replace('/-w-/', '-', $slug);
    $slug = preg_replace('/-m-/', 'mg-', $slug);
    $slug = preg_replace('/-sa-/', '-sauce-', $slug);
    $slug = preg_replace('/-amp-/', '-', $slug);

    $promo_words = array('-special-boxing-week-sale', '-special-boxing', '-boxing-week', '-special-sale', '-deal', '-special');
    foreach ($promo_words as $word) {
        $slug = str_replace($word, '', $slug);
    }

    if (!preg_match('/-canada$/', $slug)) {
        $slug .= '-canada';
    }

    $slug = preg_replace('/-+/', '-', $slug);
    $slug = trim($slug, '-');

    return $slug;
}

echo "\nTotal changes needed: $changes / 30 sampled\n";
