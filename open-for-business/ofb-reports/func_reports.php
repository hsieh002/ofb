<?php
/**
 * func_reports.php
 *
 * @author Mel Hsieh
 */
  // Constants
  //$CENSUS_API_KEY="fcad50d7b14890d32a7857222a486580e1006e01";	// melvin.hsieh@census.gov
  $CENSUS_API_KEY="e0beb416fabbd42a7cefb1c5cf2c86d7641e81f8";	// openforbusiness@census.gov
  $URL_ACS_API="http://api.census.gov/data/2012/acs5?get=";
  $URL_ACS_PROFILE_API="http://api.census.gov/data/2012/acs5/profile?get=";
  $URL_CBP_API="http://api.census.gov/data/2011/cbp?get=";
  //$URL_CBP2012_API="http://web10.dev.rm.census.gov/data/2012/cbp?get=";
  $URL_CBP2012_API="http://api.census.gov/data/2012/cbp?get=";
  $URL_NAICS_API="http://www.census.gov/cgi-bin/sssd/naics/naicsrch";
  $URL_EWKS_API="http://api.census.gov/data/2007/ewks?get=ESTAB,EMP,PAYANN,RCPTOT,EMP_F&NAICS2007=";
  $URL_NONEMP_API="http://api.census.gov/data/2012/nonemp";
  $URL_NONEMP_API="http://api.census.gov/data/2012/nonemp?get=ESTAB,RCPTOT&LFO=*&RCPTOT_SIZE=*&NAICS2012=";
 
 
  function getSequenceId()
  {
    list($usec, $sec)=explode(" ", microtime());
    list($int, $dec)=explode(".", $usec);
    return $sec.$dec;
  } // getSequenceId()


  function doHTTPPost($url, $fields, $postvars)
  {
    $result="";

    // Open connection
    $ch=curl_init();
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_VERBOSE, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/4.0 (compatible;)");
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postvars);
    $result=curl_exec($ch);
    curl_close($ch);

    return $result;
  } // doHTTPPost()


  function getNAICSDescPOST($naicsId)
  {
    // This function does a POST to Census NAICS API
    global $URL_NAICS_API;

    $naicsDesc="";
    $fields=array(
      'input' => $naicsId,
      'search' => "2012"
    );
    $postvars=http_build_query($fields);
    $http=doHTTPPost($URL_NAICS_API, $fields, $postvars);

    # DEBUG:
    //echo $http; die();

    if (strlen($naicsId)==6)
    {
      $tokens=explode("<h2>2012 NAICS Definition</h2>", $http);
      $tokens2=explode("</h3>", $tokens[1]);
      $tokens3=explode("<h3>", $tokens2[0]);
      $tokens4=explode("&nbsp;", $tokens3[1]);
      $naicsDesc=$tokens4[1];
    }

    return $naicsDesc;
  } // getNAICSDescPOST()


  function getNAICSDesc($naicsId)
  {
    global $URL_NAICS_API;
    $naicsDesc="";

    $url=$URL_NAICS_API."?code=".$naicsId."&search=2012%20NAICS%20Search";
    $html=file_get_contents($url);

    # DEBUG:
    //echo "url: ".$url."<br>";

    if (strlen($naicsId)==6)
    {
      $tokens=explode("<h2>2012 NAICS Definition</h2>", $html);
      $tokens2=explode("</h3>", $tokens[1]);
      $tokens3=explode("<h3>", $tokens2[0]);
      $tokens4=explode("&nbsp;", $tokens3[1]);
      $naicsDesc=$tokens4[1];
    }
    else
    {
      $tokens=explode("<h2>2012 NAICS Definition</h2>", $html);
      $tokens2=explode("</h3>", $tokens[1]);
      $tokens3=explode("<h3>", $tokens2[1]);
      $tokens4=explode("&nbsp;", $tokens3[1]);
      $naicsDesc=$tokens4[1];
    }

    $naicsDesc=str_replace("<sup>T</sup>", "", $naicsDesc);

    return $naicsDesc;
  } // getNAICSDesc()


  function getEWKSJSON($naicsId, $countyCode, $stateCode)
  {
    global $CENSUS_API_KEY;
    global $URL_EWKS_API;
    $json="";

    $url=$URL_EWKS_API.$naicsId."&for=county:".$countyCode."&in=state:".$stateCode."&key=".$CENSUS_API_KEY;
    # DEBUG:
    //echo "url: ".$url."<br>";

    $json=file_get_contents($url);

    return $json;
  } // getEWKSJSON()


  function getNumBusinessesEWKS($jsonObj)
  {
    $numBusinesses="";
    $numBusinesses=$jsonObj[1][0];
    return $numBusinesses;
  } // getNumBusinessesEWKS()


  function getNumEmployeesEWKS($jsonObj)
  {
    $numEmployees="";
    $numEmployees=$jsonObj[1][1];
    return $numEmployees;
  } // getNumEmployeesEWKS()


  function getNumEmployeesCodeEWKS($jsonObj)
  {
    $numEmployeesCode="";
    $numEmployeesCode=$jsonObj[1][4];
    return $numEmployeesCode;
  } // getNumEmployeesCodeEWKS()


  function getTotalAnnualPayrollEWKS($jsonObj)
  {
    $annualPayroll="";
    $annualPayroll=$jsonObj[1][2];
    return $annualPayroll;
  } // getTotalAnnualPayrollEWKS()


  function getTotalReceiptsEWKS($jsonObj)
  {
    $totalReceipts="";
    $totalReceipts=$jsonObj[1][3];
    return $totalReceipts;
  } // getTotalReceiptsEWKS()


  function getNONEMPJSON($naicsId, $countyCode, $stateCode)
  {
    global $CENSUS_API_KEY;
    global $URL_NONEMP_API;
    $json="";

    $url=$URL_NONEMP_API.$naicsId."&for=county:".$countyCode."&in=state:".$stateCode."&key=".$CENSUS_API_KEY;
    # DEBUG:
    //echo "url: ".$url."<br>";

    $json=file_get_contents($url);

    return $json;
  } // getNONEMPJSON()


  function getNumICs($jsonObj)
  {
    $numICs="";
    $numICs=$jsonObj[1][0];
    return $numICs;
  } // getNumICs()


  function getTotalICRevenue($jsonObj)
  {
    $ICRevenue="";
    $ICRevenue=$jsonObj[1][1];
    return $ICRevenue;
  } // getTotalICRevenue()


  function getACSJSON($countyCode, $stateCode)
  {
    global $CENSUS_API_KEY;
    global $URL_ACS_API;
    $json="";
    $apiCode="NAME,B01001_001E,B19013_001E"; // County Name, County Population, Median HH Income

    $url=$URL_ACS_API.$apiCode.",NAME&for=county:".$countyCode."&in=state:".$stateCode."&key=".$CENSUS_API_KEY;
    $json=file_get_contents($url);

    # DEBUG:
    //echo "url: ".$url."<br>";
    //echo "json: ".$json."<br>";
    //die();

    return $json;
  } // getACSJSON()


  function getCountyNameFromJSON($jsonObj)
  {
    $countyName="";
    $countyName=$jsonObj[1][0];
    return $countyName;
  } // getCountyNameFromJSON()


  function getCountyPopulationFromJSON($jsonObj)
  {
    $coPop="";
    $coPop=$jsonObj[1][1];
    return $coPop;
  } // getCountyPopulationFromJSON()


  function getMedianHHIncomeFromJSON($jsonObj)
  {
    $medianHHIncome="";
    $medianHHIncome=$jsonObj[1][2];
    return $medianHHIncome;
  } // getMedianHHIncomet()


  function getACSPROFILEJSON($countyCode, $stateCode)
  {
    global $CENSUS_API_KEY;
    global $URL_ACS_PROFILE_API;
    $json="";
    //$apiCode="DP05_0018PE,DP05_0021PE,DP02_0061PE,DP02_0064PE";	// % pop under 18, % pop 65, % pop 25 HS, % pop 25 BS
    //$apiCode="DP05_0018PE,DP05_0021PE,DP02_0066PE,DP02_0064PE"; // % pop under 18, % pop 65, % pop 25 HS, % pop 25 BS
    $apiCode="DP05_0018PE,DP05_0021PE,DP02_0066PE,DP02_0067PE"; // % pop under 18, % pop 65, % pop 25 HS, % pop 25 BS

    $url=$URL_ACS_PROFILE_API.$apiCode."&for=county:".$countyCode."&in=state:".$stateCode."&key=".$CENSUS_API_KEY;
    $json=file_get_contents($url);

    # DEBUG:
    //echo "url: ".$url."<br>";
    //echo "json: ".$json."<br>";
    //die();

    return $json;
  } // getACSPROFILEJSON()


  function getPercentagePopulationFromJSON($jsonObj, $index)
  {
    $pctPop="";
    $pctPop=$jsonObj[1][$index];
    return $pctPop."%";
  } // getPercentagePopulationFromJSON()


  function getCBPJSON($year, $naicsId, $countyCode, $stateCode)
  {
    global $CENSUS_API_KEY;
    global $URL_CBP_API;
    global $URL_CBP2012_API;
    $json="";
    $url="";
    $naicsVar="";
    $apiCode="ESTAB,EMP,PAYANN,EMP_F";

    if ($year=="2012")
    {
      $url=$URL_CBP2012_API;
      $naicsVar="NAICS2012";
    }
    else
    {
      $url=$URL_CBP_API;
      $naicsVar="NAICS2007";
    }

    $url.=$apiCode."&for=county:".$countyCode."&in=state:".$stateCode."&".$naicsVar."=".$naicsId."&key=".$CENSUS_API_KEY;
    $json=file_get_contents($url);

    # DEBUG:
    //echo "url: ".$url."<br>";
    //echo "json: ".$json."<br>";
    //die();

    return $json;
  } // getCBPJSON()


  function getNumBusinessesFromJSON($jsonObj)
  {
    $numBusinesses="";
    $numBusinesses=$jsonObj[1][0];
    return $numBusinesses;
  } // getNumBusinessesFromJSON()


  function getNumEmployeesFromJSON($jsonObj)
  {
    $numEmployees="";
    $numEmployees=$jsonObj[1][1];
    return $numEmployees;
  } // getNumEmployeesFromJSON()


  function getAnnualPayrollFromJSON($jsonObj)
  {
    $annualPayroll="";
    $annualPayroll=$jsonObj[1][2];
    return $annualPayroll;
  } // getAnnualPayrollFromJSON()


  function getNumEmployeesCodeFromJSON($jsonObj)
  {
    $numEmployeesCode="";
    $numEmployeesCode=@$jsonObj[1][3];
    return $numEmployeesCode;
  } // getNumEmployeesCodeFromJSON()


  function getNumEmployeesCodeValue($numEmployeesCode)
  {
    $codeValue="0";
   
    switch($numEmployeesCode)
    {
      case "a":
        $codeValue="0-19";
        break;
      case "b":
        $codeValue="20-99";
        break;
      case "c":
        $codeValue="100-249";
        break;
      case "e":
        $codeValue="250-499";
        break;
      case "f":
        $codeValue="500-999";
        break;
      case "g":
        $codeValue="1,000-2,499";
        break;
      case "h":
        $codeValue="2,500-4,999";
        break;
      case "i":
        $codeValue="5,000-9,999";
        break;
      case "j":
        $codeValue="10,000-24,999";
        break;
      case "k":
        $codeValue="25,000-49,999";
        break;
      case "l":
        $codeValue="50,000-99,999";
        break;
      case "m";
        $codeValue="100,000+";
        break;
      default:
        $codeValue="0";
        break;
    } // switch
 
    return $codeValue;
  } // getNumEmployeesCodeValue()


  function convertNAICS2012to2007($_naicsId)
  {
    $naicsId="";

    switch($_naicsId)
    {
      case "722511":
        $naicsId="7221";
        break;
      case "722513":
        $naicsId="7222";
        break;
      default:
        $naicsId=$_naicsId;
        break;
    } // switch

    return $naicsId;
  } // convertNAICS2012to2007()


  function convertNAICS2007to2012($_naicsId)
  {
    $naicsId="";

    switch($_naicsId)
    {
      case "7221":
        $naicsId="722511";
        break;
      case "7222":
        $naicsId="722513";
        break;
      default:
        $naicsId=$_naicsId;
        break;
    } // switch

    return $naicsId;
  } // convertNAICS2007to2012()


  function getSupplierNAICSId($naicsId)
  {
    $sNAICSId="";

    switch($naicsId)
    {
      case "23821":
        $sNAICSId="42361";
        break;
      case "23833":
        $sNAICSId="42331";
        break;
      case "23832":
        $sNAICSId="42495";
        break;
      case "23822":
        $sNAICSId="42372";
        break;

      case "72232":
        $sNAICSId="4244";
        break;
      case "7224":
        $sNAICSId="4248";
        break;
      case "722511":
        $sNAICSId="4244";
        break;
      case "722513":
        $sNAICSId="4244";
        break;

      case "812112":
        $sNAICSId="42385";
        break;
      case "56173":
        $sNAICSId="42493";
        break;
      case "62111":
        $sNAICSId="42345";
        break;
      case "62121":
        $sNAICSId="42345";
        break;
      case "48531":
        $sNAICSId="42312";
        break;
      case "56151":
        $sNAICSId="42412";
        break;

      case "54121":
        $sNAICSId="42412";
        break;
      case "8111":
        $sNAICSId="42312";
        break;
      case "52421":
        $sNAICSId="42412";
        break;
      case "54111":
        $sNAICSId="42412";
        break;
      case "54161":
        $sNAICSId="42412";
        break;
      case "53121":
        $sNAICSId="42412";
        break;

      case "44531":
        $sNAICSId="4248";
        break;
      case "44512":
        $sNAICSId="4244";
        break;
      case "45311":
        $sNAICSId="42493";
        break;
      case "4471":
        $sNAICSId="42472";
        break;
      case "44112":
        $sNAICSId="42312";
        break;
    } // switch

    return $sNAICSId;
  } // getSupplierNAICSId()
?>
