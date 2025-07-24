<template>

<div>

<!--Cuadrado con texto motivador inicial-->
    <div class="cuadrado">

        <div class="cuadradito">
            <h3>Transforma tu idea en impacto visual. Tu socio creativo está aquí</h3>
        </div>

    </div>


</div>


</template>

<script>

export default {
    name: "TextoMotivador"
  
}

</script>

<style scoped>
/* Contenedor principal del texto motivador (el "cuadrado") */
.cuadrado {
  /* Eliminamos width fijo y height fijo */
  width: 100%; /* Ocupa el 100% del ancho de su contenedor padre */
  padding: 40px 20px; /* Un padding generoso para dar espacio alrededor del texto */
  background-color: #ffffff; /* Tu color de fondo blanco */
  border: 1px solid #ffffff; /* Tu borde blanco (casi invisible si el fondo es blanco) */
  box-sizing: border-box; /* Asegura que el padding no agregue ancho extra */
  display: flex; /* Usamos Flexbox para centrar el contenido */
  justify-content: center; /* Centra horizontalmente el contenido (cuadradito) */
  align-items: center; /* Centra verticalmente el contenido (cuadradito) */
  min-height: 150px; /* Establece una altura mínima, pero permite que crezca si el texto es muy largo */
}

/* Contenedor del texto motivador (el "cuadradito") */
.cuadradito {
  /* Eliminamos position: absolute y sus propiedades asociadas */
  /* Eliminamos left y top, ya que Flexbox del padre lo posiciona */
  text-align: center; /* Centra el texto dentro de este div */
  color: #000000; /* Color de texto negro */
  max-width: 800px; /* Limita el ancho máximo del texto para que no se extienda demasiado en pantallas grandes */
  margin: 0 auto; /* Centra el div horizontalmente si es más pequeño que su padre */
}

/* Estilos para el texto <h3> */
.cuadradito h3 {
  font-size: 2.2rem; /* Tamaño de fuente relativo (2.2 veces el tamaño de fuente base) */
  line-height: 1.4; /* Espaciado entre líneas para mejor legibilidad */
  margin: 0; /* Elimina el margen por defecto del h3 */
  font-weight: normal; /* Podrías ponerlo normal si quieres menos énfasis, o bold si quieres mucho */
  color: #333; /* Un negro más suave que el 000 para mejor estética */
}

/* Media Queries para Responsividad */

/* Para pantallas medianas (ej. tablets, 768px y abajo) */
@media (max-width: 768px) {
  .cuadrado {
    padding: 30px 15px; /* Reduce el padding en pantallas más pequeñas */
    min-height: 120px; /* Ajusta la altura mínima */
  }

  .cuadradito h3 {
    font-size: 1.8rem; /* Reduce el tamaño de la fuente */
  }
}

/* Para pantallas pequeñas (ej. móviles, 480px y abajo) */
@media (max-width: 480px) {
  .cuadrado {
    padding: 20px 10px; /* Reduce aún más el padding */
    min-height: 100px; /* Ajusta la altura mínima para móviles */
  }

  .cuadradito h3 {
    font-size: 1.4rem; /* Tamaño de fuente adecuado para móviles */
    line-height: 1.3;
  }
}

</style>