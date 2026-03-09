<?php
global $wpdb;

$slide = $wpdb->get_row("SELECT layers FROM {$wpdb->prefix}revslider_slides WHERE id = 214");
$layers = json_decode($slide->layers, true);

foreach ($layers as $layer) {
    if (isset($layer['text']) && stripos($layer['text'], 'SHOP') !== false) {
        echo "Button Text: " . $layer['text'] . "\n";
        if (isset($layer['actions']['action'][0]['image_link'])) {
            echo "Button URL: " . $layer['actions']['action'][0]['image_link'] . "\n";
        }
    }
}
