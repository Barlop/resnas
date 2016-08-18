<?php

// Se creara el proceso de inicio de sesión en php
session_start();

require_once  '../db/connect.php';

/*Creamos la instancia del objeto. Ya estamos conectados*/
$db=Db::getInstance();

$username = htmlentities($_POST['username'], ENT_QUOTES, 'utf-8');
$password = htmlentities($_POST['password'], ENT_QUOTES, 'utf-8');

$view_users = (
  "SELECT * FROM tbl_usuarios
  WHERE usuario = '{$username}'
  AND password = '{$password}'"
);

$execute_users = $db->ejecutar($view_users);

if(mysqli_num_rows($execute_users) > 0){
  $_SESSION['usuario'] =  $username;
  $datosJSON["success"]="true";
  $datosJSON["data"]="";
  echo json_encode($datosJSON);
} else {
  $datosJSON["success"]="false";
  $datosJSON["data"]="Error, al escribir el usuario o contraseña.";
  echo json_encode($datosJSON);
}
