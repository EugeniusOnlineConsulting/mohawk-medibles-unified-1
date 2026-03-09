<?php
// Fix ONLY truncated URL slugs (ending in -cana, -can instead of -canada)
// These are broken links that need fixing

$args = array(
    'post_type' => 'product',
    'posts_per_page' => -1,
    'post_status' => 'publish'
);

$products = get_posts($args);

$truncated_found = array();
$fixed = 0;

echo "=== FINDING TRUNCATED URL SLUGS ===\n\n";

foreach ($products as $product) {
    $id = $product->ID;
    $slug = $product->post_name;
    $title = $product->post_title;

    // Check for truncated slugs ending in partial words
    // These happen when WordPress truncates long slugs
    if (preg_match('/-(cana|can|ca|canad|thc-vape-cana|cannabis-cana|gummies-cana|edibles-cana)$/', $slug)) {
        $truncated_found[] = array(
            'id' => $id,
            'title' => $title,
            'slug' => $slug
        );

        // Fix the slug
        $new_slug = preg_replace('/-(cana|canad)$/', '-canada', $slug);
        $new_slug = preg_replace('/-(can)$/', '-canada', $new_slug);
        $new_slug = preg_replace('/-(ca)$/', '-canada', $new_slug);
        $new_slug = preg_replace('/-thc-vape-cana$/', '-thc-vape-canada', $new_slug);
        $new_slug = preg_replace('/-cannabis-cana$/', '-cannabis-canada', $new_slug);
        $new_slug = preg_replace('/-gummies-cana$/', '-thc-gummies-canada', $new_slug);
        $new_slug = preg_replace('/-edibles-cana$/', '-cannabis-edibles-canada', $new_slug);

        if ($new_slug !== $slug) {
            $result = wp_update_post(array(
                'ID' => $id,
                'post_name' => $new_slug
            ));

            if ($result && !is_wp_error($result)) {
                echo "✅ Fixed ID $id:\n";
                echo "   Old: $slug\n";
                echo "   New: $new_slug\n\n";
                $fixed++;
            } else {
                echo "❌ Failed to fix ID $id: $slug\n";
            }
        }
    }
}

echo "\n=== SUMMARY ===\n";
echo "Truncated slugs found: " . count($truncated_found) . "\n";
echo "Fixed: $fixed\n";

if (count($truncated_found) == 0) {
    echo "\n✅ No truncated slugs found - all URLs are complete!\n";
}
