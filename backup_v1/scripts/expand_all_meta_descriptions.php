<?php
/**
 * Expand Short Meta Descriptions for 130 Products
 * Generates category-specific, SEO-optimized descriptions (140-160 chars)
 */

$products = get_posts(array(
    'post_type' => 'product',
    'post_status' => 'publish',
    'posts_per_page' => -1
));

$updated = 0;
$skipped = 0;

// Category-specific templates (will be customized per product)
$templates = array(
    'flower' => array(
        'default' => 'Buy {product} online in Canada. Premium cannabis flower with potent effects and smooth taste. Lab-tested quality. Fast discreet shipping from Mohawk Medibles.',
        'deal' => 'Save on {product} at Mohawk Medibles Canada. Premium cannabis flower at unbeatable prices. Lab-tested, fast discreet Canadian shipping. Order now!',
        'quads' => 'Shop {product} - Premium AAAA cannabis flower in Canada. Top-shelf quality, potent effects. Lab-tested. Fast discreet shipping from Mohawk Medibles.'
    ),
    'concentrates' => array(
        'hash' => 'Buy {product} online in Canada. Premium quality hash with rich flavor and potent effects. Lab-tested concentrate. Fast discreet shipping from Mohawk Medibles.',
        'shatter' => 'Order {product} online in Canada. High-potency shatter concentrate for dabbing. Lab-tested purity. Fast discreet Canadian shipping from Mohawk Medibles.',
        'wax' => 'Shop {product} at Mohawk Medibles Canada. Premium cannabis wax concentrate. Potent and flavorful. Lab-tested quality. Fast discreet shipping nationwide.',
        'rso' => 'Buy {product} online in Canada. Full-spectrum cannabis oil for wellness. High-potency extract. Lab-tested. Fast discreet shipping from Mohawk Medibles.',
        'default' => 'Order {product} online in Canada. Premium cannabis concentrate with exceptional potency. Lab-tested quality. Fast discreet shipping from Mohawk Medibles.'
    ),
    'edibles' => array(
        'gummies' => 'Buy {product} online in Canada. Delicious THC gummies with precise dosing. Lab-tested potency. Fast discreet Canadian shipping from Mohawk Medibles.',
        'chocolate' => 'Order {product} at Mohawk Medibles Canada. Premium cannabis-infused chocolate. Precise THC dosing. Lab-tested. Fast discreet shipping across Canada.',
        'default' => 'Shop {product} online in Canada. Premium cannabis edibles with consistent dosing. Lab-tested quality. Fast discreet shipping from Mohawk Medibles.'
    ),
    'beverages' => array(
        'tea' => 'Buy {product} online in Canada. Premium cannabis-infused tea for relaxation. Precise dosing. Lab-tested quality. Fast discreet shipping from Mohawk Medibles.',
        'hot_chocolate' => 'Order {product} at Mohawk Medibles. Luxury cannabis hot chocolate with balanced effects. Precise dosing. Lab-tested. Fast discreet Canadian shipping.',
        'default' => 'Shop {product} online in Canada. Premium cannabis beverage with precise dosing. Lab-tested quality. Fast discreet shipping from Mohawk Medibles.'
    ),
    'vapes' => array(
        'disposable' => 'Buy {product} online in Canada. Premium THC disposable vape, ready to use. Potent and flavorful. Lab-tested. Fast discreet shipping from Mohawk Medibles.',
        'cartridge' => 'Order {product} at Mohawk Medibles Canada. High-quality THC vape cartridge with pure distillate. Lab-tested potency. Fast discreet Canadian shipping.',
        'default' => 'Shop {product} online in Canada. Premium cannabis vape with smooth hits and potent effects. Lab-tested quality. Fast discreet shipping from Mohawk Medibles.'
    ),
    'cbd' => array(
        'oil' => 'Buy {product} online in Canada. Premium CBD oil for natural wellness. Non-psychoactive, lab-tested purity. Fast discreet shipping from Mohawk Medibles.',
        'pet' => 'Order {product} at Mohawk Medibles Canada. Premium CBD oil formulated for pets. Non-psychoactive, lab-tested. Fast discreet Canadian shipping.',
        'default' => 'Shop {product} online in Canada. Premium CBD products for natural wellness. Lab-tested quality. Fast discreet shipping from Mohawk Medibles.'
    ),
    'pre-rolls' => array(
        'default' => 'Buy {product} online in Canada. Premium pre-rolled joints, ready to enjoy. Quality cannabis flower. Lab-tested. Fast discreet shipping from Mohawk Medibles.'
    ),
    'nicotine' => array(
        'vape' => 'Shop {product} at Mohawk Medibles Canada. Premium nicotine vape with smooth flavor. Quality device. Fast discreet Canadian shipping. Order now!',
        'pouches' => 'Buy {product} online in Canada. Premium nicotine pouches, smoke-free satisfaction. Quality ingredients. Fast discreet shipping from Mohawk Medibles.',
        'default' => 'Order {product} at Mohawk Medibles Canada. Premium nicotine products with quality ingredients. Fast discreet Canadian shipping. Shop now!'
    ),
    'accessories' => array(
        'battery' => 'Buy {product} at Mohawk Medibles Canada. Quality 510-thread vape battery with adjustable voltage. Reliable performance. Fast discreet Canadian shipping.',
        'papers' => 'Shop {product} online in Canada. Premium rolling papers for smooth smoking experience. Quality materials. Fast discreet shipping from Mohawk Medibles.',
        'cigars' => 'Order {product} at Mohawk Medibles Canada. Premium cigars and wraps for your smoking pleasure. Quality selection. Fast discreet Canadian shipping.',
        'default' => 'Buy {product} at Mohawk Medibles Canada. Quality cannabis accessories for the best experience. Fast discreet Canadian shipping. Shop now!'
    ),
    'capsules' => array(
        'thc' => 'Buy {product} online in Canada. Precise-dosed THC capsules for consistent effects. Easy to take. Lab-tested. Fast discreet shipping from Mohawk Medibles.',
        'cbd' => 'Order {product} at Mohawk Medibles Canada. Premium CBD capsules for daily wellness. Precise dosing. Lab-tested. Fast discreet Canadian shipping.',
        'default' => 'Shop {product} online in Canada. Precise-dosed cannabis capsules for consistent effects. Lab-tested quality. Fast discreet shipping from Mohawk Medibles.'
    ),
    'tinctures' => array(
        'default' => 'Buy {product} online in Canada. Premium cannabis tincture with precise dropper dosing. Fast-acting effects. Lab-tested. Fast discreet shipping from Mohawk Medibles.'
    ),
    'topicals' => array(
        'default' => 'Order {product} at Mohawk Medibles Canada. Premium cannabis topical for targeted relief. Non-psychoactive. Lab-tested. Fast discreet Canadian shipping.'
    ),
    'default' => array(
        'default' => 'Buy {product} online at Mohawk Medibles Canada. Premium quality, lab-tested products. Indigenous-owned dispensary. Fast discreet shipping across Canada.'
    )
);

