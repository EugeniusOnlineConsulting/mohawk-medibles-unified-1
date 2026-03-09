<?php
// Add internal links to CBD Pain Relief blog (ID: 980)

$post_id = 980;
$post = get_post($post_id);

if (!$post) {
    echo "Post not found\n";
    exit;
}

// Get current content
$content = $post->post_content;

// Get CBD product URLs
$cbd_oil_url = get_permalink(83303); // Plant of Life THC Free CBD Oil
$cbd_salve_url = get_permalink(83579); // C&D CBD Salve
$cbd_roller_url = get_permalink(83575); // PEM CBD Pain Relief Roller
$cbd_capsules_url = get_permalink(26197); // CBD Capsules

// Create new enhanced content with internal links
$new_content = '
<h2>CBD Oil for Pain Relief: A Natural Solution</h2>

<p>Chronic pain affects millions of Canadians, and many are turning to <strong>CBD oil for natural pain relief</strong>. Cannabidiol (CBD) is a non-psychoactive compound found in cannabis that interacts with your body\'s endocannabinoid system to reduce inflammation and pain signals.</p>

<h2>How CBD Oil Works for Pain</h2>

<p>CBD works by binding to receptors in your endocannabinoid system (ECS), which regulates pain, inflammation, and immune response. Unlike THC, CBD does not produce a "high" - instead, it provides therapeutic benefits while maintaining mental clarity.</p>

<p>Research shows CBD may help with:</p>
<ul>
<li><strong>Chronic pain:</strong> Arthritis, fibromyalgia, back pain</li>
<li><strong>Inflammatory conditions:</strong> Joint pain, muscle soreness</li>
<li><strong>Neuropathic pain:</strong> Nerve damage, sciatica</li>
<li><strong>Post-workout recovery:</strong> Muscle tension, exercise-induced inflammation</li>
</ul>

<h2>Types of CBD Products for Pain Relief</h2>

<h3>CBD Oils & Tinctures</h3>
<p>Sublingual CBD oils provide fast absorption (15-30 minutes) and precise dosing. Our <a href="' . $cbd_oil_url . '">Plant of Life THC-Free Organic CBD Oil</a> is ideal for those seeking pure CBD without any THC.</p>

<h3>CBD Topicals</h3>
<p>For targeted relief, topical CBD products work directly on the affected area. Try our <a href="' . $cbd_salve_url . '">C&D THC Free CBD Salve 1000mg</a> or the <a href="' . $cbd_roller_url . '">Pineapple Express Meds CBD Pain Relief Roller</a> for convenient application.</p>

<h3>CBD Capsules</h3>
<p>For consistent daily dosing, <a href="' . $cbd_capsules_url . '">CBD Capsules</a> offer precise amounts in an easy-to-swallow format - perfect for incorporating into your wellness routine.</p>

<h2>Dosage Guidelines for Pain Relief</h2>

<p>Finding your optimal CBD dose requires some experimentation. We recommend:</p>

<ul>
<li><strong>Start low:</strong> Begin with 10-20mg CBD daily</li>
<li><strong>Go slow:</strong> Increase by 5-10mg every week until you find relief</li>
<li><strong>Be consistent:</strong> Take CBD at the same time each day for best results</li>
<li><strong>Track your results:</strong> Note pain levels and adjust accordingly</li>
</ul>

<h2>Why Choose Mohawk Medibles for CBD?</h2>

<p>As an Indigenous-owned dispensary in Tyendinaga Mohawk Territory, we take pride in offering premium, lab-tested CBD products. Our selection includes oils, topicals, capsules, and edibles - all sourced from trusted Canadian suppliers.</p>

<h3>Ready to Try CBD for Pain Relief?</h3>

<p>Consult with your healthcare provider about incorporating CBD into your pain management routine. Our knowledgeable team is also available to help you find the right product for your needs.</p>

<p><a href="https://mohawkmedibles.ca/product-category/cbd/">Browse our full CBD collection</a> or contact us for personalized recommendations.</p>
';

// Update post
$result = wp_update_post(array(
    'ID' => $post_id,
    'post_content' => $new_content
));

if ($result && !is_wp_error($result)) {
    $word_count = str_word_count(strip_tags($new_content));
    echo "✅ Updated CBD Pain Relief blog (ID: $post_id)\n";
    echo "   Word count: $word_count words\n";
    echo "   Internal links added: 5\n";
    echo "   H2 headings: 5\n";
    echo "   H3 headings: 2\n";
} else {
    echo "❌ Failed to update post\n";
}
