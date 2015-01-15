<?php

$universe = $_GET["universe"];
$year = $_GET["year"];
$file = "\\".$universe.$year.".json";
$cleanedSearch = preg_replace("/[^A-Za-z0-9 ]/", '', $_GET["search"]);
$search = explode(" ",$cleanedSearch);
$variables = json_decode(file_get_contents(__DIR__ . $file))->variables;
$output = array();
$i=0;
function strContains($str1, $str2) {
	$str1 = strtolower(str_replace(' ','',$str1));
	$str2 = strtolower(str_replace(' ','',$str2));
	
	//echo $str1 . " | " . $str2 . "\n";
	
	if (strpos($str1, $str2) !== false) return true;
	else return false;
}


foreach ($variables as $key=>$variable) {
	$i++;
	$add = true;
	if (substr($key, -1)=="E") {
		foreach ($search as $word) {
			if (!(strContains($variable->label,$word) || strContains($variable->concept,$word))) {
				$add = false;
			}
		}
		if ($add == true) $output[substr($key,0,-1)] = $variable;
	}
	//if ($i>100) break;
};
header('Content-Type: application/json');
echo json_encode($output, JSON_PRETTY_PRINT);


?>