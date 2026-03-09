<?php
// Fix empty content for two products

// Content for Bakrs Triplets Pre Rolls (ID: 26113)
$bakrs_content = '
<h2>Bakrs Triplets Pre Rolls</h2>

<p>Experience premium convenience with <strong>Bakrs Triplets Pre Rolls</strong> - expertly crafted pre-rolled joints featuring top-quality cannabis. Each pack contains three perfectly rolled joints, ready to enjoy whenever the moment strikes.</p>

<h3>Product Highlights</h3>
<ul>
<li><strong>Triple Pack:</strong> Three pre-rolled joints per package for extended enjoyment</li>
<li><strong>Premium Quality:</strong> Made with carefully selected, high-grade cannabis flower</li>
<li><strong>Perfect Roll:</strong> Expertly crafted for even burn and smooth draw</li>
<li><strong>Convenient:</strong> Ready to smoke - no grinding, rolling, or preparation needed</li>
</ul>

<h3>Why Choose Pre Rolls?</h3>
<p>Pre-rolled joints offer the ultimate convenience for cannabis enthusiasts. Whether you\'re on-the-go, sharing with friends, or simply want a hassle-free experience, Bakrs Triplets delivers quality and convenience in every pack.</p>

<hr />

<h2>Usage Guide</h2>

<h3>Recommended Use</h3>
<ul>
<li><strong>Beginners:</strong> Start with a few puffs and wait 10-15 minutes to assess effects before continuing</li>
<li><strong>Experienced Users:</strong> Enjoy at your preferred pace, one joint provides a full session</li>
</ul>

<h3>Onset &amp; Duration</h3>
<ul>
<li><strong>Onset:</strong> 2-10 minutes when smoked</li>
<li><strong>Peak Effects:</strong> 15-45 minutes</li>
<li><strong>Duration:</strong> 1-3 hours depending on tolerance</li>
</ul>

<p><strong>Tip:</strong> Store in a cool, dry place to maintain freshness. Each joint is individually packed to preserve quality.</p>
';

// Content for K Sat Magic Mushrooms (ID: 21601)
$mushroom_content = '
<h2>K Sat Magic Mushrooms</h2>

<p><strong>K Sat Magic Mushrooms</strong> are a premium psilocybin strain known for their balanced effects and accessibility for both newcomers and experienced psychonauts. This strain delivers a harmonious blend of visual enhancement, euphoria, and introspective clarity.</p>

<h3>Strain Characteristics</h3>
<ul>
<li><strong>Type:</strong> Psilocybe Cubensis</li>
<li><strong>Potency:</strong> Moderate - ideal for beginners to intermediate users</li>
<li><strong>Effects:</strong> Euphoric, visual enhancement, creative inspiration, introspective</li>
<li><strong>Duration:</strong> 4-6 hours typical experience</li>
</ul>

<h3>What to Expect</h3>
<p>K Sat mushrooms are celebrated for delivering a well-rounded psychedelic experience. Users commonly report enhanced colours and patterns, waves of euphoria, creative thinking, and meaningful introspection. The moderate potency makes this strain approachable while still delivering a full experience.</p>

<hr />

<h2>Dosage Guide</h2>

<h3>Recommended Dosage</h3>
<ul>
<li><strong>Microdose:</strong> 0.1-0.3g - Subtle mood enhancement, increased focus, no perceptual changes</li>
<li><strong>Beginner:</strong> 0.5-1g - Light effects, mild visuals, enhanced mood</li>
<li><strong>Standard:</strong> 1.5-2.5g - Full psychedelic experience with moderate visuals</li>
<li><strong>Strong:</strong> 3-4g - Intense experience, profound visuals and introspection</li>
<li><strong>Heroic:</strong> 5g+ - For experienced users only, intense spiritual experience</li>
</ul>

<h3>Consumption Methods</h3>
<ul>
<li><strong>Direct:</strong> Chew thoroughly and swallow. Expect onset in 30-45 minutes</li>
<li><strong>Tea:</strong> Steep in hot (not boiling) water for 15-20 minutes. Faster onset, gentler on stomach</li>
<li><strong>Lemon Tek:</strong> Soak ground mushrooms in lemon juice for 20 minutes. Intensified, faster experience</li>
<li><strong>Capsules:</strong> For precise microdosing and easier consumption</li>
</ul>

<h3>Onset &amp; Duration</h3>
<ul>
<li><strong>Onset:</strong> 20-45 minutes (faster with tea or lemon tek)</li>
<li><strong>Peak Effects:</strong> 1.5-3 hours</li>
<li><strong>Total Duration:</strong> 4-6 hours</li>
<li><strong>Afterglow:</strong> Mild effects may persist for several hours after</li>
</ul>

<p><strong>Important:</strong> Start with a lower dose if you\'re new to this strain. Set and setting are crucial - ensure you\'re in a comfortable, safe environment. Consider having a trusted friend present, especially at higher doses.</p>
';

// Update Bakrs Triplets (26113)
$result1 = wp_update_post(array(
    'ID' => 26113,
    'post_content' => $bakrs_content
));

if ($result1 && !is_wp_error($result1)) {
    echo "✅ Updated ID 26113 - Bakrs Triplets Pre Rolls\n";
    echo "   Content length: " . strlen(strip_tags($bakrs_content)) . " chars\n";
} else {
    echo "❌ Failed to update ID 26113\n";
}

// Update K Sat Magic Mushrooms (21601)
$result2 = wp_update_post(array(
    'ID' => 21601,
    'post_content' => $mushroom_content
));

if ($result2 && !is_wp_error($result2)) {
    echo "✅ Updated ID 21601 - K Sat Magic Mushrooms\n";
    echo "   Content length: " . strlen(strip_tags($mushroom_content)) . " chars\n";
} else {
    echo "❌ Failed to update ID 21601\n";
}

// Also add SEO meta for these products
$bakrs_meta = "Buy Bakrs Triplets Pre Rolls at Mohawk Medibles. Premium cannabis pre-rolls in convenient 3-pack. Fast Canadian delivery from Indigenous-owned dispensary.";
$bakrs_focus = "bakrs triplets pre rolls canada";

$mushroom_meta = "Buy K Sat Magic Mushrooms at Mohawk Medibles. Premium psilocybin with balanced effects. Fast Canadian delivery from Indigenous-owned dispensary.";
$mushroom_focus = "k sat magic mushrooms canada";

update_post_meta(26113, '_yoast_wpseo_metadesc', $bakrs_meta);
update_post_meta(26113, '_yoast_wpseo_focuskw', $bakrs_focus);
update_post_meta(21601, '_yoast_wpseo_metadesc', $mushroom_meta);
update_post_meta(21601, '_yoast_wpseo_focuskw', $mushroom_focus);

echo "\n✅ Added SEO meta for both products\n";
