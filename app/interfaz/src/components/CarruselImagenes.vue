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

<style scoped> /* ¡Siempre 'scoped' para evitar conflictos globales! */

/* Contenedor principal del carrusel */
section {
  display: flex;
  width: 100%; /* ¡Cambiado de 1519px fijo a 100% para responsividad! */
  height: 380px; /* Mantendremos la altura fija por ahora, se puede ajustar con media queries si es necesario */
  overflow: hidden; /* Asegura que cualquier desbordamiento (como la sombra o el redondeo) se maneje bien si los hijos se salieran */
  /* Añadido para un sutil borde redondeado general si quieres que el carrusel en sí lo tenga */
  border-radius: 10px; /* Un poco de redondeo para el contenedor principal */
  margin: 20px 0; /* Un pequeño margen arriba y abajo para separarlo de otras secciones */
}

section img {
  width: 0px;
  flex-grow: 1;
  object-fit: cover;
  opacity: 0.9;
  transition: all .5s ease; /* Cambiado de '.5s ease' a 'all .5s ease' para transicionar todas las propiedades */
  
  /* Nuevos estilos */
  border-radius: 10px; /* Redondear bordes de las imágenes */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Sombra sutil por defecto para las imágenes */
}

section img:hover {
  cursor: crosshair;
  width: 300px;
  opacity: 1;
  filter: contrast(120%);
  
  /* Sombra más pronunciada al hacer hover */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3), 0 0 0 5px rgba(255, 255, 255, 0.5); /* Sombra más fuerte y un halo blanco */
  transform: scale(1.01); /* Un pequeño escalado para enfatizar que sobresale */
  z-index: 1; /* Asegura que la imagen con hover esté por encima de sus vecinas */
}

/* Media Queries para Responsividad */

/* Para pantallas medianas (ej. tablets, 768px y abajo) */
@media (max-width: 768px) {
  section {
    height: 300px; /* Reduce la altura del carrusel para pantallas más pequeñas */
    border-radius: 5px; /* Reduce el redondeo general */
    margin: 15px 0; /* Ajusta el margen */
  }

  section img {
    border-radius: 5px; /* Reduce el redondeo de las imágenes */
  }

  /* Consideración para móviles: el efecto 'hover' es difícil en pantallas táctiles.
     Puedes decidir si quieres deshabilitarlo o adaptarlo. Por ahora, lo dejamos.
     Si quisieras deshabilitarlo para pantallas táctiles, podrías usar:
     @media (hover: none) and (pointer: coarse) {
       section img:hover {
         width: auto;
         opacity: 0.9;
         filter: none;
         box-shadow: none;
         transform: none;
         z-index: auto;
       }
     }
  */
}

/* Para pantallas pequeñas (ej. móviles, 480px y abajo) */
@media (max-width: 480px) {
  section {
    height: 220px; /* Altura más adecuada para móviles */
    margin: 10px 0;
  }

  /* En móviles, es posible que no quieras que las imágenes "crezcan" tanto al pasar el ratón
     ya que el ancho es limitado. Puedes ajustar 'width: 300px' en el hover a un porcentaje
     o un valor más pequeño si es necesario, pero `flex-grow` ya lo maneja bien generalmente.
     Si el efecto de hover causa problemas de layout, esta media query sería el lugar para ajustarlo.
     Por ejemplo, podrías reducir `width: 300px` a `width: 200px` o incluso quitarlo
     si el espacio es muy limitado y solo quieres el `opacity` y `filter`.
  */
}

</style>