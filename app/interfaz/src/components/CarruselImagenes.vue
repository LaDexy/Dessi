<template>
    
<div>

<!--Carrusel de imagenes-->

    <section>

        <img src="../assets/Slider1.jpg" alt="...">
        <img src="../assets/Slider2.jpg" alt="...">
        <img src="../assets/Slider3.jpg" alt="...">

    </section>

</div>

</template>

<script>

export default {
    name: "CarruselImagenes"
  
}

</script>

<style>

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

</style>
