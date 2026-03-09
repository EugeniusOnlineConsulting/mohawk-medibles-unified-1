<?php
global $wpdb;

// Find slider tables
$tables = $wpdb->get_results("SHOW TABLES LIKE '%revslider%'");
echo "Revolution Slider Tables:\n";
foreach ($tables as $table) {
    $name = array_values((array)$table)[0];
    echo "- $name\n";
}

// Get sliders
$sliders = $wpdb->get_results("SELECT id, title, alias FROM {$wpdb->prefix}revslider_sliders");
echo "\nSliders:\n";
foreach ($sliders as $slider) {
    echo "ID: {$slider->id} | Title: {$slider->title} | Alias: {$slider->alias}\n";
}

// Find the Fluid Dynamics slider content
$fluid_slider = $wpdb->get_row("SELECT * FROM {$wpdb->prefix}revslider_sliders WHERE alias = 'Fluid-Dynamics-Effect-Showcase'");
if ($fluid_slider) {
    echo "\n\nFluid Dynamics Slider Found (ID: {$fluid_slider->id})\n";

    // Get slides
    $slides = $wpdb->get_results($wpdb->prepare(
        "SELECT id, slide_order, params, layers FROM {$wpdb->prefix}revslider_slides WHERE slider_id = %d",
        $fluid_slider->id
    ));

    foreach ($slides as $slide) {
        echo "\nSlide ID: {$slide->id}\n";
        $layers = json_decode($slide->layers, true);
        if ($layers) {
            foreach ($layers as $layer) {
                if (isset($layer['type']) && $layer['type'] == 'button') {
                    echo "  BUTTON FOUND:\n";
                    echo "  - Text: " . ($layer['text'] ?? 'N/A') . "\n";
                    echo "  - URL: " . ($layer['actions'][0]['action_link'] ?? $layer['link'] ?? 'N/A') . "\n";
                }
                // Also check for text layers that might be buttons
                if (isset($layer['text']) && stripos($layer['text'], 'shop') !== false) {
                    echo "  SHOP TEXT FOUND:\n";
                    echo "  - Text: " . $layer['text'] . "\n";
                    if (isset($layer['actions'])) {
                        echo "  - Actions: " . json_encode($layer['actions']) . "\n";
                    }
                }
            }
        }
    }
}
