<?php
/**
 * Add .htaccess redirect rules for old URL patterns
 * This catches any URLs we might have missed
 */

$htaccess_path = ABSPATH . '.htaccess';
$current = file_get_contents($htaccess_path);

// Check if our rules already exist
if (strpos($current, '# Mohawk Medibles URL Cleanup Redirects') !== false) {
    echo "Redirect rules already exist in .htaccess\n";
    return;
}

$redirect_rules = '
# Mohawk Medibles URL Cleanup Redirects - Added ' . date('Y-m-d') . '
# Redirect old "buy-" prefix URLs to clean URLs

# Remove "buy-" prefix from product URLs
RewriteCond %{REQUEST_URI} ^/shop/(.+)/buy-(.+)$ [NC]
RewriteRule ^shop/(.+)/buy-(.+)$ /shop/$1/$2 [R=301,L]

# End Mohawk Medibles URL Cleanup Redirects

';

// Find the position after "RewriteEngine On"
$position = strpos($current, 'RewriteEngine On');
if ($position !== false) {
    $end_of_line = strpos($current, "\n", $position);
    $new_htaccess = substr($current, 0, $end_of_line + 1) . $redirect_rules . substr($current, $end_of_line + 1);
} else {
    // Add at the beginning if no RewriteEngine found
    $new_htaccess = $redirect_rules . $current;
}

// Backup current .htaccess
file_put_contents($htaccess_path . '.backup-' . date('Ymd-His'), $current);

// Write new .htaccess
file_put_contents($htaccess_path, $new_htaccess);

echo ".htaccess updated with redirect rules\n";
echo "Backup created at: .htaccess.backup-" . date('Ymd-His') . "\n";
