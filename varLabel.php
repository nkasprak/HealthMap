<?php
$code = preg_replace("/[^A-Za-z0-9]_/", '',$_GET["code"]) . "E";
$year = preg_replace("/[^0-9]/", '',$_GET["year"]);
$universe = $_GET["u"] == "p" ? "profile" : "summary";
$file = "/".$universe.$year.".json";

$variables = json_decode(file_get_contents(__DIR__ . $file))->variables;

if (array_key_exists($code,$variables)) {
	echo $variables->$code->label;	
} else {
	echo "not found";	
}

$file = $file = "/".$universe.$year.".json";

?>
