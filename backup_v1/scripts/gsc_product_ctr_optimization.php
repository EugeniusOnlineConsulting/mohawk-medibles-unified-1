<?php
/**
 * GSC-Driven Product Page CTR Optimization
 * =========================================
 * Fixes high-impression, low-CTR product pages identified by GSC analysis
 *
 * Generated: 2026-01-02
 * Target: Improve CTR for pages ranking on page 1-2 but underperforming
 *
 * Run with: wp eval-file gsc_product_ctr_optimization.php
 */

echo "═══════════════════════════════════════════════════════\n";
echo "  PRODUCT PAGE CTR OPTIMIZATION\n";
echo "  Based on Google Search Console Data\n";
echo "═══════════════════════════════════════════════════════\n\n";

// Products with high impressions but low CTR relative to position
$products_to_fix = array(
    // Shop page - 108,862 impressions, 2.24% CTR at position 6.3 (should be 7%+)
    array(
        'type' => 'page',
        'slug' => 'shop',
        'title' => 'Shop Cannabis Products | Mohawk Medibles Canada',
        'meta' => 'Shop premium cannabis online at Mohawk Medibles Canada. Flower, edibles, vapes, concentrates & more. Indigenous-owned. Lab-tested. Fast discreet shipping.',
        'impressions' => 108862,
        'current_ctr' => 2.24,
        'position' => 6.3
    ),
    // Drizzle Factory - 49,967 impressions, 2.86% CTR at position 5.0 (should be 10%+)
    array(
        'type' => 'product',
        'slug' => 'drizzle-factory-thc-vape-pen-1-1g',
        'title' => 'Drizzle Factory THC Vape Pen 1.1g | Mohawk Medibles',
        'meta' => 'Buy Drizzle Factory THC vape pen online. 1.1g premium distillate, smooth hits, potent effects. Lab-tested. Fast discreet Canadian shipping from Mohawk Medibles.',
        'impressions' => 49967,
        'current_ctr' => 2.86,
        'position' => 5.0
    ),
    // Backwoods - 43,441 impressions, 2.05% CTR at position 9.5 (should be 7%+)
    array(
        'type' => 'product',
        'slug' => 'backwoods-cigar',
        'title' => 'Backwoods Cigars | All Flavours | Mohawk Medibles Canada',
        'meta' => 'Buy Backwoods cigars online in Canada. All flavours available - Honey, Sweet Aromatic, Russian Cream & more. Fast discreet Canadian shipping from Mohawk Medibles.',
        'impressions' => 43441,
        'current_ctr' => 2.05,
        'position' => 9.5
    ),
    // Zolt Pouches - 35,475 impressions, 3.00% CTR at position 7.8 (should be 7%+)
    array(
        'type' => 'product',
        'slug' => 'zolt-pouches',
        'title' => 'Zolt Nicotine Pouches 8mg & 15mg | Mohawk Medibles Canada',
        'meta' => 'Buy Zolt nicotine pouches online in Canada. Available in 8mg and 15mg strengths. Multiple flavours. Fast discreet Canadian shipping from Mohawk Medibles.',
        'impressions' => 35475,
        'current_ctr' => 3.00,
        'position' => 7.8
    ),
    // Straight Goods Dual Chamber - 32,848 impressions, 3.47% CTR at position 8.1
    array(
        'type' => 'product',
        'slug' => 'straight-goods-dual-chamber-vape-6-gram',
        'title' => 'Straight Goods Dual Chamber Vape 6g | Mohawk Medibles',
        'meta' => 'Buy Straight Goods 6g dual chamber vape online. Two flavours in one pen. Premium THC distillate. Lab-tested. Fast discreet Canadian shipping from Mohawk Medibles.',
        'impressions' => 32848,
        'current_ctr' => 3.47,
        'position' => 8.1
    ),
    // Gas Gang 2g - 70,863 impressions, 6.1% CTR at position 5.4 (could be higher)
    array(
        'type' => 'product',
        'slug' => 'gas-gang-2g-disposable',
        'title' => 'Gas Gang 2g Disposable THC Vape | Mohawk Medibles Canada',
        'meta' => 'Buy Gas Gang 2g disposable vape online. Premium THC distillate, multiple strains available. Lab-tested potency. Fast discreet Canadian shipping.',
        'impressions' => 70863,
        'current_ctr' => 6.1,
        'position' => 5.4
    ),
    // Diamond Concentrates 2g - 147,759 impressions, 2.06% CTR at position 21.4 (needs position help)
    array(
        'type' => 'product',
        'slug' => 'diamond-concentrates-2-gram-thc-vape-pen',
        'title' => 'Diamond Concentrates 2g THC Vape Pen | Mohawk Medibles',
        'meta' => 'Buy Diamond Concentrates 2g THC vape pen online. Premium distillate, smooth hits. Lab-tested quality. Fast discreet Canadian shipping from Mohawk Medibles.',
        'impressions' => 147759,
        'current_ctr' => 2.06,
        'position' => 21.4
    ),
    // Heisenberg 6g - 47,030 impressions, 11.84% CTR at position 5.9 (already good but can improve)
    array(
        'type' => 'product',
        'slug' => 'heisenberg-extractions-dual-flavour-pen-6g',
        'title' => 'Heisenberg Extractions 6g Dual Flavour Pen | Mohawk Medibles',
        'meta' => 'Buy Heisenberg Extractions 6g dual flavour vape pen. Live resin & distillate blend. Premium quality. Lab-tested. Fast discreet Canadian shipping.',
        'impressions' => 47030,
        'current_ctr' => 11.84,
        'position' => 5.9
    ),
    // Cactus Labs Glock 9 - 21,947 impressions, 3.37% CTR at position 7.7
    array(
        'type' => 'product',
        'slug' => 'cactus-labs-glock-9-thc-liquid-diamond-vape-pen',
        'title' => 'Cactus Labs Glock 9 THC Diamond Vape | Mohawk Medibles',
        'meta' => 'Buy Cactus Labs Glock 9 liquid diamond vape pen online. Premium THC diamonds, potent effects. Lab-tested. Fast discreet Canadian shipping from Mohawk Medibles.',
        'impressions' => 21947,
        'current_ctr' => 3.37,
        'position' => 7.7
    ),
    // Left Coast Gummy - 9,937 impressions, 16.85% CTR at position 4.7 (already great)
    array(
        'type' => 'product',
        'slug' => 'left-coast-gummy-co',
        'title' => 'Left Coast Gummy Co THC Gummies | Mohawk Medibles Canada',
        'meta' => 'Buy Left Coast Gummy Co THC gummies online. Premium cannabis gummies with precise dosing. Lab-tested. Fast discreet Canadian shipping from Mohawk Medibles.',
        'impressions' => 9937,
        'current_ctr' => 16.85,
        'position' => 4.7
    )
);

