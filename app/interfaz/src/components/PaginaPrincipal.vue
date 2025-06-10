<template>

<div>

  
  
  <!--Imagen de fondo  -->
  <div class="Fondo">
    <img src="../assets/Kirby.jpg" />
    <!--Menu para seleccionar tiempo de emprendimiento-->
  <div class="Derribo">
    <div class="dropdown">
      <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" data-bs-toggle="dropdown" aria-expanded="false">
        Nivel de emprendimiento
      </button>
        <ul class="dropdown-menu" aria-labelledby="dropdownMenu2">
          <li><button class="dropdown-item" type="button">Nuevo</button></li>
          <li><button class="dropdown-item" type="button">Poco tiempo</button></li>
          <li><button class="dropdown-item" type="button">Mucho tiempo</button></li>
        </ul>
      </div>
  </div>

  <!--Texto principal-->
  <div class="Texto" >
    <h1>TAKE TO STEP</h1>
  </div>

  <!--Cuadrado de registro-->
  <div class="cuadrado"></div>

  <!--Cuadrado de icono de registro-->
  <div class="icono">
    <div class="cuadrado"></div>
  </div>

  <!--Casillita de nombre-->
  <input type="text" size="20" placeholder="Nombre completo">

  <!--Casillita de nombre de negocio-->
  <input class="casillita2" type="text" size="20" placeholder="Nombre de negocio">

  <!--Casillita de localidad-->
  <input class="casillita3" type="text" size="20" placeholder="Localidad">

  <!--Casillita de descripcion de negocio-->
  <input class="casillita4" type="text" size="20" placeholder="Descripcion de negocio">

  <!--Link para enlace de iconos-->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">

  <!--Link para enlace de Bootstrap-->
  

   <!--Icono de usuario-->
  <div class="IcoUsuario">
    <i class="fa-regular fa-user fa-xl"></i>
  </div>

  <!--Palabra de definicio del perfil a registrar-->
  <div class="Emprendedor">
    <h1>Emprendedor</h1>
  </div>

  <div class="Carrusel">

    <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel">
  <div class="carousel-indicators">
    <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
    <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
    <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
  </div>
  <div class="carousel-inner">
    <div class="carousel-item active">
      <input v-text="Hola1" class="d-block w-100" alt="...">
    </div>
    <div class="carousel-item">
      <input v-text="Hola2" class="d-block w-100" alt="...">
    </div>
    <div class="carousel-item">
      <input v-text="Hola3" class="d-block w-100" alt="...">
    </div>
  </div>
  <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
</div>

  </div>


  </div>


  
  

</div>
</template>

<script>
  export default {
    name: "PaginaPrincipal"
  }

</script>

<style scoped>
 /* Imagen principal */
  .Fondo {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  height: 100%;
  width: 100%;
  top: 90px;

  }

/* Texto principal */
  .Texto {
  position: absolute;
  color: rgb(0, 0, 0);
  left: 45%;
  top: 15%;
  
  }

/* Cuadrado de registro*/
  .cuadrado {
  position: absolute;
  background-color: rgb(0, 0, 0);
  width: 18%;
  height: 55%;
  left: 54.5%;
  opacity: 0.5;
  border-radius: 90px; 
  top: 25%;
  border: 4px solid white;

  }

/* Casillita de Nombre*/
  input {
  position: absolute;
  left:55.8%;
  top: 33%;
  line-height: 35px;
  border-radius: 18px;
  width: 15%;
  background-color: rgb(255, 255, 255);
  border: 3px solid rgb(255, 255, 255); 
  
  }

/* Icono de usuario*/
  .IcoUsuario {
  position: absolute;
  left: 62.7%;
  top: 23.5%;
  color: rgb(255, 255, 255);

  }

/* Cuadrado para icono de usuario*/
  .icono {
  position: absolute;
  left: 53.5%;
  width: 15.5%;
  top: 19.7%;
  height: 10%;
  border-radius: 15px;

  }

/* Texto emprendero*/
  .Emprendedor{
    position: absolute;
    color: rgb(0, 0, 0);
    left: 56%;
    top: 28%;

  } 

/* Casillita de nombre de negocio*/
  .casillita2 {
  position: absolute;
  left: 55.8%;
  top: 40%;
  line-height: 35px;
  border-radius: 18px;
  width: 15%;
  background-color: rgb(255, 255, 255);
  border: 3px solid rgb(255, 255, 255); 
  
  }

/* Casillita de localidad*/ 
  .casillita3 {
  position: absolute;
  left: 55.8%;
  top: 47%;
  line-height: 35px;
  border-radius: 18px;
  width: 15%;
  background-color: rgb(255, 255, 255);
  border: 3px solid rgb(255, 255, 255); 
  
  }

/* Casillita de localidad*/ 
  .casillita4 {
  position: absolute;
  left: 55.8%;
  top: 54%;
  line-height: 35px;
  border-radius: 18px;
  width: 15%;
  background-color: rgb(255, 255, 255);
  border: 3px solid rgb(255, 255, 255); 
  
  }

/* Desplegable de opciones de nivel de emprendimiento*/
  .Derribo {
  position: absolute;
  top: 0;
  left: 30%;

  }

/* Carrusel de texto*/ 

</style>