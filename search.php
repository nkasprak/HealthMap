<?php

$year = preg_replace("/[^0-9]/", '',$_GET["year"]);
$universe = $_GET["universe"] == "profile" ? "profile" : "summary";
$file = "/".$universe.$year.".json";
$cleanedSearch = preg_replace("/[^A-Za-z0-9 _]/", '', $_GET["search"]);
$search = explode(" ",$cleanedSearch);
$variables = json_decode(file_get_contents(__DIR__ . $file))->variables;
$output = array();
$i=0;
function strContains($str1, $str2) {
	$str1 = strtolower(str_replace(' ','',$str1));
	$str2 = strtolower(str_replace(' ','',$str2));
	if (strpos($str1, $str2) !== false) return true;
	else return false;
}


foreach ($variables as $key=>$variable) {
	$i++;
	$add = true;
	if (substr($key, -1)=="E" && substr($key, -2)!="PE") {
		foreach ($search as $word) {
			if (!(strContains($variable->label,$word) || strContains($variable->concept,$word) || strContains($key,$word))) {
				$add = false;
			}
		}
		if ($add == true) $output[substr($key,0,-1)] = $variable;
	}
	//if ($i>100) break;
};

ksort($output);

header('Content-Type: application/json');
echo json_encode($output, 128);


?>