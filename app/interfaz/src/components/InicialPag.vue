<template>
    <div>

<!--Texto de Encabezado-->
<div>
<h1 class="display-1 form-floating">TAKE TO STEP</h1>
</div>

<!--Prueba de barra de opciones-->

<nav class="navbar navbar-expand-lg navbar-light bg-dark text-light">
  <div class="container-fluid">
    <div class="collapse navbar-collapse" id="navbarScroll">
      <ul class="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 100px;">
        <li class="nav-item">
          <a class="nav-link" href="#">Iniciar Sesion</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarScrollingDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Registrarse
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarScrollingDropdown">
            <li><a class="dropdown-item" href="#">Emprendedor</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#">Diseñador</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#">Marketing</a></li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</nav>

<!--Barra lateral derecha que se desliza-->
<div class="Opciones">
<div class="offcanvas-header">
<button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">

  <!--Icono de Interrogacion-->
  <i class="fa-regular fa-circle-question fa-2xl" style="color: #ffffff;"></i>

</button>

<div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">

<!--Boton de Instructivo-->
<button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
<p>
  <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
    Instructivo
  </a>
</p>
<div class="collapse" id="collapseExample">
  <div class="card card-body">
    Aca dira como se inicia sesion y se registra
  </div>
</div>

<p>
  <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample2" role="button" aria-expanded="false" aria-controls="collapseExample2">
    Acerca De
  </a>
</p>
<div class="collapse" id="collapseExample2">
  <div class="card card-body">
    Aca dia informacion sobre la app web
  </div>
</div>
    
  </div>
</div>
</div>

<!--Carrusel de imagenes-->

<section>

  <img src="../assets/Slider1.jpg" alt="...">
  <img src="../assets/Slider2.jpg" alt="...">
  <img src="../assets/Slider3.jpg" alt="...">

</section>

<!--Imagenes sobresaliente de abajo de carrusel-->
<article>
<img src="../assets/Izquierda.jpg" alt="...">
<img src="../assets/Manos.jpg" alt="...">
</article>

<!--Boton animado de mapa mental-->

<div class="Inicial">
<button class="MapaInicial">
  Logros
  <div class="button__horizontal"></div>
  <div class="button__vertical"></div>
</button>
</div>


<!-- Barra de info de desarrollador

<footer class="bg-dark text-light py-4">
  <div class="container">
    <p class="text-center">@Desarrollado por Ailebsy Dessire Gonzalez Molina</p>
  </div>
</footer>
-->

    </div>
</template>

<script>
  export default {
    name: "InicialPag"
  }

</script>

<style>

/*Imagenes de carrusel*/

.carousel-item {

  height: 80%;
  width: auto;  

}

/*Barritas de carrusel*/

.carousel-indicators{

  width: 100px;
  top: 250px;

}

/*Barra de navegacion*/

.nav-item{

  font-size: 30px;

}

/*Texto inicial*/

.display-1{

  position: relative;
  background-color: rgb(0, 0, 0);
  color: white;

}

/*Barra de navegacion*/

.container-fluid{

  background-color: rgb(255, 255, 255);
  top: 50px;

}

/*Boton de iniciar sesion*/

.nav-item{

  font-size: 30px;

}

/*Boton de Opciones*/

.Opciones{

  position: absolute;
  top: 30px;
  left: 10px;

}

/*Imagenen latelar derecha*/

article{

position: relative;
width: 350px;
transition: all .3s ease;
left: 40%;

}

article img:first-child{

box-shadow: 0 60px 60px 
-60px rgba(0, 0, 0, 0);
border-radius: 4px;
object-fit: cover;
width: 100%;
background-color: black;
color: black;


}

article img:last-child{

position: absolute;
width: 200px;
bottom: 0;
left: 0;
right: 0;
margin: auto;
transform: translateY(20%);
transition: .3s ease;
opacity: 0;

}

article:hover{

transform: 

perspective(250px)
rotateX(10deg)
translateY(-5%)
translateZ(0);


}

article:before{

content: '';
position: absolute;
bottom: 0;
height: 100%;
width: 100%;

background-image: 

linear-gradient(
  to bottom,
  transparent 10%,
  rgba(0,0,0,0.5) 50%,
  rgba(0,0,0) 95%
);

opacity: 0;
transition: all .3s ease;

}

article:hover::before{

opacity: 1;

}

article:hover img:last-child{

opacity: 1;
transform: translateY(10%);

}

/*Carrusel de imagenes*/

section{

display: flex;
width: 1519px;
height: 400px;

}

section img{

width: 0px;
flex-grow: 1;
object-fit: cover;
opacity: 0.9;
transition: .5s ease;

}

section img:hover{

cursor: crosshair;
width: 300px;
opacity: 1;
filter: contrast(120%);

}

/*Boton inicial de mapa mental*/

.MapaInicial {

  --offset: 10px;
  --border-size: 3.5px;
  position: relative;
  padding: 1.5em 3em;
  appearance: none;
  border: 0;
  background: transparent;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: .25em;
  outline: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 0;
  box-shadow: inset 0 0 0 var(--border-size) currentcolor;
  transition: background .8s ease;
  top: 100px;
  left: 28px;

}

.MapaInicial:hover {
  background: rgba(255, 255, 255, 0.03);
}

.button__horizontal,
.button__vertical {
  position: absolute;
  top: var(--horizontal-offset, 0);
  right: var(--vertical-offset, 0);
  bottom: var(--horizontal-offset, 0);
  left: var(--vertical-offset, 0);
  transition: transform .8s ease;
  will-change: transform;
}

.button__horizontal::before,
.button__vertical::before {
  content: '';
  position: absolute;
  border: inherit;
}

.button__horizontal {
  --vertical-offset: calc(var(--offset) * -1);
  border-top: var(--border-size) solid currentcolor;
  border-bottom: var(--border-size) solid currentcolor;
}

.button__horizontal::before {
  top: calc(var(--vertical-offset) - var(--border-size));
  bottom: calc(var(--vertical-offset) - var(--border-size));
  left: calc(var(--vertical-offset) * -1);
  right: calc(var(--vertical-offset) * -1);
}

.MapaInicial:hover .button__horizontal {
  transform: scaleX(0);
}

.button__vertical {
  --horizontal-offset: calc(var(--offset) * -1);
  border-left: var(--border-size) solid currentcolor;
  border-right: var(--border-size) solid currentcolor;
}

.button__vertical::before {
  top: calc(var(--horizontal-offset) * -1);
  bottom: calc(var(--horizontal-offset) * -1);
  left: calc(var(--horizontal-offset) - var(--border-size));
  right: calc(var(--horizontal-offset) - var(--border-size));
}

.MapaInicial:hover .button__vertical {
  transform: scaleY(0);
}

/*Info de patente*/



</style>