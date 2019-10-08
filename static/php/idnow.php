<?php
    require_once "cfg.php";

    if (isset($_POST["email"]) && isset($_POST["trnum"])) {

        $trnum = $_POST["trnum"];
        $url = "$gatewayUrl/identifications/$trnum/start";
        $data = "{\"email\": \"".$_POST["email"]."\"}";
        var_dump($data);
        #$data = "{}";
    
        // use key 'http' even if you send the request to https://...
        $options = array(
            "http" => array(
                "header"  => array(
                    "X-API-KEY: $key",
                    "Content-type: application/json",
                ),
                "method"  => "POST",
                "content" => $data
            )
        );
        $context  = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        if ($result === FALSE) { echo "Error!<br>"; }
        
        #var_dump($http_response_header);
        #var_dump($result);
    
        header("Location: $goUrl/identifications/".$_POST['trnum']);
    }

?>