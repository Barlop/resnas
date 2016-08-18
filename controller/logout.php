<?php
/**
 * Created by PhpStorm.
 * User: AKSIOMD1
 * Date: 10/08/2016
 * Time: 05:45 PM
 */

session_start();

if (isset($_SESSION['usuario'])) {
    session_destroy();
    header('Location: ../index.php');
    exit;
}