<?php
global $wpdb;
$results = $wpdb->get_results("SELECT ID, post_title, post_name FROM {$wpdb->posts} WHERE post_title LIKE '%THCA%' AND post_type='product' LIMIT 10");
foreach($results as $p) {
    echo $p->ID . " | " . $p->post_title . " | " . $p->post_name . "\n";
}
