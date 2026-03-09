<?php
// Generate meta descriptions and focus keyphrases for all products missing them

$args = array(
    'post_type' => 'product',
    'posts_per_page' => -1,
    'post_status' => 'publish'
);

$products = get_posts($args);
$updated_meta = 0;
$updated_focus = 0;

// Category-based meta templates
function generate_meta_description($title, $categories) {
    $clean_title = preg_replace('/\s*\|\s*Mohawk Medibles.*$/', '', $title);
    $clean_title = trim($clean_title);

    // Determine product type from categories
    $cats_lower = array_map('strtolower', $categories);

    if (in_array('mushrooms', $cats_lower) || in_array('psilocybin', $cats_lower)) {
        if (in_array('chocolate', $cats_lower)) {
            return "Buy $clean_title online at Mohawk Medibles. Premium psilocybin chocolate for a smooth psychedelic experience. Discreet Canadian shipping.";
        } elseif (in_array('gummies', $cats_lower)) {
            return "Shop $clean_title at Mohawk Medibles. Delicious psilocybin gummies with precise dosing. Fast discreet delivery across Canada.";
        } elseif (in_array('capsules', $cats_lower)) {
            return "Buy $clean_title at Mohawk Medibles. Convenient psilocybin capsules for microdosing or full experiences. Discreet Canadian shipping.";
        } elseif (in_array('beverages', $cats_lower) || in_array('tea', $cats_lower)) {
            return "Shop $clean_title at Mohawk Medibles. Premium psilocybin tea for a gentle, enjoyable experience. Fast Canadian delivery.";
        } else {
            return "Buy $clean_title at Mohawk Medibles. Premium magic mushrooms with potent effects. Fast discreet shipping across Canada.";
        }
    }

    if (in_array('thc gummies', $cats_lower) || (in_array('edibles', $cats_lower) && in_array('gummies', $cats_lower))) {
        return "Buy $clean_title online at Mohawk Medibles. Delicious THC gummies with potent effects. Fast Canadian delivery from Indigenous-owned dispensary.";
    }

    if (in_array('thc chocolate', $cats_lower) || (in_array('edibles', $cats_lower) && in_array('chocolate', $cats_lower))) {
        return "Shop $clean_title at Mohawk Medibles. Premium THC chocolate for a delicious cannabis experience. Fast shipping across Canada.";
    }

    if (in_array('pre-rolls', $cats_lower) || in_array('infused pre-rolls', $cats_lower)) {
        if (in_array('infused pre-rolls', $cats_lower)) {
            return "Buy $clean_title at Mohawk Medibles. Premium infused pre-rolls for enhanced potency. Ready to smoke with fast Canadian delivery.";
        }
        return "Shop $clean_title at Mohawk Medibles. Premium pre-rolled joints ready to enjoy. Fast Canadian delivery from Indigenous-owned dispensary.";
    }

    if (in_array('hash', $cats_lower) || in_array('concentrates', $cats_lower)) {
        if (in_array('hash', $cats_lower)) {
            return "Buy $clean_title at Mohawk Medibles. Premium hash with rich flavour and potent effects. Fast Canadian delivery.";
        } elseif (in_array('shatter', $cats_lower)) {
            return "Shop $clean_title at Mohawk Medibles. High-quality shatter concentrate for dabbing. Fast shipping across Canada.";
        } elseif (in_array('distillate', $cats_lower)) {
            return "Buy $clean_title at Mohawk Medibles. Pure THC distillate for versatile consumption. Fast Canadian delivery.";
        }
        return "Shop $clean_title at Mohawk Medibles. Premium cannabis concentrate with potent effects. Fast Canadian shipping.";
    }

    if (in_array('flower', $cats_lower)) {
        return "Buy $clean_title cannabis online at Mohawk Medibles. Premium flower with exceptional quality. Fast Canadian delivery from Indigenous dispensary.";
    }

    if (in_array('topicals', $cats_lower) || in_array('creams', $cats_lower)) {
        return "Shop $clean_title at Mohawk Medibles. Premium cannabis topical for targeted relief. Fast Canadian delivery.";
    }

    if (in_array('cbd', $cats_lower)) {
        if (in_array('oils', $cats_lower)) {
            return "Buy $clean_title at Mohawk Medibles. Premium CBD oil for wellness and relaxation. Fast shipping across Canada.";
        }
        return "Shop $clean_title at Mohawk Medibles. Quality CBD products for wellness. Fast Canadian delivery from Indigenous-owned dispensary.";
    }

    if (in_array('kratom', $cats_lower)) {
        return "Buy $clean_title at Mohawk Medibles. Premium kratom products for natural wellness. Fast discreet Canadian shipping.";
    }

    if (in_array('tinctures', $cats_lower)) {
        return "Shop $clean_title at Mohawk Medibles. Premium THC tincture for precise dosing. Fast Canadian delivery.";
    }

    if (in_array('beverages', $cats_lower)) {
        return "Buy $clean_title at Mohawk Medibles. Refreshing THC-infused beverage for enjoyable effects. Fast Canadian shipping.";
    }

    if (in_array('accessories', $cats_lower) || in_array('pipes', $cats_lower)) {
        return "Shop $clean_title at Mohawk Medibles. Quality cannabis accessories for the best experience. Fast Canadian shipping.";
    }

    if (in_array('nicotine', $cats_lower)) {
        return "Buy $clean_title at Mohawk Medibles. Premium nicotine products with fast Canadian delivery. Indigenous-owned online store.";
    }

    // Default
    return "Buy $clean_title at Mohawk Medibles. Premium quality products with fast Canadian delivery from Indigenous-owned dispensary.";
}

