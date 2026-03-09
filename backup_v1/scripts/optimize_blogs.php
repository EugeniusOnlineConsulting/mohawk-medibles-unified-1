<?php
// Optimize blog post SEO

$blog_optimizations = array(
    // THC Oil blog
    88021 => array(
        'seo_title' => 'Benefits & Uses of THC Oil | Mohawk Medibles Canada',
        'meta_desc' => 'Discover THC oil benefits including pain relief, sleep support, and appetite stimulation. Learn dosing and therapeutic uses. Shop THC oils at Mohawk Medibles.',
        'focus_kw' => 'thc oil benefits'  // Fixed: was "cbd oil benefits" on THC article!
    ),
    // CBD Oil Benefits blog
    981 => array(
        'seo_title' => 'Benefits & Uses of CBD Oil | Mohawk Medibles Canada',
        'meta_desc' => 'Learn CBD oil benefits for pain, anxiety, sleep and inflammation. Non-psychoactive wellness from cannabis. Shop premium CBD oils at Mohawk Medibles Canada.',
        'focus_kw' => 'cbd oil benefits'
    ),
    // CBD Oil Pain Relief blog
    980 => array(
        'seo_title' => 'CBD Oil for Pain Relief | Natural Hemp Extract | Mohawk Medibles',
        'meta_desc' => 'CBD oil for natural pain relief. Premium hemp extract for chronic pain, inflammation and recovery. Shop quality CBD products at Mohawk Medibles Canada.',
        'focus_kw' => 'cbd oil for pain'  // Simplified from "cbd oil pain relief"
    )
);

echo "=== OPTIMIZING BLOG SEO ===\n\n";

foreach ($blog_optimizations as $post_id => $seo) {
    $post = get_post($post_id);
    if (!$post) {
        echo "Post $post_id not found\n";
        continue;
    }

    echo "Post ID: $post_id - {$post->post_title}\n";

    // Update SEO title
    update_post_meta($post_id, '_yoast_wpseo_title', $seo['seo_title']);
    echo "  ✅ SEO Title: {$seo['seo_title']}\n";

    // Update meta description
    update_post_meta($post_id, '_yoast_wpseo_metadesc', $seo['meta_desc']);
    echo "  ✅ Meta Desc: {$seo['meta_desc']} (" . strlen($seo['meta_desc']) . " chars)\n";

    // Update focus keyphrase
    update_post_meta($post_id, '_yoast_wpseo_focuskw', $seo['focus_kw']);
    echo "  ✅ Focus KW: {$seo['focus_kw']}\n";

    echo "\n";
}

echo "=== BLOG SEO OPTIMIZATION COMPLETE ===\n";
