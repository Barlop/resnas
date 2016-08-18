$(document).ready(function() {

});

function consultarUsuario() {
  $.ajax({
    type: 'POST',
    url: 'controller/iniciarSesion.php',
    dataType: "json",
    data: $('#form-login').serialize(),
    async: true,
    success: function(resp) {
      if (resp["success"] == "true") {
        window.location = "home.php";
      } else {
        alertify.error(resp["data"]);
      }
    }
  });
}

function cerrarSession() {
  window.confirm("Deseas cerrar sesión");
  window.location = "controller/logout.php";
}
