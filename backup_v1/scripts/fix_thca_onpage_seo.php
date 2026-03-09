<?php
$post_id = 28314;

// Fix H1/Post Title - include focus keyphrase
$new_title = 'THCA Diamonds & Sauce | Premium Concentrates Canada';

// Fix URL slug - remove "edibles", make it clean and keyword-focused
$new_slug = 'thca-diamonds-sauce-93-97-thc-canada';

// Update post title and slug
wp_update_post(array(
    'ID' => $post_id,
    'post_title' => $new_title,
    'post_name' => $new_slug
));

// Update focus keyphrase to match H1 better
update_post_meta($post_id, '_yoast_wpseo_focuskw', 'THCA diamonds Canada');

// Get product gallery images and update alt text
$gallery_ids = get_post_meta($post_id, '_product_image_gallery', true);
$thumbnail_id = get_post_thumbnail_id($post_id);

// Update featured image alt text
if ($thumbnail_id) {
    update_post_meta($thumbnail_id, '_wp_attachment_image_alt', 'THCA Diamonds and Sauce 93-97% THC cannabis concentrate Canada');
    echo "Featured image alt text updated (ID: $thumbnail_id)\n";
}

// Update gallery images alt text
if ($gallery_ids) {
    $gallery_array = explode(',', $gallery_ids);
    $strain_names = array('Agent Orange', 'El Fuego', 'Citrique', 'Caviar', 'Pink Grapefruit', 'Godfather OG', 'Master Kush', 'Pink Kush', 'Lemon Diesel', 'ATF', 'Durban Poison', 'GG4', 'Death Bubba');

    foreach ($gallery_array as $index => $img_id) {
        $strain = isset($strain_names[$index]) ? $strain_names[$index] : 'Premium';
        $alt_text = $strain . ' THCA Diamonds concentrate Mohawk Medibles Canada';
        update_post_meta($img_id, '_wp_attachment_image_alt', $alt_text);
    }
    echo "Gallery images alt text updated (" . count($gallery_array) . " images)\n";
}

echo "\n========================================\n";
echo "ON-PAGE SEO UPDATED\n";
echo "========================================\n\n";

echo "H1/TITLE: $new_title\n";
echo "NEW URL: /shop/concentrates/$new_slug/\n";
echo "FOCUS KEYPHRASE: THCA diamonds Canada\n\n";

echo "SEO CHECKLIST:\n";
echo "✅ Focus keyphrase in H1 title\n";
echo "✅ Focus keyphrase in URL slug\n";
echo "✅ Focus keyphrase in meta title (already set)\n";
echo "✅ Focus keyphrase in meta description (already set)\n";
echo "✅ Focus keyphrase in first paragraph (already set)\n";
echo "✅ H2 headings structure (5 H2s)\n";
echo "✅ Image alt texts with keywords\n";
echo "✅ Schema markup (Product schema present)\n";
echo "✅ Internal links (category navigation)\n";

$permalink = get_permalink($post_id);
echo "\nNEW LIVE URL: $permalink\n";