function generate_focus_keyphrase($title) {
    $clean_title = preg_replace('/\s*\|\s*Mohawk Medibles.*$/', '', $title);
    $clean_title = strtolower(trim($clean_title));
    // Remove price info like "$5/G" or "$5G"
    $clean_title = preg_replace('/\s*\$[\d.]+\/?g?\s*/i', ' ', $clean_title);
    $clean_title = preg_replace('/\s+/', ' ', $clean_title);
    return trim($clean_title) . ' canada';
}

echo "=== GENERATING SEO META FOR ALL MISSING PRODUCTS ===\n\n";

foreach ($products as $product) {
    $id = $product->ID;
    $title = $product->post_title;

    $existing_meta = get_post_meta($id, '_yoast_wpseo_metadesc', true);
    $existing_focus = get_post_meta($id, '_yoast_wpseo_focuskw', true);

    // Skip if already has both
    if (!empty($existing_meta) && !empty($existing_focus)) {
        continue;
    }

    $terms = wp_get_post_terms($id, 'product_cat', array('fields' => 'names'));

    $updated_this = false;

    // Generate and update meta description if missing
    if (empty($existing_meta)) {
        $meta_desc = generate_meta_description($title, $terms);

        // Ensure within limits
        if (strlen($meta_desc) > 160) {
            $meta_desc = substr($meta_desc, 0, 157) . '...';
        }

        update_post_meta($id, '_yoast_wpseo_metadesc', $meta_desc);
        $updated_meta++;
        $updated_this = true;
    }

    // Generate and update focus keyphrase if missing
    if (empty($existing_focus)) {
        $focus_kw = generate_focus_keyphrase($title);
        update_post_meta($id, '_yoast_wpseo_focuskw', $focus_kw);
        $updated_focus++;
        $updated_this = true;
    }

    if ($updated_this) {
        $clean_title = preg_replace('/\s*\|\s*Mohawk Medibles.*$/', '', $title);
        echo "✅ ID $id: $clean_title\n";
    }
}

echo "\n=== SUMMARY ===\n";
echo "Meta descriptions added: $updated_meta\n";
echo "Focus keyphrases added: $updated_focus\n";
