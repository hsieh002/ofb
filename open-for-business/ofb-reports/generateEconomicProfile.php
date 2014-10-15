<?php
/**
 * generateEconomicProfile.php
 *
 * @author Mel Hsieh
 */
  // Includes
  include('./func_reports.php');

  // Initialize
  $naicsId="";
  $countyId="";
  $fileFormat="html";	// "html", "rtf"
  $templateFile="";
  $fileExtension="";
  $tstamp="";
  $filename="";
  $fileContent="";
  $EMPTY_DATA_STRING="[No data found]";
  $SUPPRESSED_VALUE1="D";
  $SUPPRESSED_VALUE2="N/A";
  $year="2012";
  $yearCBP="2012";	// "2011", "2012"

  // Tokens
  $naicsDesc="";
  $countyName="";
  $coPopulation="";
  $pctPopUnder18="";
  $pctPop65="";
  $medianHHIncome="";
  $pctPop25HS="";
  $pctPop25BS="";
  $sourceNamePopulation="2012 American Community Survey";
  $numBusinesses="";
  $numEmployees="";
  $totalAnnualPayroll="";
  $avgNumEmployees="";
  $avgAnnualPayroll="";
  $avgNumCustomersServed="";
  $numBusinesses2="";
  $numEmployees2="";
  $totalAnnualPayroll2="";
  $avgAnnualPayroll2="";
  $totalReceipts2="";
  $totalRevenue2="";
  $revenuePerEmployee="";
  $sourceNameCompetitors="2012 County Business Patterns and 2007 Economic Census";
  $numICs="";
  $totalICRevenue="";
  $avgICRev="";
  $sourceNameNonemployerStats="2012 Nonemployer Statistics";
  $naicsDesc2="";
  $naicsCode2="";
  $numPotentialSuppliers="";
  $numSupplierEmployees="";
  $avgPayrollSuppliers="";
  $sourceNameSuppliers="2012 County Business Patterns";

  // GET variables
  if (!empty($_GET["naicsId"]))
    $naicsId=$_GET["naicsId"];
  else
    die("Please provide a NAICS code.");
  if (!empty($_GET["countyId"]))
    $countyId=$_GET["countyId"];
  else
    die("Please provide a County ID.");
  if (!empty($_GET["fileFormat"]))
    $fileFormat=$_GET["fileFormat"];

  // ***************
  // Ingest template
  // ***************
  $templateFile="Economic_Profile.template.".$fileFormat;
  $tstamp=getSequenceId();
  if ($fileFormat=="rtf")
    $fileExtension="doc";
  else if ($fileFormat=="html")
    $fileExtension="html";
  $filename="Economic_Profile.".$tstamp.".".$fileExtension;
  $fileContent=file_get_contents($templateFile);


  // ********
  // Get data
  // ********
  $countyCode=substr($countyId, 2, 3);
  $stateCode=substr($countyId, 0, 2);
  //$naicsDesc=getNAICSDesc(convertNAICS2007to2012($naicsId));
  $naicsDesc=getNAICSDesc($naicsId);

  // ACS
  $jsonACS=getACSJSON($countyCode, $stateCode);
  $jsonObjACS=json_decode($jsonACS);
  $countyName=getCountyNameFromJSON($jsonObjACS);
  $_coPopulation=getCountyPopulationFromJSON($jsonObjACS); $coPopulation=number_format($_coPopulation, 0, '.', ',');
  $_medianHHIncome=getMedianHHIncomeFromJSON($jsonObjACS); $medianHHIncome="$".number_format($_medianHHIncome, 0, '.', ',');

  // ACS Profile
  $jsonACSProfile=getACSPROFILEJSON($countyCode, $stateCode);
  $jsonObjACSProfile=json_decode($jsonACSProfile);
  $pctPopUnder18=getPercentagePopulationFromJSON($jsonObjACSProfile, 0);
  $pctPop65=getPercentagePopulationFromJSON($jsonObjACSProfile, 1);
  $pctPop25HS=getPercentagePopulationFromJSON($jsonObjACSProfile, 2);
  $pctPop25BS=getPercentagePopulationFromJSON($jsonObjACSProfile, 3);

  // CBP
  $jsonCBP=getCBPJSON($yearCBP, $naicsId, $countyCode, $stateCode);
  //$jsonCBP=getCBP2012JSON($naicsId, $countyCode, $stateCode);

  $jsonObjCBP=json_decode($jsonCBP);
  $_numBusinesses=getNumBusinessesFromJSON($jsonObjCBP); $numBusinesses=number_format($_numBusinesses, 0, '.', ',');
  $_numEmployees=getNumEmployeesFromJSON($jsonObjCBP); $numEmployees=number_format($_numEmployees, 0, '.', ',');
  $numEmployeesCode=getNumEmployeesCodeValue(getNumEmployeesCodeFromJSON($jsonObjCBP));
  $_totalAnnualPayroll=getAnnualPayrollFromJSON($jsonObjCBP); $totalAnnualPayroll="$".number_format(($_totalAnnualPayroll/1000), 1, '.', ',')."M";
  $avgNumEmployees=number_format(($_numEmployees/$_numBusinesses), 0, '.', ',');
  $avgAnnualPayroll="$".number_format(($_totalAnnualPayroll*1000)/$_numEmployees, 0, '.', ',');
  $avgNumCustomersServed=number_format(($_coPopulation/$_numBusinesses), 0, '.', ',');

  // EWKS
  $naicsId2007=convertNAICS2012to2007($naicsId);
  $jsonEWKS=getEWKSJSON($naicsId2007, $countyCode, $stateCode);
  $ewksJsonObj=json_decode($jsonEWKS);
  $_numBusinesses2=getNumBusinessesEWKS($ewksJsonObj); $numBusinesses2=number_format($_numBusinesses2, 0, '.', ',');
  $_numEmployees2=getNumEmployeesEWKS($ewksJsonObj); $numEmployees2=number_format($_numEmployees2, 0, '.', ',');
  $numEmployeesCode2=getNumEmployeesCodeValue(getNumEmployeesCodeEWKS($ewksJsonObj));
  $_totalAnnualPayroll2=getTotalAnnualPayrollEWKS($ewksJsonObj); $totalAnnualPayroll2="$".number_format(($_totalAnnualPayroll2/1000), 1, '.', ',')."M";
  $_totalReceipts2=getTotalReceiptsEWKS($ewksJsonObj); $totalReceipts2="$".number_format(($_totalReceipts2/1000), 1, '.', ',')."M";
  if ($_numBusinesses2==0)
    $totalRevenue2="$0";
  else
    $totalRevenue2="$".number_format(($_totalReceipts2/$_numBusinesses2)*1000, 0, '.', ',');
  if ($_numEmployees2==0)
  {
    $revenuePerEmployee="$0";
    $avgAnnualPayroll2="$0";
  }
  else
  {
    $revenuePerEmployee="$".number_format(($_totalReceipts2*1000)/$_numEmployees2, 0, '.', ',');
    $avgAnnualPayroll2="$".number_format(($_totalAnnualPayroll2*1000/$_numEmployees2), 0, '.', ',');
  }

  # DEBUG:
  //echo "jsonEWKS: ".$jsonEWKS."<hr>";
  //echo "numBusinesses2: ".$numBusinesses2."<br>";
  //echo "numEmployees2: ".$numEmployees2."<br>";
  //echo "totalAnnualPayroll2: ".$totalAnnualPayroll2."<br>";
  //echo "totalRevenue2: ".$totalRevenue2."<br>";
  //echo "_totalReceipts2: ".$_totalReceipts2."<br>";
  //echo "revenuePerEmployee: ".$revenuePerEmployee."<br>";

  // Non employees
  $jsonNONEMP=getNONEMPJSON($naicsId, $countyCode, $stateCode);
  $jsonObjNONEMP=json_decode($jsonNONEMP);
  $_numICs=getNumICs($jsonObjNONEMP); $numICs=number_format($_numICs, 0, '.', ',');
  $_totalICRevenue=getTotalICRevenue($jsonObjNONEMP); $totalICRevenue="$".number_format(($_totalICRevenue*1000), 0, '.', ',');
  $avgICRev="$".number_format(($_totalICRevenue*1000/$_numICs), 0, '.', ',');

  // Suppliers
  $naicsCode2=getSupplierNAICSId($naicsId);
  $naicsDesc2=getNAICSDesc($naicsCode2);
  $jsonCBP2=getCBPJSON($yearCBP, $naicsCode2, $countyCode, $stateCode);
  $jsonObjCBP2=json_decode($jsonCBP2);
  $_numPotentialSuppliers=getNumBusinessesFromJSON($jsonObjCBP2); $numPotentialSuppliers=number_format($_numPotentialSuppliers, 0, '.', ',');
  $_numSupplierEmployees=getNumEmployeesFromJSON($jsonObjCBP2); $numSupplierEmployees=number_format($_numSupplierEmployees, 0, '.', ',');
  $numSupplierEmployeesCode=getNumEmployeesCodeFromJSON($jsonObjCBP2);
  $_avgPayrollSuppliers=getAnnualPayrollFromJSON($jsonObjCBP2); $avgPayrollSuppliers="$".number_format(($_avgPayrollSuppliers/1000), 1, '.', ',')."M";

  # DEBUG:
  //echo "naicsCode2: ".$naicsCode2.", naicsDesc2: ".$naicsDesc2."<br>";
  //echo "numSupplierEmployees: ".$numSupplierEmployees."<br>";
  //echo "numEmployees: ".$numEmployees."<br>";
  //echo "_numPotentialSuppliers: ".$_numPotentialSuppliers."<br>";

  // ************
  // Format nulls
  // ************
  if (empty($countyName))
    $countyName="[County not found]";
  if (empty($coPopulation))
    $coPopulation=$EMPTY_DATA_STRING;
  if (empty($medianHHIncome))
    $medianHHIncome=$EMPTY_DATA_STRING;
  if (empty($pctPopUnder18))
    $pctPopUnder18=$EMPTY_DATA_STRING;
  if (empty($pctPop65))
    $pctPop65=$EMPTY_DATA_STRING;
  if (empty($pctPop25HS))
    $pctPop25HS=$EMPTY_DATA_STRING;
  if (empty($pctPop25BS))
    $pctPop25BS=$EMPTY_DATA_STRING;
  if (empty($numBusinesses))
  {
    $numBusinesses="0";
    $avgNumCustomersServed="0";
    $avgNumEmployees=$SUPPRESSED_VALUE2;
  }
  if (empty($numEmployees))
  {
    if (!empty($numEmployeesCode))
      $numEmployees=$numEmployeesCode;
    else
      $numEmployees="0";

    $avgNumEmployees=$SUPPRESSED_VALUE2;
    $avgAnnualPayroll=$SUPPRESSED_VALUE2;
  }
  if ($avgAnnualPayroll=="$0")
    $avgAnnualPayroll=$SUPPRESSED_VALUE2;
  if ($totalAnnualPayroll=="$0.0M")
    $totalAnnualPayroll=$SUPPRESSED_VALUE1;
  if (empty($numBusinesses2))
    $numBusinesses2=$SUPPRESSED_VALUE2;
  if (empty($numEmployees2))
  {
    if (!empty($numEmployeesCode2))
      $numEmployees2=$numEmployeesCode2;
    else
      $numEmployees2=$SUPPRESSED_VALUE2;
  }
  if (empty($numICs))
    $numICs="0";
  if (empty($totalICRevenue))
    $totalICRevenue=$SUPPRESSED_VALUE1;
  if ( (empty($avgICRev))||($avgICRev=="$0") )
    $avgICRev=$SUPPRESSED_VALUE2;
  if (empty($numPotentialSuppliers))
    $numPotentialSuppliers="0";
  if (empty($numSupplierEmployees))
  {
    if (!empty($numSupplierEmployeesCode))
      $numSupplierEmployees=getNumEmployeesCodeValue($numSupplierEmployeesCode);
    else
      $numSupplierEmployees="0";
  }
  if ($avgPayrollSuppliers=="$0.0M")
    $avgPayrollSuppliers=$SUPPRESSED_VALUE1;
  if (empty($naicsDesc2))
    $naicsDesc2=$EMPTY_DATA_STRING;
  if (empty($naicsCode2))
    $naicsCode2=$EMPTY_DATA_STRING;

  // 2007 EWKS data
  if ($totalAnnualPayroll2=="$0.0M")
    $totalAnnualPayroll2=$SUPPRESSED_VALUE1;
  if ($avgAnnualPayroll2=="$0")
    $avgAnnualPayroll2=$SUPPRESSED_VALUE2;
  if ($totalReceipts2=="$0.0M")
    $totalReceipts2=$SUPPRESSED_VALUE1;
  if ($totalRevenue2=="$0")
    $totalRevenue2=$SUPPRESSED_VALUE2;
  if ($revenuePerEmployee=="$0")
    $revenuePerEmployee=$SUPPRESSED_VALUE2;


  // ******************
  // Search and replace
  // ******************
  if ($fileFormat=="html")
    $fileContent=str_replace("#!COUNTY_ID#", $countyId, $fileContent);
  $fileContent=str_replace("#!YEAR#", $year, $fileContent);
  $fileContent=str_replace("#!YEAR_CBP#", $yearCBP, $fileContent);
  $fileContent=str_replace("#!NAICS_DESC#", $naicsDesc, $fileContent);
  $fileContent=str_replace("#!NAICS_CODE#", $naicsId, $fileContent);
  $fileContent=str_replace("#!COUNTY_NAME#", $countyName, $fileContent);
  $fileContent=str_replace("#!CO_POPULATION#", $coPopulation, $fileContent);
  $fileContent=str_replace("#!PCT_POP_UNDER_18#", $pctPopUnder18, $fileContent);
  $fileContent=str_replace("#!PCT_POP_65#", $pctPop65, $fileContent);
  $fileContent=str_replace("#!MEDIAN_HH_INCOME#", $medianHHIncome, $fileContent);
  $fileContent=str_replace("#!PCT_POP_25_HS#", $pctPop25HS, $fileContent);
  $fileContent=str_replace("#!PCT_POP_25_BS#", $pctPop25BS, $fileContent);
  $fileContent=str_replace("#!NUM_BUSINESSES#", $numBusinesses, $fileContent);
  $fileContent=str_replace("#!NUM_EMPLOYEES#", $numEmployees, $fileContent);
  $fileContent=str_replace("#!TOTAL_ANNUAL_PAYROLL#", $totalAnnualPayroll, $fileContent);
  $fileContent=str_replace("#!AVG_NUM_EMPLOYEES#", $avgNumEmployees, $fileContent);
  $fileContent=str_replace("#!AVG_ANNUAL_PAYROLL#", $avgAnnualPayroll, $fileContent);
  $fileContent=str_replace("#!AVG_NUM_CUSTOMERS_SERVED#", $avgNumCustomersServed, $fileContent);
  // EWKS
  $fileContent=str_replace("#!NUM_BUSINESSES2#", $numBusinesses2, $fileContent);
  $fileContent=str_replace("#!NUM_EMPLOYEES2#", $numEmployees2, $fileContent);
  $fileContent=str_replace("#!TOTAL_ANNUAL_PAYROLL2#", $totalAnnualPayroll2, $fileContent);
  $fileContent=str_replace("#!AVG_ANNUAL_PAYROLL2#", $avgAnnualPayroll2, $fileContent);
  $fileContent=str_replace("#!TOTAL_RECEIPTS2#", $totalReceipts2, $fileContent);
  $fileContent=str_replace("#!TOTAL_REVENUE2#", $totalRevenue2, $fileContent);
  $fileContent=str_replace("#!REVENUE_PER_EMPLOYEE#", $revenuePerEmployee, $fileContent);
  // Non-Employee
  $fileContent=str_replace("#!NUM_ICS#", $numICs, $fileContent);
  $fileContent=str_replace("#!TOTAL_IC_REVENUE#", $totalICRevenue, $fileContent);
  $fileContent=str_replace("#!AVG_IC_REV#", $avgICRev, $fileContent);
  // Suppliers
  $fileContent=str_replace("#!NUM_POTENTIAL_SUPPLIERS#", $numPotentialSuppliers, $fileContent);
  $fileContent=str_replace("#!NUM_SUPPLIER_EMPLOYEES#", $numSupplierEmployees, $fileContent);
  $fileContent=str_replace("#!AVG_PAYROLL_SUPPLIERS#", $avgPayrollSuppliers, $fileContent);
  $fileContent=str_replace("#!NAICS_DESC2#", $naicsDesc2, $fileContent);
  $fileContent=str_replace("#!NAICS_CODE2#", $naicsCode2, $fileContent);
  // Labels
  $fileContent=str_replace("#!SOURCE_NAME_POPULATION#", $sourceNamePopulation, $fileContent);
  $fileContent=str_replace("#!SOURCE_NAME_COMPETITORS#", $sourceNameCompetitors, $fileContent);
  $fileContent=str_replace("#!SOURCE_NAME_NONEMPLOYER_STATS#", $sourceNameNonemployerStats, $fileContent);
  $fileContent=str_replace("#!SOURCE_NAME_SUPPLIERS#", $sourceNameSuppliers, $fileContent);


  // *************
  // Stream output
  // ************* 
  if ($fileFormat=="rtf")
  {
    header("Content-Disposition: attachment; filename=".$filename);
    header("Content-type: application/octet-stream");
  }
  echo $fileContent;
?>
