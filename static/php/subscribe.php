<?php
$apiKey = '';
$listId = "";

$authToken = 'Basic ' . $apiKey;
$postData = array(
    'email_address' => $_POST['email'],
    'status' => 'subscribed'
);

$ch = curl_init('https://us12.api.mailchimp.com/3.0/lists/'. $listId .'/members');
curl_setopt_array($ch, array(
    CURLOPT_POST => TRUE,
    CURLOPT_RETURNTRANSFER => TRUE,
    CURLOPT_HTTPHEADER => array(
        'Authorization: '.$authToken,
        'Content-Type: application/json'
    ),
    CURLOPT_POSTFIELDS => json_encode($postData)
));

$response = curl_exec($ch);

if($response === FALSE){
    die(curl_error($ch));
}

$responseData = json_decode($response, TRUE);

if ($responseData['status'] == '400') {
    echo 'You are already subscribed';
} else {
    echo 'You have been successfully subscribed';
}