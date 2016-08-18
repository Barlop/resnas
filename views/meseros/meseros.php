<!-- TITULO -->
<div class="container-fluid">
  <div class="row">
    <div class="col-md-12">
      <h2 class="text-center titulo-item">Meseros</h2>
      <hr>
    </div>
  </div>
</div>

<!-- FORMULARIO PARA INGRESAR MESEROS -->
<div class="container-fluid">
  <div class="row">
    <div class="col-lg-12">
      <div class="panel panel-danger">
        <div class="panel-heading">Nuevo Mesero</div>
        <div class="panel-body">
          <form id="form-cocineros" role="form">
            <div class="form-group col-md-3 col-xs-12">
              <label for="NumMesero">Numero de Mesero:</label>
              <input type="text" class="form-control input-sm"/>
            </div>
            <div class="form-group col-md-3 col-xs-12">
              <label for="Nombre">Nombre:</label>
              <input type="text" class="form-control input-sm"/>
            </div>
            <div class="form-group col-md-3 col-xs-12">
              <label for="Paterno">Apellido Paterno:</label>
              <input type="text" class="form-control input-sm"/>
            </div>
            <div class="form-group col-md-3 col-xs-12">
              <label for="Materno">Apellido Materno:</label>
              <input type="text" class="form-control input-sm"/>
            </div>
            <div class="form-group col-md-3 col-xs-12">
              <label for="Edad">Edad:</label>
              <input type="text" class="form-control input-sm"/>
            </div>
            <div class="form-group col-md-3 col-xs-12">
              <label for="Sexo">Sexo:</label>
              <select class="form-control input-sm" name="sexo">
                <option>Masculino</option>
                <option>Femenino</option>
              </select>
            </div>
            <div class="form-group col-md-3 col-xs-12">
              <label for="Direccion">Dirección:</label>
              <input type="text" class="form-control input-sm"/>
            </div>
            <div class="form-group col-md-3 col-xs-12">
              <label for="Colonia">Colonia:</label>
              <input type="text" class="form-control input-sm"/>
            </div>
            <div class="form-group col-md-3 col-xs-12">
              <label for="Municipio">Municipio:</label>
              <input type="text" class="form-control input-sm"/>
            </div>
            <div class="form-group col-md-3 col-xs-12">
              <label for="Telefono">Telefono:</label>
              <input type="text" class="form-control input-sm"/>
            </div>
            <div class="form-group col-md-3 col-xs-12">
              <label for="Cargo">Cargo:</label>
              <input type="text" class="form-control input-sm"/>
            </div>
            <div class="form-group col-md-3 col-xs-12">
              <label for="Activo">Activo:</label>
              <input type="number" class="form-control input-sm" min="0" max="1" />
            </div>
            <div class="form-group col-md-12">
              <button type="submit" name="button" class="btn btn-success btn-md">Guardar datos</button>
            </div>
          </form>
        </div>
      </div>
      <hr>
      <div class="panel panel-danger">
        <div class="panel-heading">Lista de Meseros</div>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
            <tr>
              <th class="text-center">Nombre</th>
              <th class="text-center">Apellido Paterno</th>
              <th class="text-center">Apellido Materno</th>
              <th class="text-center">Edad</th>
              <th class="text-center">Acción</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td class="text-center">Mario Joaquin</td>
              <td class="text-center">López</td>
              <td class="text-center">Barceinas</td>
              <td class="text-center">21</td>
              <td class="text-center">
                <a href="#" class="btn"><i class="fa fa-times" aria-hidden="true"></i>
                </a>
                <a href="#" class="btn"><i class="fa fa-pencil-square" aria-hidden="true"></i>
                </a>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
