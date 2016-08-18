<?php

$pantalla = $_REQUEST['pantalla'];

switch ($pantalla) {

  case "meseros":
    include("views/meseros/meseros.php");
    break;

  case "cocineros":
    include("views/cocineros/cocineros.php");
    break;

}
