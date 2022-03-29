<?php


/**
 * @package Chums
 * @subpackage ProjectedDemands
 * @author Steve Montgomery
 * @copyright Copyright &copy; 2013, steve
 */

require_once ("autoload.inc.php");
require_once iUI::ACCESS_FILE;

$bodyPath = "apps/po-labels/";
$title = "PO Labels";
$description = "";

$ui = new WebUI($bodyPath, $title, $description, true, 5);
$ui->bodyClassName = 'container-fluid';
$ui->AddCSS("public/styles.css", true);
$ui->addManifest("public/js/manifest.json");

$ui->Send();
