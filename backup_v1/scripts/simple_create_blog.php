<?php
$post_id = wp_insert_post(array(
    'post_title' => 'Find the Best Dispensary Near Me in Canada 2026 Guide',
    'post_content' => 'Test content',
    'post_status' => 'draft',
    'post_type' => 'post',
    'post_author' => 1
));
echo "Created post ID: " . $post_id;
