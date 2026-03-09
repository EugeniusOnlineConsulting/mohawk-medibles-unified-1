<?php
// Fix products with very short content (<100 chars)

$short_content_products = array(
    83579, // C&D THC Free CBD Salve 1000mg (22 chars)
    21983, // ASEND - 1 Gram Disposable Vape Pen (49 chars)
    20679, // Buddha Love Hash (25 chars)
    20087, // Drizzle Factory Slims - AAAA Craft Exotic Pre-Rolls (66 chars)
    19882, // Cognac Hash $140/OZ Deal (29 chars)
    19636, // Zillionaire Distillate Syringe 1G (61 chars)
    19248, // Pineapple Express Meds (PEM) Disposable 1.2ml (59 chars)
    16148  // Stoned Leaf Moon Rocket (67 chars)
);

$content_templates = array(
    83579 => '
<h2>C&amp;D THC Free CBD Salve 1000mg</h2>

<p>Experience targeted relief with <strong>C&amp;D THC Free CBD Salve</strong>, a premium topical formulated with 1000mg of pure CBD. This THC-free formula delivers the therapeutic benefits of CBD directly where you need it most, without any psychoactive effects.</p>

<h3>Product Highlights</h3>
<ul>
<li><strong>Potency:</strong> 1000mg pure CBD per container</li>
<li><strong>THC Free:</strong> Zero THC - no psychoactive effects, safe for drug testing</li>
<li><strong>Fast-Acting:</strong> Topical application for targeted relief</li>
<li><strong>Premium Quality:</strong> Made with high-quality CBD extract</li>
</ul>

<h3>Benefits</h3>
<ul>
<li>Targeted relief for muscles and joints</li>
<li>Soothing and moisturizing for skin</li>
<li>Non-greasy formula absorbs quickly</li>
<li>Perfect for post-workout recovery</li>
</ul>

<h3>How to Use</h3>
<p>Apply a small amount to the affected area and massage gently until absorbed. Reapply as needed throughout the day. For external use only.</p>
',
    21983 => '
<h2>ASEND - 1 Gram Disposable Vape Pen</h2>

<p>Discover smooth, potent hits with the <strong>ASEND 1 Gram Disposable Vape Pen</strong>. This sleek, ready-to-use vape delivers premium THC distillate in a convenient, pocket-friendly design perfect for on-the-go enjoyment.</p>

<h3>Product Highlights</h3>
<ul>
<li><strong>Size:</strong> 1 gram THC distillate</li>
<li><strong>Type:</strong> Disposable - no charging or refilling needed</li>
<li><strong>Draw-Activated:</strong> Simply inhale to activate</li>
<li><strong>Discreet:</strong> Compact design with minimal odour</li>
</ul>

<h3>Effects</h3>
<p>ASEND vapes deliver a clean, smooth experience with fast-acting effects. Expect a balanced high that is perfect for relaxation or social settings.</p>

<h3>Usage Guide</h3>
<ul>
<li><strong>Beginners:</strong> Start with 1-2 small puffs, wait 10-15 minutes</li>
<li><strong>Experienced:</strong> Adjust to your preferred intensity</li>
<li><strong>Onset:</strong> 2-10 minutes</li>
<li><strong>Duration:</strong> 1-3 hours</li>
</ul>
',
    20679 => '
<h2>Buddha Love Hash</h2>

<p><strong>Buddha Love Hash</strong> is a premium traditional hash with a rich, earthy flavour and smooth, relaxing effects. Crafted using time-honoured methods, this hash delivers the authentic experience that concentrate enthusiasts crave.</p>

<h3>Product Characteristics</h3>
<ul>
<li><strong>Type:</strong> Traditional pressed hash</li>
<li><strong>Texture:</strong> Soft and pliable</li>
<li><strong>Aroma:</strong> Earthy with subtle spice notes</li>
<li><strong>Effects:</strong> Relaxing, euphoric, calming</li>
</ul>

<h3>Consumption Methods</h3>
<ul>
<li><strong>Smoking:</strong> Crumble and mix with flower in joints or bowls</li>
<li><strong>Vaporizing:</strong> Use a hash-compatible vaporizer at 180-210°C</li>
<li><strong>Hot Knives:</strong> Traditional method for immediate effects</li>
</ul>

<h3>Dosage</h3>
<ul>
<li><strong>Beginners:</strong> Start with a rice grain-sized piece (0.025-0.05g)</li>
<li><strong>Experienced:</strong> 0.1-0.2g per session</li>
</ul>

<p><strong>Note:</strong> Hash is significantly more potent than flower. Start low and go slow.</p>
',
    20087 => '
<h2>Drizzle Factory Slims - AAAA Craft Exotic Pre-Rolls</h2>

<p>Experience premium cannabis with <strong>Drizzle Factory Slims AAAA Craft Exotic Pre-Rolls</strong>. These expertly rolled joints feature top-shelf exotic strains, delivering exceptional flavour and potent effects in every puff.</p>

<h3>Product Highlights</h3>
<ul>
<li><strong>Quality:</strong> AAAA craft-grade exotic cannabis</li>
<li><strong>Roll:</strong> Perfectly crafted for even burn</li>
<li><strong>Flavour:</strong> Rich terpene profiles from premium strains</li>
<li><strong>Convenience:</strong> Ready to smoke, no preparation needed</li>
</ul>

<h3>Why Choose AAAA Grade?</h3>
<p>AAAA (quad-A) represents the highest quality cannabis available. These pre-rolls feature hand-selected buds with exceptional trichome coverage, complex terpene profiles, and maximum potency.</p>

<h3>Effects</h3>
<p>Expect a full-spectrum experience with powerful effects that showcase the unique characteristics of each exotic strain. Perfect for connoisseurs seeking the best.</p>
',
    19882 => '
<h2>Cognac Hash - $140/OZ Deal</h2>

<p><strong>Cognac Hash</strong> is a smooth, refined hash with a distinctive flavour profile reminiscent of its namesake spirit. This premium concentrate offers a mellow, relaxing high perfect for unwinding.</p>

<h3>Product Characteristics</h3>
<ul>
<li><strong>Type:</strong> Premium pressed hash</li>
<li><strong>Texture:</strong> Smooth and malleable</li>
<li><strong>Aroma:</strong> Rich, warm notes with subtle sweetness</li>
<li><strong>Effects:</strong> Relaxing, mellow, stress-relieving</li>
</ul>

<h3>Special Offer</h3>
<p>Take advantage of our $140/OZ deal - premium quality hash at an exceptional price.</p>

<h3>Consumption Methods</h3>
<ul>
<li><strong>Smoking:</strong> Crumble into joints or top bowls</li>
<li><strong>Vaporizing:</strong> 180-210°C for best flavour</li>
<li><strong>Edibles:</strong> Decarboxylate at 110-120°C for 30-40 minutes before cooking</li>
</ul>

<h3>Dosage</h3>
<p>Start with a small amount (0.05g) and increase as needed. Hash is more potent than flower.</p>
',
    19636 => '
<h2>Zillionaire Distillate Syringe 1G</h2>

<p>The <strong>Zillionaire Distillate Syringe</strong> delivers 1 gram of pure, potent THC distillate in an easy-to-use applicator. Perfect for refilling cartridges, dabbing, or making edibles with precise dosing.</p>

<h3>Product Highlights</h3>
<ul>
<li><strong>Potency:</strong> High-purity THC distillate</li>
<li><strong>Size:</strong> 1 gram per syringe</li>
<li><strong>Versatile:</strong> Multiple consumption methods</li>
<li><strong>Precise:</strong> Easy dosing with syringe applicator</li>
</ul>

<h3>Usage Options</h3>
<ul>
<li><strong>Refill Cartridges:</strong> Fill empty vape carts for cost savings</li>
<li><strong>Dabbing:</strong> Apply to heated nail for instant effects</li>
<li><strong>Edibles:</strong> Add to food/drinks (already decarboxylated)</li>
<li><strong>Topping Flower:</strong> Add to bowls or joints for extra potency</li>
</ul>

<h3>Why Choose Distillate?</h3>
<p>Distillate is one of the purest forms of THC available, refined to remove impurities while preserving maximum potency. Odourless and versatile for any consumption method.</p>
',
    19248 => '
<h2>Pineapple Express Meds (PEM) Disposable 1.2ml</h2>

<p>Enjoy premium cannabis on-the-go with the <strong>Pineapple Express Meds 1.2ml Disposable Vape</strong>. This sleek, ready-to-use device delivers smooth, flavourful hits with the quality PEM is known for.</p>

<h3>Product Highlights</h3>
<ul>
<li><strong>Size:</strong> 1.2ml premium THC oil</li>
<li><strong>Type:</strong> Disposable - no charging needed</li>
<li><strong>Brand:</strong> Pineapple Express Meds (PEM)</li>
<li><strong>Activation:</strong> Draw-activated for easy use</li>
</ul>

<h3>Effects</h3>
<p>PEM vapes deliver a balanced, enjoyable high with smooth flavour. Perfect for both new and experienced users seeking convenience without sacrificing quality.</p>

<h3>Usage Tips</h3>
<ul>
<li>Start with small puffs if new to vaping</li>
<li>Wait 10-15 minutes between sessions to gauge effects</li>
<li>Store upright in a cool, dry place</li>
</ul>
',
    16148 => '
<h2>Stoned Leaf Moon Rocket</h2>

<p>Blast off with the <strong>Stoned Leaf Moon Rocket</strong> - a premium infused pre-roll that combines top-shelf flower with potent concentrates for an out-of-this-world experience.</p>

<h3>Product Highlights</h3>
<ul>
<li><strong>Type:</strong> Infused pre-roll (Moon Rock style)</li>
<li><strong>Potency:</strong> Enhanced with concentrates for maximum effects</li>
<li><strong>Quality:</strong> Premium flower + hash oil + kief</li>
<li><strong>Ready to Use:</strong> Pre-rolled for convenience</li>
</ul>

<h3>What Makes It Special?</h3>
<p>Moon Rockets take regular pre-rolls to the next level by infusing quality flower with hash oil and coating it in kief. The result is a significantly more potent experience than standard joints.</p>

<h3>Usage Guide</h3>
<ul>
<li><strong>Beginners:</strong> Share with friends - these are potent!</li>
<li><strong>Experienced:</strong> Enjoy the full rocket solo</li>
<li><strong>Tip:</strong> Burns slower than regular joints - take your time</li>
</ul>

<p><strong>Warning:</strong> Infused pre-rolls are significantly stronger than regular joints. Start slow and enjoy responsibly.</p>
'
);

$updated = 0;

foreach ($short_content_products as $product_id) {
    if (!isset($content_templates[$product_id])) {
        echo "No template for $product_id\n";
        continue;
    }

    $post = get_post($product_id);
    if (!$post) {
        echo "Product $product_id not found\n";
        continue;
    }

    $new_content = $content_templates[$product_id];

    $result = wp_update_post(array(
        'ID' => $product_id,
        'post_content' => $new_content
    ));

    if ($result && !is_wp_error($result)) {
        $char_count = strlen(strip_tags($new_content));
        echo "✅ Updated $product_id - " . $post->post_title . " ($char_count chars)\n";
        $updated++;
    } else {
        echo "❌ Failed to update $product_id\n";
    }
}

echo "\n=== SUMMARY ===\n";
echo "Updated: $updated of " . count($short_content_products) . " products\n";