echo "==============================================\n";
echo "EXPANDING SHORT META DESCRIPTIONS\n";
echo "==============================================\n\n";

foreach ($products as $product) {
    $meta_desc = get_post_meta($product->ID, '_yoast_wpseo_metadesc', true);
    $length = strlen($meta_desc);

    // Only process if under 120 chars
    if ($length >= 120) {
        $skipped++;
        continue;
    }

    // Get product info
    $title = html_entity_decode($product->post_title);
    $title_clean = preg_replace('/\s*\|.*$/', '', $title); // Remove " | Mohawk Medibles"
    $title_clean = preg_replace('/\s*\*.*\*\s*/', ' ', $title_clean); // Remove *deal* markers
    $title_clean = trim($title_clean);

    // Get category
    $terms = get_the_terms($product->ID, 'product_cat');
    $category = '';
    $parent_category = '';
    if ($terms && !is_wp_error($terms)) {
        $category = strtolower($terms[0]->name);
        if ($terms[0]->parent) {
            $parent = get_term($terms[0]->parent, 'product_cat');
            if ($parent) {
                $parent_category = strtolower($parent->name);
            }
        }
    }

    // Determine template based on category and product name
    $template = '';
    $title_lower = strtolower($title);

    // Match category to template
    if (strpos($category, 'flower') !== false || $parent_category == 'flower') {
        if (strpos($title_lower, 'deal') !== false || strpos($title_lower, '$') !== false) {
            $template = $templates['flower']['deal'];
        } elseif (strpos($title_lower, 'quad') !== false || strpos($title_lower, 'aaaa') !== false) {
            $template = $templates['flower']['quads'];
        } else {
            $template = $templates['flower']['default'];
        }
    } elseif (strpos($category, 'hash') !== false || strpos($title_lower, 'hash') !== false) {
        $template = $templates['concentrates']['hash'];
    } elseif (strpos($category, 'shatter') !== false || strpos($title_lower, 'shatter') !== false) {
        $template = $templates['concentrates']['shatter'];
    } elseif (strpos($category, 'wax') !== false || strpos($title_lower, 'wax') !== false) {
        $template = $templates['concentrates']['wax'];
    } elseif (strpos($title_lower, 'rso') !== false) {
        $template = $templates['concentrates']['rso'];
    } elseif (strpos($category, 'concentrates') !== false || $parent_category == 'concentrates') {
        $template = $templates['concentrates']['default'];
    } elseif (strpos($category, 'gummies') !== false || strpos($title_lower, 'gummies') !== false || strpos($title_lower, 'gummy') !== false) {
        $template = $templates['edibles']['gummies'];
    } elseif (strpos($category, 'chocolate') !== false || strpos($title_lower, 'chocolate') !== false) {
        $template = $templates['edibles']['chocolate'];
    } elseif (strpos($category, 'edibles') !== false || strpos($category, 'candy') !== false) {
        $template = $templates['edibles']['default'];
    } elseif (strpos($category, 'beverages') !== false || strpos($title_lower, 'tea') !== false) {
        if (strpos($title_lower, 'hot chocolate') !== false) {
            $template = $templates['beverages']['hot_chocolate'];
        } elseif (strpos($title_lower, 'tea') !== false) {
            $template = $templates['beverages']['tea'];
        } else {
            $template = $templates['beverages']['default'];
        }
    } elseif (strpos($category, 'disposable') !== false || strpos($title_lower, 'disposable') !== false) {
        $template = $templates['vapes']['disposable'];
    } elseif (strpos($category, 'cartridge') !== false || strpos($title_lower, 'cartridge') !== false || strpos($title_lower, 'cart') !== false) {
        $template = $templates['vapes']['cartridge'];
    } elseif (strpos($category, 'vape') !== false || strpos($title_lower, 'vape') !== false) {
        $template = $templates['vapes']['default'];
    } elseif (strpos($category, 'cbd') !== false) {
        if (strpos($title_lower, 'pet') !== false) {
            $template = $templates['cbd']['pet'];
        } elseif (strpos($title_lower, 'oil') !== false) {
            $template = $templates['cbd']['oil'];
        } else {
            $template = $templates['cbd']['default'];
        }
    } elseif (strpos($category, 'pre-roll') !== false || strpos($title_lower, 'pre-roll') !== false || strpos($title_lower, 'pre roll') !== false) {
        $template = $templates['pre-rolls']['default'];
    } elseif (strpos($category, 'nicotine') !== false) {
        if (strpos($title_lower, 'pouch') !== false) {
            $template = $templates['nicotine']['pouches'];
        } else {
            $template = $templates['nicotine']['vape'];
        }
    } elseif (strpos($category, 'batteries') !== false || strpos($title_lower, 'battery') !== false) {
        $template = $templates['accessories']['battery'];
    } elseif (strpos($category, 'papers') !== false || strpos($title_lower, 'paper') !== false || strpos($title_lower, 'cone') !== false) {
        $template = $templates['accessories']['papers'];
    } elseif (strpos($title_lower, 'cigar') !== false || strpos($title_lower, 'backwood') !== false || strpos($title_lower, 'wrap') !== false) {
        $template = $templates['accessories']['cigars'];
    } elseif (strpos($category, 'capsule') !== false || strpos($title_lower, 'capsule') !== false) {
        if (strpos($title_lower, 'cbd') !== false) {
            $template = $templates['capsules']['cbd'];
        } else {
            $template = $templates['capsules']['thc'];
        }
    } elseif (strpos($title_lower, 'tincture') !== false) {
        $template = $templates['tinctures']['default'];
    } elseif (strpos($title_lower, 'salve') !== false || strpos($title_lower, 'topical') !== false) {
        $template = $templates['topicals']['default'];
    } elseif (strpos($title_lower, 'hookah') !== false || strpos($title_lower, 'tobacco') !== false) {
        $template = 'Shop {product} at Mohawk Medibles Canada. Premium hookah tobacco with rich flavor. Quality selection. Fast discreet Canadian shipping. Order now!';
    } else {
        $template = $templates['default']['default'];
    }

    // Generate new meta description
    $new_meta = str_replace('{product}', $title_clean, $template);

    // Ensure length is within 140-160 chars
    if (strlen($new_meta) > 160) {
        // Trim intelligently
        $new_meta = substr($new_meta, 0, 157) . '...';
    }

    // Update meta description
    update_post_meta($product->ID, '_yoast_wpseo_metadesc', $new_meta);
    $updated++;

    // Show progress
    if ($updated <= 30) {
        echo "[{$product->ID}] {$title_clean}\n";
        echo "    OLD ({$length} chars): $meta_desc\n";
        echo "    NEW (" . strlen($new_meta) . " chars): $new_meta\n\n";
    } elseif ($updated % 25 == 0) {
        echo "... processed $updated products\n";
    }
}

echo "\n==============================================\n";
echo "COMPLETE\n";
echo "==============================================\n";
echo "Updated: $updated products\n";
echo "Skipped (already 120+ chars): $skipped products\n";
