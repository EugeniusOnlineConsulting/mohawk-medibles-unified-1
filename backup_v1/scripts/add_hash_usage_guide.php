<?php
// Hash products to update
$hash_products = array(
    86809, 86800, 86788, 86781, 86769, 86756, 86748, 86741, 86728,
    86638, 86627, 86615, 86598, 86577,
    85557, 85547, 85491, 85480, 85465, 85451, 85440, 85428, 85414, 85402, 85386
);

// Complete usage guide section to add for products that don't have one
$usage_guide = '
<hr />

<h2>💡 Usage Guide</h2>

<h3>Recommended Dosage</h3>
<ul>
<li><strong>Beginners:</strong> Start with a rice grain-sized piece (approximately 0.025-0.05g). Hash is significantly more potent than flower.</li>
<li><strong>Experienced Users:</strong> 0.1-0.2g per session, adjusting based on tolerance and desired effects.</li>
<li><strong>High Tolerance:</strong> Up to 0.3g per session for seasoned concentrate consumers.</li>
</ul>

<h3>Consumption Methods</h3>
<ul>
<li><strong>Smoking:</strong> Crumble and mix with flower in joints, pipes, or bongs for enhanced potency and traditional experience.</li>
<li><strong>Vaporizing:</strong> Use hash-compatible vaporizer at 180-210°C for smooth, flavourful vapour with maximum terpene preservation.</li>
<li><strong>Hot Knives:</strong> Traditional method heating two knives and pressing hash between them for immediate effects.</li>
<li><strong>Topping Bowls:</strong> Add small pieces atop flower bowls for elevated potency without altering your regular routine.</li>
<li><strong>Hash Edibles (Advanced):</strong> To make edibles, decarboxylate hash at 110-120°C (230-250°F) for 30-40 minutes to activate THC. Mix into butter or oil-based recipes. Effects take 30-120 minutes and last 6-12 hours. Hash edibles are significantly more potent than flower edibles—start with 1/4 of your normal flower edible dose.</li>
</ul>

<h3>Onset &amp; Duration</h3>
<ul>
<li><strong>Onset (Smoking/Vaping):</strong> 2-10 minutes</li>
<li><strong>Onset (Edibles):</strong> 30-120 minutes</li>
<li><strong>Peak Effects:</strong> 15-45 minutes (inhaled) or 2-4 hours (edibles)</li>
<li><strong>Duration:</strong> 2-4 hours (inhaled) or 6-12 hours (edibles)</li>
</ul>

<p><strong>⚠️ Important:</strong> Hash is significantly more potent than regular flower. Start with minimal amounts and wait to assess effects before consuming more. Not recommended for beginners or those new to concentrates.</p>
';

// Edible method to add to existing Consumption Methods sections
$edible_method = '<li><strong>Hash Edibles (Advanced):</strong> To make edibles, decarboxylate hash at 110-120°C (230-250°F) for 30-40 minutes to activate THC. Mix into butter or oil-based recipes. Effects take 30-120 minutes and last 6-12 hours. Hash edibles are significantly more potent than flower edibles—start with 1/4 of your normal flower edible dose.</li>';

$updated_with_guide = 0;
$updated_edible_method = 0;
$skipped = 0;

foreach ($hash_products as $product_id) {
    $post = get_post($product_id);
    if (!$post) {
        echo "Product $product_id not found\n";
        continue;
    }

    $content = $post->post_content;
    $title = $post->post_title;

    // Check if already has edible method
    if (stripos($content, 'Hash Edibles') !== false || stripos($content, 'decarboxylate') !== false) {
        echo "Skipped $product_id - already has edible method\n";
        $skipped++;
        continue;
    }

    // Check if has Usage Guide or Consumption Methods section
    if (stripos($content, 'Usage Guide') !== false || stripos($content, 'Consumption Methods') !== false) {
        // Has existing section - just add edible method
        // Find the </ul> after Consumption Methods
        $pattern = '/(Consumption Methods<\/h3>\s*<ul>.*?)(<\/ul>)/s';
        if (preg_match($pattern, $content, $matches)) {
            $new_content = preg_replace(
                $pattern,
                '$1' . "\n" . $edible_method . "\n" . '$2',
                $content
            );

            $result = wp_update_post(array(
                'ID' => $product_id,
                'post_content' => $new_content
            ));

            if ($result) {
                echo "Added edible method to $product_id - $title\n";
                $updated_edible_method++;
            }
        }
    } else {
        // No usage section - add complete usage guide at the end of content
        $new_content = $content . $usage_guide;

        $result = wp_update_post(array(
            'ID' => $product_id,
            'post_content' => $new_content
        ));

        if ($result) {
            echo "Added full usage guide to $product_id - $title\n";
            $updated_with_guide++;
        } else {
            echo "Failed to update $product_id\n";
        }
    }
}

echo "\n=== Summary ===\n";
echo "Added full usage guide: $updated_with_guide\n";
echo "Added edible method only: $updated_edible_method\n";
echo "Skipped (already has): $skipped\n";
echo "Total processed: " . count($hash_products) . "\n";
