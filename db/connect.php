<?php

Class Db {

      private $servidor='localhost';
      private $usuario='root';
      private $password='1m9j9l5b';
      private $base_datos='restaurante';

      private $link;
      private $stmt;
      private $array;

      static $_instance;

      /*La función construct es privada para evitar que el objeto pueda ser creado mediante new*/
      private function __construct(){
         $this->conectar();
      }

      /*Evitamos el clonaje del objeto. Patr�n Singleton*/
      private function __clone(){ }

      /*Función encargada de crear, si es necesario, el objeto. Esta es la función que debemos llamar desde fuera de la clase para instanciar el objeto, y as�, poder utilizar sus m�todos*/
      public static function getInstance() {
         if (!(self::$_instance instanceof self)) {
            self::$_instance = new self();
         }
         return self::$_instance;
      }

      /*Realiza la conexi�n a la base de datos.*/
      private function conectar() {
         $this->link = mysqli_connect($this->servidor, $this->usuario, $this->password, $this->base_datos);
   	    // mysqli_set_charset('utf8',$this->link);
         @mysqli_query("SET NAMES 'utf8'");
      }

      /*M�todo para ejecutar una sentencia sql*/
      public function ejecutar($sql) {
         $this->stmt = mysqli_query($this->link, $sql);
         return $this->stmt;
      }

      public function iniciaTransaccion(){
        mysqli_autocommit($this->link, FALSE);
      }

      public function finalizaTransaccion(){
        mysqli_commit($this->link);
      }

      public function error(){
        return  mysqli_error ($this->link);
      }

      public function regresarTransaccion(){
         mysqli_rollback($this->link);
      }

      /*Método para obtener una fila de resultados de la sentencia sql*/
      public function obtener_fila($stmt,$fila) {
         if ($fila == 0) {
            $this->array = mysqli_fetch_array($stmt);
         } else {
            # Ajustar el puntero de resultado a una fila arbitraria del resultado
            mysqli_data_seek($stmt,$fila);
            $this->array = mysqli_fetch_array($stmt);
         }
         return $this->array;
      }

      //Devuelve el ultimo id del insert introduci0000000000do
      public function lastID() {
         # Devuelve el id autogenerado que se utilizó en la última consulta
         return mysqli_insert_id($this->link);
      }

      public function afectadas() {
         # Obtiene el número de filas afectadas en la última operación MySQL
         return mysqli_affected_rows($this->link);
   	}

}
