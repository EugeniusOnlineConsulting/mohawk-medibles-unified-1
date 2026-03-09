<?php
// Fix duplicate alt text for STRAIGHT GOODS vape images
$images_to_fix = array(
    88084 => "STRAIGHT GOODS Tropical Melon 3G Disposable THC Vape | Mohawk Medibles",
    88083 => "STRAIGHT GOODS Super Sour Diesel 3G Disposable THC Vape | Mohawk Medibles",
    88082 => "STRAIGHT GOODS Rockstar 3G Disposable THC Vape | Mohawk Medibles",
    88081 => "STRAIGHT GOODS Rocket Pop 3G Disposable THC Vape | Mohawk Medibles",
    88080 => "STRAIGHT GOODS Red Lebanese Hash 3G Disposable THC Vape | Mohawk Medibles",
    88079 => "STRAIGHT GOODS Optimus Prime 3G Disposable THC Vape | Mohawk Medibles",
    88078 => "STRAIGHT GOODS Moroccan Hash 3G Disposable THC Vape | Mohawk Medibles",
    88077 => "STRAIGHT GOODS Maui Wowie 3G Disposable THC Vape | Mohawk Medibles",
    88076 => "STRAIGHT GOODS Grape Ice 3G Disposable THC Vape | Mohawk Medibles",
    88075 => "STRAIGHT GOODS Godfather OG 3G Disposable THC Vape | Mohawk Medibles",
    88074 => "STRAIGHT GOODS Gas Mask 3G Disposable THC Vape | Mohawk Medibles"
);

$updated = 0;
foreach ($images_to_fix as $image_id => $alt_text) {
    $result = update_post_meta($image_id, '_wp_attachment_image_alt', $alt_text);
    if ($result) {
        $updated++;
        echo "Updated image $image_id: $alt_text\n";
    } else {
        // Check if value already exists
        $existing = get_post_meta($image_id, '_wp_attachment_image_alt', true);
        if ($existing === $alt_text) {
            echo "Already set image $image_id\n";
        } else {
            echo "Failed to update image $image_id\n";
        }
    }
}

echo "\nTotal updated: $updated of " . count($images_to_fix) . " images\n";
