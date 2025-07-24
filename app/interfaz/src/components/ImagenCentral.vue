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
margin: 30px auto;
z-index: 2;
height: auto;
display: block;


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
width: 180px;
max-width: 50%;
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

/* Media Queries para Responsividad */

/* Para pantallas medianas (ej. tablets, 768px y abajo) */
@media (max-width: 768px) {
  article {
    width: 280px; /* Reduce el ancho base de la "carta" */
    margin-top: 25px; /* Ajusta el margen superior */
  }

  article img:first-child {
    border-radius: 10px; /* Reduce ligeramente el redondeo */
  }

  article img:last-child {
    width: 150px; /* Reduce el tamaño del icono */
    padding: 12px;
  }
}

/* Para pantallas pequeñas (ej. móviles, 480px y abajo) */
@media (max-width: 480px) {
  article {
    width: 240px; /* Reduce aún más el ancho de la "carta" */
    margin-top: 20px;
  }

  article img:first-child {
    border-radius: 8px;
  }

  article img:last-child {
    width: 120px; /* Tamaño más adecuado para el icono en móviles */
    padding: 10px;
  }

  article:hover {
    /* Puedes ajustar o incluso deshabilitar el efecto 3D si lo consideras demasiado para móviles */
    /* transform: perspective(200px) rotateX(8deg) translateY(-3%) translateZ(0); */
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); /* Sombra más sutil */
  }
}

/* Consideración para pantallas muy pequeñas si el ancho base es restrictivo */
@media (max-width: 350px) { /* Si el ancho del dispositivo es menor que el width base del artículo */
  article {
    width: 100%; /* Ocupa todo el ancho si el dispositivo es muy estrecho */
    max-width: 95%; /* Pequeño padding si el 100% es demasiado */
  }
}



</style>