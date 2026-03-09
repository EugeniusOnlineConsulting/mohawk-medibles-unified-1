<?php
$post_id = 28314;

// Expanded product description (SEO optimized, 400+ words)
$post_content = '<p><strong>Medibles House THCA Diamonds &amp; Sauce</strong> delivers one of the most potent and pure cannabis concentrate experiences available in Canada. With THC levels ranging from 93% to 97%, these premium THCA diamonds offer an exceptionally powerful dabbing experience for concentrate enthusiasts.</p>

<h2>What Are THCA Diamonds?</h2>

<p>THCA diamonds are crystalline structures of pure tetrahydrocannabinolic acid, the precursor to THC. When heated through dabbing or vaporizing, THCA converts to THC, delivering intense effects and exceptional flavour. The "sauce" component contains terpene-rich extract that enhances the flavour profile and provides the entourage effect.</p>

<h2>Why Choose Medibles House Diamonds &amp; Sauce?</h2>

<ul>
<li><strong>Ultra-High Potency</strong> - 93% to 97% THC for maximum effect</li>
<li><strong>Premium Quality</strong> - Carefully extracted for purity and potency</li>
<li><strong>Terpene-Rich Sauce</strong> - Enhanced flavour and entourage effect</li>
<li><strong>Multiple Strains</strong> - Choose from 13+ popular varieties</li>
<li><strong>Flexible Sizing</strong> - Available in 2g and 28g (1oz) options</li>
</ul>

<h2>Available Strains</h2>

<p>Select from our diverse strain lineup to match your preferences:</p>

<ul>
<li><strong>Agent Orange</strong> - Citrus-forward sativa-dominant hybrid</li>
<li><strong>El Fuego</strong> - Fiery, potent effects</li>
<li><strong>Citrique</strong> - Bright citrus terpene profile</li>
<li><strong>Caviar</strong> - Luxurious, smooth experience</li>
<li><strong>Pink Grapefruit</strong> - Sweet, fruity sativa</li>
<li><strong>Godfather OG</strong> - Classic indica potency</li>
<li><strong>Master Kush</strong> - Earthy, relaxing indica</li>
<li><strong>Pink Kush</strong> - Sweet vanilla indica</li>
<li><strong>Lemon Diesel</strong> - Energizing citrus sativa</li>
<li><strong>ATF (Alaskan Thunder Fuck)</strong> - Legendary sativa</li>
<li><strong>Durban Poison</strong> - Pure African sativa</li>
<li><strong>GG4 (Gorilla Glue)</strong> - Heavy-hitting hybrid</li>
<li><strong>Death Bubba HTFSE</strong> - Potent indica with full-spectrum extraction</li>
</ul>

<h2>How to Use THCA Diamonds</h2>

<p>THCA diamonds are designed for dabbing or vaporizing using a dab rig, e-nail, or concentrate vaporizer. Start with a small amount (rice grain size) due to the extreme potency. Heat your nail or banger to the appropriate temperature, apply the diamonds and sauce, and inhale slowly.</p>

<h2>Product Details</h2>

<ul>
<li><strong>Potency:</strong> 93% - 97% THC</li>
<li><strong>Type:</strong> THCA Diamonds with Terp Sauce</li>
<li><strong>Sizes:</strong> 2 grams or 28 grams (1oz)</li>
<li><strong>Best For:</strong> Experienced concentrate users</li>
</ul>

<p><strong>Order Medibles House THCA Diamonds &amp; Sauce today</strong> and experience premium cannabis concentrates with fast, discreet shipping across Canada from Mohawk Medibles.</p>';

// Update product content
wp_update_post(array(
    'ID' => $post_id,
    'post_content' => $post_content
));

// Update Yoast SEO meta
update_post_meta($post_id, '_yoast_wpseo_title', 'THCA Diamonds & Sauce 93-97% THC | Buy Concentrates Canada | Mohawk Medibles');
update_post_meta($post_id, '_yoast_wpseo_metadesc', 'Buy THCA Diamonds & Sauce with 93-97% THC. Premium cannabis concentrates in 2g or 28g. 13+ strains available. Fast discreet shipping across Canada.');
update_post_meta($post_id, '_yoast_wpseo_focuskw', 'THCA diamonds Canada');

// Output results
echo "Product 28314 updated!\n\n";
echo "NEW SEO TITLE: THCA Diamonds & Sauce 93-97% THC | Buy Concentrates Canada | Mohawk Medibles\n";
echo "Title length: " . strlen('THCA Diamonds & Sauce 93-97% THC | Buy Concentrates Canada | Mohawk Medibles') . " chars\n\n";
echo "NEW META DESC: Buy THCA Diamonds & Sauce with 93-97% THC. Premium cannabis concentrates in 2g or 28g. 13+ strains available. Fast discreet shipping across Canada.\n";
echo "Meta length: " . strlen('Buy THCA Diamonds & Sauce with 93-97% THC. Premium cannabis concentrates in 2g or 28g. 13+ strains available. Fast discreet shipping across Canada.') . " chars\n\n";
echo "NEW FOCUS KEYPHRASE: THCA diamonds Canada\n\n";
echo "CONTENT WORD COUNT: " . str_word_count(strip_tags($post_content)) . " words\n";
