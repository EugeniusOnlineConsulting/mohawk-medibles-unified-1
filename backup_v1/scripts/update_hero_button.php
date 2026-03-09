<?php
global $wpdb;

$slide_id = 214;
$new_url = 'https://mohawkmedibles.ca/mohawk-medibles-deseronto-online-shop/';
$new_text = 'SHOP ALL PRODUCTS';

// Get current slide data
$slide = $wpdb->get_row($wpdb->prepare(
    "SELECT id, layers FROM {$wpdb->prefix}revslider_slides WHERE id = %d",
    $slide_id
));

if (!$slide) {
    echo "Slide not found!\n";
    exit;
}

$layers = json_decode($slide->layers, true);
$updated = false;

foreach ($layers as &$layer) {
    // Find the shop button layer
    if (isset($layer['text']) && stripos($layer['text'], 'SHOP CANNABIS') !== false) {
        echo "Found button layer:\n";
        echo "  OLD Text: " . $layer['text'] . "\n";
        echo "  OLD URL: " . ($layer['actions']['action'][0]['image_link'] ?? 'N/A') . "\n";

        // Update text
        $layer['text'] = $new_text;

        // Update URL in actions
        if (isset($layer['actions']['action'])) {
            foreach ($layer['actions']['action'] as &$action) {
                if (isset($action['image_link'])) {
                    $action['image_link'] = $new_url;
                }
                if (isset($action['link'])) {
                    $action['link'] = $new_url;
                }
            }
        }

        echo "\n  NEW Text: " . $layer['text'] . "\n";
        echo "  NEW URL: " . $new_url . "\n";

        $updated = true;
    }
}

if ($updated) {
    // Save updated layers
    $result = $wpdb->update(
        $wpdb->prefix . 'revslider_slides',
        array('layers' => json_encode($layers)),
        array('id' => $slide_id)
    );

    if ($result !== false) {
        echo "\n✅ Hero button updated successfully!\n";

        // Clear Revolution Slider cache
        if (class_exists('RevSliderSlider')) {
            $slider = new RevSliderSlider();
            $slider->initByID(56);
            // Clear caches
        }

        // Clear WP cache
        wp_cache_flush();
        echo "Cache cleared.\n";
    } else {
        echo "\n❌ Failed to update slide.\n";
    }
} else {
    echo "Button layer not found in slide.\n";
}
