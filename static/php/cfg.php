<?php
    $env = "test"; // test | prod
    $company = "membranaphoto";

    if ($env === "test") {
        $key = "";
        $gatewayUrl = "https://gateway.test.idnow.de/api/v1/$company";
        $goUrl = "https://go.test.idnow.de/$company";
    } else if ($env === "prod") {
        $key = "";
        $gatewayUrl = "https://gateway.idnow.de/api/v1/$company";
        $goUrl = "https://go.idnow.de/$company";
    }
?>