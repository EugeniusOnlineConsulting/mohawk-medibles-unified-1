<?php
// Audit blog posts for SEO completeness

$args = array(
    'post_type' => 'post',
    'posts_per_page' => -1,
    'post_status' => 'publish'
);

$posts = get_posts($args);

echo "=== BLOG POST SEO AUDIT ===\n\n";
echo "Total blog posts: " . count($posts) . "\n\n";

foreach ($posts as $post) {
    $id = $post->ID;
    $title = $post->post_title;
    $content = $post->post_content;
    $excerpt = $post->post_excerpt;

    // Get Yoast SEO data
    $seo_title = get_post_meta($id, '_yoast_wpseo_title', true);
    $meta_desc = get_post_meta($id, '_yoast_wpseo_metadesc', true);
    $focus_kw = get_post_meta($id, '_yoast_wpseo_focuskw', true);

    // Content analysis
    $word_count = str_word_count(strip_tags($content));
    $has_headings = preg_match('/<h[2-6]/i', $content);
    $has_images = preg_match('/<img/i', $content);
    $has_internal_links = preg_match('/href=["\']https?:\/\/(www\.)?mohawkmedibles\.ca/i', $content);

    echo "========================================\n";
    echo "ID: $id\n";
    echo "Title: $title\n";
    echo "Date: {$post->post_date}\n";
    echo "URL: " . get_permalink($id) . "\n";
    echo "----------------------------------------\n";

    // SEO Status
    echo "SEO Title: " . (!empty($seo_title) ? "✅ Set" : "❌ Missing") . "\n";
    if (!empty($seo_title)) echo "   → $seo_title\n";

    echo "Meta Description: " . (!empty($meta_desc) ? "✅ Set (" . strlen($meta_desc) . " chars)" : "❌ Missing") . "\n";
    if (!empty($meta_desc)) echo "   → $meta_desc\n";

    echo "Focus Keyphrase: " . (!empty($focus_kw) ? "✅ Set" : "❌ Missing") . "\n";
    if (!empty($focus_kw)) echo "   → $focus_kw\n";

    echo "----------------------------------------\n";

    // Content Quality
    echo "Word Count: $word_count words " . ($word_count >= 300 ? "✅" : "⚠️ Too short") . "\n";
    echo "Has H2-H6 Headings: " . ($has_headings ? "✅ Yes" : "❌ No") . "\n";
    echo "Has Images: " . ($has_images ? "✅ Yes" : "❌ No") . "\n";
    echo "Has Internal Links: " . ($has_internal_links ? "✅ Yes" : "⚠️ No") . "\n";

    echo "\n";
}
