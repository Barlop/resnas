function pantalla($pantalla) {

  $.ajax({
    type: 'POST',
    url: 'admin.php',
    dataType: "html",
    data: {"pantalla":$pantalla},
    async: false,
    success: function(resp) {

      $("#page-wrapper").html(resp);

    }

  });

}
