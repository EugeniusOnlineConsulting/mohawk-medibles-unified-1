<?php
/**
 * GSC-Driven Category Page Optimization
 * ======================================
 * Fixes low-CTR category pages identified by GSC analysis
 *
 * Generated: 2026-01-02
 * Target: Improve category CTRs from <2% to 3-5%+
 *
 * Run with: wp eval-file gsc_category_optimization.php
 */

echo "═══════════════════════════════════════════════════════\n";
echo "  CATEGORY PAGE SEO OPTIMIZATION\n";
echo "  Based on Google Search Console Data\n";
echo "═══════════════════════════════════════════════════════\n\n";

$categories_to_fix = array(
    // CRITICAL: 124,764 impressions, 1.02% CTR
    'edibles' => array(
        'title' => 'THC Edibles | Gummies & Chocolates | Mohawk Medibles Canada',
        'meta' => 'Buy THC edibles online at Mohawk Medibles Canada. Gummies, chocolates, beverages & more. Precise dosing. Lab-tested. Fast discreet Canadian shipping.',
        'impressions' => 124764,
        'current_ctr' => 1.02
    ),
    // CRITICAL: 106,643 impressions, 0.34% CTR
    'flower' => array(
        'title' => 'Cannabis Flower | Premium Buds | Mohawk Medibles Canada',
        'meta' => 'Shop premium cannabis flower at Mohawk Medibles Canada. AAAA quality buds, indica, sativa & hybrid strains. Lab-tested. Fast discreet Canadian shipping.',
        'impressions' => 106643,
        'current_ctr' => 0.34
    ),
    // CRITICAL: 103,153 impressions, 1.36% CTR
    'vape' => array(
        'title' => 'THC Vapes | Disposables & Cartridges | Mohawk Medibles Canada',
        'meta' => 'Shop THC vape pens & cartridges at Mohawk Medibles Canada. Disposables, 510 carts, live resin options. Lab-tested. Fast discreet Canadian shipping.',
        'impressions' => 103153,
        'current_ctr' => 1.36
    ),
    // HIGH: 33,007 impressions, 0.08% CTR
    'nicotine' => array(
        'title' => 'Nicotine Vapes & Pouches | Zyn, Zolt & More | Mohawk Medibles',
        'meta' => 'Shop nicotine vapes and pouches at Mohawk Medibles Canada. Zyn, Zolt, Euro Zyn & premium nicotine products. Fast discreet Canadian shipping.',
        'impressions' => 33007,
        'current_ctr' => 0.08
    ),
    // HIGH: 27,960 impressions, 0.08% CTR
    'concentrates' => array(
        'title' => 'Cannabis Concentrates | Hash & Shatter | Mohawk Medibles Canada',
        'meta' => 'Buy cannabis concentrates at Mohawk Medibles Canada. Shatter, wax, hash, diamonds & more. Premium quality. Lab-tested. Fast discreet shipping.',
        'impressions' => 27960,
        'current_ctr' => 0.08
    ),
    // MEDIUM: 15,770 impressions
    'pre-rolls' => array(
        'title' => 'Pre-Rolls | Premium Cannabis Joints | Mohawk Medibles Canada',
        'meta' => 'Buy pre-rolled joints at Mohawk Medibles Canada. Premium cannabis pre-rolls, infused options available. Lab-tested. Fast discreet Canadian shipping.',
        'impressions' => 15770,
        'current_ctr' => 1.5
    ),
    // MEDIUM: 8,324 impressions
    'cbd' => array(
        'title' => 'CBD Products | Oils, Edibles & Topicals | Mohawk Medibles Canada',
        'meta' => 'Shop premium CBD products at Mohawk Medibles Canada. CBD oil, edibles, topicals for pets & humans. Lab-tested quality. Fast discreet shipping.',
        'impressions' => 8324,
        'current_ctr' => 0.5
    )
);

$updated = 0;
$failed = 0;

foreach ($categories_to_fix as $slug => $data) {
    echo "Processing: $slug\n";
    echo "  Current CTR: {$data['current_ctr']}% on {$data['impressions']} impressions\n";

    // Get the term
    $term = get_term_by('slug', $slug, 'product_cat');

    if (!$term) {
        echo "  ERROR: Category not found!\n\n";
        $failed++;
        continue;
    }

    // Get current meta
    $current_title = get_term_meta($term->term_id, '_yoast_wpseo_title', true);
    $current_meta = get_term_meta($term->term_id, '_yoast_wpseo_metadesc', true);

    echo "  Current Title: " . ($current_title ?: '[empty]') . "\n";
    echo "  Current Meta: " . ($current_meta ? substr($current_meta, 0, 60) . '...' : '[empty]') . "\n";

    // Update Yoast SEO meta
    update_term_meta($term->term_id, '_yoast_wpseo_title', $data['title']);
    update_term_meta($term->term_id, '_yoast_wpseo_metadesc', $data['meta']);

    // Verify update
    $new_title = get_term_meta($term->term_id, '_yoast_wpseo_title', true);
    $new_meta = get_term_meta($term->term_id, '_yoast_wpseo_metadesc', true);

    if ($new_title === $data['title'] && $new_meta === $data['meta']) {
        echo "  SUCCESS: Updated!\n";
        echo "  New Title: {$data['title']}\n";
        echo "  New Meta: " . substr($data['meta'], 0, 60) . "...\n";
        $updated++;
    } else {
        echo "  WARNING: Update may have failed\n";
        $failed++;
    }

    echo "\n";
}

echo "═══════════════════════════════════════════════════════\n";
echo "  COMPLETE\n";
echo "  Updated: $updated categories\n";
echo "  Failed: $failed categories\n";
echo "═══════════════════════════════════════════════════════\n";

// Calculate expected impact
$total_impressions = array_sum(array_column($categories_to_fix, 'impressions'));
$expected_additional_clicks = round($total_impressions * 0.02); // 2% CTR improvement estimate
echo "\nExpected Impact:\n";
echo "  Total impressions covered: " . number_format($total_impressions) . "\n";
echo "  Estimated additional clicks/month: " . number_format($expected_additional_clicks) . "\n";
