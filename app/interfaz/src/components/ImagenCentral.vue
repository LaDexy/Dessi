<template>
    
<div>

<!--Imagenes sobresaliente de abajo de carrusel-->
    <article>
        <img src="../assets/Persona.png" alt="...">
        <img src="../assets/si.png" alt="...">
    </article>

</div>

</template>

<script>

export default{

    name: "ImagenCetral"

}

</script>

<style>

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


</style>