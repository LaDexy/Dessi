<template>
<div>

<!--Rectangulo de arriba-->

<div class="rectangulo"></div>

<!--Texto de Encabezado-->
<div>
<h1 class="Titulo">TAKE TO STEP</h1>
</div>

<!--Texto de Inicio de sesion-->
<div>

  <h3 class="Sesion">Iniciar sesion</h3>

</div>

<!--Texto para Registrarse-->
<div>

  <h3 class="Registro">Registrarse</h3>

</div>

<!--Cuadrado-->
<div class="cuadrado">

 <div class="cuadradito">
  <h2>Transforma tu idea en impacto visual. Tu socio creativo está aquí</h2>
 </div>

</div>


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

<!--Texto de logros-->

<div class="Logros">

<h1>Logros</h1>

</div>

<!--Texto motivador para emprendedor-->

<div class="Emprendedor">
<h4>Mayor visibilidad y alcance de tu marca</h4>
</div>

<!--Texto motivador para diseñador-->

<div class="diseñador">
<h4>Tu marca cobrará vida con un diseño impactante</h4>
</div>

<!--Texto motivador para marketing-->

<div class="marketing">
<h4>Aumentaremos tu visibilidad y reconocimiento de marca</h4>
</div>

<!--Imagenes sobresaliente de abajo de carrusel-->
<article>
<img src="../assets/Persona.png" alt="...">
<img src="../assets/si.png" alt="...">
</article>

<!-- Barra de info de desarrollador-->

<footer class="bg-light text-dark py-4">
  <div class="container">
    <p class="text-center">@Desarrollado por Ailebsy Dessire Gonzalez Molina</p>
  </div>
</footer>


    </div>
</template>

<script>
  export default {
    name: "PruebaDos"
  }

</script>

<style>

/*Imagenes de carrusel*/

.carousel-item {
  width: auto;  
}

/*Barritas de carrusel*/

.carousel-indicators{

  width: 100px;
  top: 250px;

}


/*Texto inicial*/

.Titulo{

  position: relative;
  color: white;
  text-align: left;
  top: 10px;

}

/*Texto de inicio de sesion*/

.Sesion{

 position: absolute;
 color: white;
 top: 27px;
 left: 1100px;
}

/*Opciones para registrarse*/

.Registro{

 position: absolute;
 color: white;
 top: 27px;
 left: 1300px;
}

/*Cuadrado de texto motivador*/

.cuadrado {
  width: 1519px;           
  height: 80px;        
  background: rgb(255, 255, 255);       
  border: 1px solid #ffffff; 
}

/*Texto motivador*/

.cuadradito{

top: 20px;
color: rgb(0, 0, 0);

}

.diseñador{

position: absolute;
text-align: left;

}

.marketing{

text-align: right;

}

/*Imagenes sobresaliente de abajo de carrusel*/

article{

position: relative;
width: 350px;
transition: all .3s ease;
left: 40%;

}

article img:first-child{

box-shadow: 0 60px 60px 
-60px rgba(240, 239, 239, 0);
border-radius: 4px;
object-fit: cover;
width: 100%;
background-color: rgb(253, 253, 253);
color: rgb(255, 255, 255);


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
  rgb(255, 255, 255) 95%
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



/*Boton de Opciones*/

.Opciones{

  position: absolute;
  top: 800px;
  left: 10px;

}

/*Carrusel de imagenes*/

section{

display: flex;
width: 1519px;
height: 380px;

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


/*Rectangulo de titulo*/

.rectangulo{

position: absolute;
width: 1520px;
height: 60px;
background-color: hsl(300, 29%, 78%);

}


/*Info de patente*/



</style>