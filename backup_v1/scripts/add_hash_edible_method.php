<?php
// Hash products to update with edible consumption method
$hash_products = array(
    86809, 86800, 86788, 86781, 86769, 86756, 86748, 86741, 86728,
    86638, 86627, 86615, 86598, 86577,
    85557, 85547, 85491, 85480, 85465, 85451, 85440, 85428, 85414, 85402, 85386
);

// The edible consumption method content to add
$edible_method = '<li><strong>Hash Edibles (Advanced):</strong> To make edibles, decarboxylate hash at 110-120°C (230-250°F) for 30-40 minutes to activate THC. Mix into butter or oil-based recipes. Effects take 30-120 minutes and last 6-12 hours. Hash edibles are significantly more potent than flower edibles—start with 1/4 of your normal flower edible dose and wait at least 2 hours before consuming more.</li>';

// Pattern to find existing Consumption Methods section
$pattern = '/(<h3>Consumption Methods<\/h3>\s*<ul>)(.*?)(<\/ul>)/s';

$updated = 0;
$skipped = 0;
$no_section = 0;

foreach ($hash_products as $product_id) {
    $post = get_post($product_id);
    if (!$post) {
        echo "Product $product_id not found\n";
        continue;
    }

    $content = $post->post_content;

    // Check if already has edible method
    if (stripos($content, 'Hash Edibles') !== false || stripos($content, 'decarboxylate') !== false) {
        echo "Skipped $product_id - already has edible method\n";
        $skipped++;
        continue;
    }

    // Check if has Consumption Methods section
    if (preg_match($pattern, $content, $matches)) {
        // Add edible method before closing </ul>
        $new_content = preg_replace(
            $pattern,
            '$1$2' . "\n" . $edible_method . "\n" . '$3',
            $content
        );

        $result = wp_update_post(array(
            'ID' => $product_id,
            'post_content' => $new_content
        ));

        if ($result) {
            echo "Updated $product_id - " . $post->post_title . "\n";
            $updated++;
        } else {
            echo "Failed to update $product_id\n";
        }
    } else {
        echo "No Consumption Methods section in $product_id - " . $post->post_title . "\n";
        $no_section++;
    }
}

echo "\n=== Summary ===\n";
echo "Updated: $updated\n";
echo "Skipped (already has): $skipped\n";
echo "No section found: $no_section\n";
echo "Total processed: " . count($hash_products) . "\n";
