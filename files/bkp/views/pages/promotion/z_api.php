

<?php

//https://www.globalpay.com.gh/paymentapi/Service/PaySecure?GPID=GPZEN084&tid=20220408165032
// Sample PHP GlobalPAY integration
//
$response="";
$GPID = "GPZEN084";//GlobalPAY ID. input with test id for test //sample data.

//$GPID = "GPZEN2019121511131";
$data = array(
'GPID' => $GPID,
'amount' => '0.01',//transaction Amount. Must be a double Value 
'desc' =>'transcript',//transactionDescription
'referenceID' => 'zen00009090',//Transaction Reference. must be unique for every payment 
'ProductID' => 't001',//Optional
'CustomerID' =>'ed/bps/08/0001',//Optional
'merchantlogo' => 'test',//link to merchant logo
'merchantName' => 'University of Cape Coast',//Custom display name on payment page. Optional 
'currency'=>'GHS'//Payment Currency
);
//set payment request url
$url = "https://www.globalpay.com.gh/paymentapi/Service/SecurePaymentRequest"; //init and set curl options
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);//enable post
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//enable response
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));//add parameters 
 $response=$server_output = curl_exec ($ch);//execute request and get response
// further processing ....
curl_errno($ch);
/*
		if(curl_errno($ch)) {

} else {
//something went wrong
//echo $response = $server_output;//get response. This is the transaction ID
}
*/
curl_close ($ch);//close curl
//form redirect url and redirect customer for payment If(response.lenth()<15)

$paymentURL = " https://www.globalpay.com.gh/paymentapi/Service/PaySecure?GPID=".$GPID."&tid=".$response; 
header( "Location: ".$paymentURL);//redirect to payment page
//exit;
?>																	  ?>

