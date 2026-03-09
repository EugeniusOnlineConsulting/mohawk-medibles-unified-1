<?php
/**
 * Fix broken concatenated URL in Revolution Slider
 */

global $wpdb;

$slide_id = 233;

// Get current slide data
$slide = $wpdb->get_row($wpdb->prepare(
    "SELECT id, layers FROM {$wpdb->prefix}revslider_slides WHERE id = %d",
    $slide_id
));

if (!$slide) {
    echo "Slide $slide_id not found!\n";
    exit;
}

echo "=== Checking Slide ID: $slide_id ===\n\n";

$layers = $slide->layers;

// Find the problematic patterns
$broken_patterns = array(
    '/%20%20%20https:\/\/mohawkmedibles\.ca/',
    '/\s{2,}https:\/\/mohawkmedibles\.ca/',
    '/mohawkmedibles\.ca\/\s+https:/',
);

// Check what's in there
if (strpos($layers, 'dispensary-near-me') !== false) {
    echo "Found 'dispensary-near-me' reference\n";
}
if (strpos($layers, 'thca-diamonds') !== false) {
    echo "Found 'thca-diamonds' reference\n";
}

// Decode and search for the issue
$decoded = json_decode($layers, true);
$found_issues = array();

function search_array($array, $path = '') {
    global $found_issues;
    foreach ($array as $key => $value) {
        $current_path = $path . '/' . $key;
        if (is_array($value)) {
            search_array($value, $current_path);
        } elseif (is_string($value)) {
            // Look for concatenated URLs or spaces before https
            if (preg_match('/https?:\/\/.*\s+https?:\/\//', $value) ||
                preg_match('/%20.*https/', $value) ||
                preg_match('/\.ca\/\s+/', $value)) {
                $found_issues[] = array(
                    'path' => $current_path,
                    'value' => $value
                );
            }
        }
    }
}

if ($decoded) {
    search_array($decoded);
}

if (count($found_issues) > 0) {
    echo "\nFOUND BROKEN LINKS:\n";
    echo "-------------------\n";
    foreach ($found_issues as $issue) {
        echo "Path: {$issue['path']}\n";
        echo "Value: " . substr($issue['value'], 0, 200) . "...\n\n";
    }
} else {
    echo "\nNo obviously broken concatenated URLs found in decoded JSON.\n";
    echo "Checking raw content...\n\n";

    // Check raw content for any URL issues
    preg_match_all('/https:\/\/mohawkmedibles\.ca\/[^\s"<>]+/', $layers, $matches);
    echo "URLs found in slide:\n";
    foreach (array_unique($matches[0]) as $url) {
        echo "  $url\n";
    }
}

// Show layer structure for manual inspection
echo "\n\nLAYER TYPES IN SLIDE:\n";
if ($decoded) {
    foreach ($decoded as $idx => $layer) {
        $type = $layer['type'] ?? 'unknown';
        $text = isset($layer['text']) ? substr($layer['text'], 0, 50) : '';
        echo "  [$idx] Type: $type";
        if ($text) echo " - Text: $text";
        echo "\n";
    }
}