$updated = 0;
$failed = 0;

foreach ($products_to_fix as $item) {
    $slug = $item['slug'];
    $type = $item['type'];

    echo "Processing: $slug ({$type})\n";
    echo "  Impressions: " . number_format($item['impressions']) . " | CTR: {$item['current_ctr']}% | Position: {$item['position']}\n";

    if ($type === 'page') {
        // Handle pages
        $post = get_page_by_path($slug);
        if (!$post) {
            // Try as slug
            $posts = get_posts(array(
                'name' => $slug,
                'post_type' => 'page',
                'posts_per_page' => 1
            ));
            $post = !empty($posts) ? $posts[0] : null;
        }
    } else {
        // Handle products
        $posts = get_posts(array(
            'post_type' => 'product',
            'name' => $slug,
            'posts_per_page' => 1
        ));
        $post = !empty($posts) ? $posts[0] : null;
    }

    if (!$post) {
        // Try alternative slugs
        $alt_slugs = array(
            str_replace('-', '', $slug),
            str_replace('_', '-', $slug)
        );

        foreach ($alt_slugs as $alt) {
            $posts = get_posts(array(
                'post_type' => $type === 'page' ? 'page' : 'product',
                'name' => $alt,
                'posts_per_page' => 1
            ));
            if (!empty($posts)) {
                $post = $posts[0];
                break;
            }
        }
    }

    if (!$post) {
        echo "  ERROR: Not found!\n\n";
        $failed++;
        continue;
    }

    // Get current meta
    $current_title = get_post_meta($post->ID, '_yoast_wpseo_title', true);
    $current_meta = get_post_meta($post->ID, '_yoast_wpseo_metadesc', true);

    echo "  Found: [{$post->ID}] {$post->post_title}\n";
    echo "  Current Meta Length: " . strlen($current_meta) . " chars\n";

    // Only update if meta is short or empty
    if (strlen($current_meta) < 120 || empty($current_meta)) {
        update_post_meta($post->ID, '_yoast_wpseo_title', $item['title']);
        update_post_meta($post->ID, '_yoast_wpseo_metadesc', $item['meta']);

        echo "  SUCCESS: Updated meta description\n";
        echo "  New Title: {$item['title']}\n";
        echo "  New Meta: " . substr($item['meta'], 0, 60) . "...\n";
        $updated++;
    } else {
        echo "  SKIPPED: Meta already optimized ({$current_meta}...)\n";
    }

    echo "\n";
}

echo "═══════════════════════════════════════════════════════\n";
echo "  COMPLETE\n";
echo "  Updated: $updated products/pages\n";
echo "  Skipped/Failed: $failed\n";
echo "═══════════════════════════════════════════════════════\n";

// Calculate expected impact
$total_impressions = array_sum(array_column($products_to_fix, 'impressions'));
$expected_additional_clicks = round($total_impressions * 0.02); // 2% CTR improvement estimate
echo "\nExpected Impact:\n";
echo "  Total impressions covered: " . number_format($total_impressions) . "\n";
echo "  Estimated additional clicks/month: " . number_format($expected_additional_clicks) . "\n";
