<?php
/**
 * Verify all meta descriptions are now 120+ chars
 */

$products = get_posts(array(
    'post_type' => 'product',
    'post_status' => 'publish',
    'posts_per_page' => -1
));

$stats = array(
    'total' => count($products),
    'under_120' => 0,
    'between_120_140' => 0,
    'between_140_160' => 0,
    'over_160' => 0,
    'missing' => 0
);

$under_120 = array();

foreach ($products as $product) {
    $meta = get_post_meta($product->ID, '_yoast_wpseo_metadesc', true);
    $length = strlen($meta);

    if (empty($meta)) {
        $stats['missing']++;
    } elseif ($length < 120) {
        $stats['under_120']++;
        $under_120[] = array(
            'id' => $product->ID,
            'title' => $product->post_title,
            'length' => $length,
            'meta' => $meta
        );
    } elseif ($length <= 140) {
        $stats['between_120_140']++;
    } elseif ($length <= 160) {
        $stats['between_140_160']++;
    } else {
        $stats['over_160']++;
    }
}

echo "===========================================\n";
echo "META DESCRIPTION LENGTH VERIFICATION\n";
echo "===========================================\n\n";

echo "Total Products: {$stats['total']}\n\n";

echo "LENGTH DISTRIBUTION:\n";
echo "-------------------\n";
echo "Missing:         {$stats['missing']}\n";
echo "Under 120 chars: {$stats['under_120']}\n";
echo "120-140 chars:   {$stats['between_120_140']}\n";
echo "140-160 chars:   {$stats['between_140_160']} (optimal)\n";
echo "Over 160 chars:  {$stats['over_160']}\n\n";

$optimal = $stats['between_120_140'] + $stats['between_140_160'];
$percent = round(($optimal / $stats['total']) * 100, 1);
echo "Optimal Range (120-160): $optimal products ($percent%)\n\n";

if (count($under_120) > 0) {
    echo "PRODUCTS STILL UNDER 120 CHARS:\n";
    echo "-------------------------------\n";
    foreach ($under_120 as $p) {
        echo "[{$p['id']}] {$p['title']} ({$p['length']} chars)\n";
        echo "    {$p['meta']}\n\n";
    }
}

echo "===========================================\n";
if ($stats['under_120'] == 0 && $stats['missing'] == 0) {
    echo "✅ ALL PRODUCTS HAVE PROPER META DESCRIPTIONS!\n";
} else {
    echo "⚠️ Some products still need attention\n";
}
echo "===========================================\n";
