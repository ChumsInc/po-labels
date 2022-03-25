<?php


/**
 * @package Chums
 * @subpackage ProjectedDemands
 * @author Steve Montgomery
 * @copyright Copyright &copy; 2013, steve
 */

require_once ("autoload.inc.php");
require_once iUI::ACCESS_FILE;

$bodyPath = "reports/purchasing/po/labels/";
$title = "PO Labels";
$description = "";

$ui = new WebUI($bodyPath, $title, $description);
$ui->version = "2017-08-23";
$ui->bodyClassName = 'container-fluid';
$ui->AddCSS("public/styles.css?v={$ui->version}");
$ui->addManifest("public/js/manifest.json");
/**
 * Changelog:
 *
 * 7/6/2017 - initial release
 * 8/23/2017 - fix bug where selecting all to gen labels includes non-selected dates.
 *
 */


$ui->Send();
