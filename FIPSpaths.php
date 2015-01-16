<?php

$mapDOM = new DOMDocument;
$mapDOM->Load('USA_Counties_with_FIPS_and_names.svg');

$toReturn = array();
foreach ($mapDOM->getElementsByTagName('path') as $element) {
	$attr = $element->attributes;
	$path = $attr->getNamedItem('d')->value;
	$id = $attr->getNamedItem('id')->value;
	if (!in_array($id,array("State_Lines","separator"))) array_push($toReturn,array("FIPS"=>$id,"path"=>$path));
};



header('Content-Type: text/json');
echo json_encode($toReturn, 128);


?>