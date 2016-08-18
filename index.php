<?php
session_start();

if(isset($_SESSION['usuario'])) {
    header('Location: home.php');
}
?>
<!DOCTYPE html>
<html lang="es">

<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>Admin - Restaurante Don Garnachas</title>

    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css">
    <link href="css/style.css" rel="stylesheet" type="text/css">
    <link href='https://fonts.googleapis.com/css?family=Pacifico' rel='stylesheet' type='text/css'>
    <link href="css/alertify.core.css" rel="stylesheet" type="text/css">
    <link href="css/alertify.default.css" rel="stylesheet" type="text/css">

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->

</head>

<body class="wallpaper">

    <div class="space-padd"></div>

      <div class="container">
        <div class="row">
          <div class="col-md-12 esconder-titulo">
            <h1 class="text-center space-h1">Restaurante Don Garnachas</h1>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-md-4 col-md-offset-4">
            <div class="panel panel-default center-block">
              <div class="panel-body">
                <form id="form-login">
                  <img src="img/carnitas.jpg" alt="Carnitas" class="img-circle center-block" width="200" height="200" />
                  <div class="space-carnitas"></div>
                  <div class="form-group">
                    <div class="input-group">
                      <span class="input-group-addon" id="basic-addon1"><i class="fa fa-user" aria-hidden="true"></i></span>
                      <input type="text" class="form-control" id="username" name="username" placeholder="Usuario" aria-describedby="basic-addon1">
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="input-group">
                      <span class="input-group-addon" id="basic-addon2"><i class="fa fa-key" aria-hidden="true"></i></span>
                      <input type="password" class="form-control" id="password" name="password" placeholder="Contraseña" aria-describedby="basic-addon2">
                    </div>
                  </div>
                  <button type="button" class="btn btn-default btn-block" onclick="consultarUsuario()"><i class="fa fa-unlock" aria-hidden="true" id="enter"></i> Entrar</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

    <script src="js/jquery.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/alertify.js"></script>
    <script src="process_js/login.js"></script>

</body>
</html>
