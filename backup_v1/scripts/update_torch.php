<?php
$content = file_get_contents("/sites/mohawkmedibstg/_wpeprivate/torch_new.html");
$result = wp_update_post(array(
    "ID" => 87442,
    "post_content" => $content
));
echo $result > 0 ? "Success: Updated post " . $result : "Error updating post";
