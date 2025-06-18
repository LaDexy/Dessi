<template>
<div>

<!--Rectangulo de arriba-->

<div class="rectangulo"></div>

<!--Boton para iniciar sesion-->

<div class="Inicio">

   <button>Iniciar Sesion</button>

 </div>

  <!--Menu desplegable para registro-->

<div class="dropdown">

<button>Registrarse</button>
<div class="content">

<a href="">Emprendedor</a>
<a href="">Diseñador</a>
<a href="">Marketing</a>

</div>
</div>

<!--Texto de Encabezado-->
<div>
<h1 class="Titulo">TAKE TO STEP</h1>
</div>


<!--Cuadrado-->
<div class="cuadrado">

 <div class="cuadradito">
  <h3>Transforma tu idea en impacto visual. Tu socio creativo está aquí</h3>
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

  position: absolute;
  color: white;
  text-align: left;
  top: 10px;

}


.Inicio{

left: 35%;
position: relative;
display: inline-block;
top: 10px;

}

.Inicio button{

background-color: antiquewhite;
color: white;
padding: 10px 15px;
border: none;
cursor: pointer;

}



/*Menu desplegable de Registro*/

.dropdown{

left: 40%;
position: relative;
display: inline-block;
top: 10px;

}

.dropdown button{


background-color: antiquewhite;
color: white;
padding: 10px 15px;
border: none;
cursor: pointer;


}

.dropdown a{

display: block;
color: black;
text-decoration: none;
padding: 10px 15px;

}

.dropdown .content{

display: none;
position: absolute;
background-color: antiquewhite;
min-width: 100px;
box-shadow: 2px 2px 5px  hsla(0, 0%, 0%, 0.8) ;
}

.dropdown:hover .content{

display: block;

}

.dropdown:hover button{

background-color: hsl(0, 0%, 70%);

}


.dropdown a:hover{

background-color: hsl(0, 0%, 90%);

}


/*Cuadrado de texto motivador*/

.cuadrado {
  width: 1519px;           
  height: 150px;        
  background: rgb(255, 255, 255);       
  border: 1px solid #ffffff; 
}

/*Texto motivador*/

.cuadradito{

left: 310px;
text-align: center;
top: 115px;
position: absolute;
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
  top: 944px;
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