<template>
  <div class="reaction-icon-container">
    <i :class="[isLiked ? 'fa-solid fa-thumbs-up' : 'fa-regular fa-thumbs-up']"></i>
  </div>
</template>

<script>
export default {
  name: "IconoReaccion",
  props: {
    isLiked: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
/* Puedes añadir tus estilos específicos aquí si quieres que el icono tenga un tamaño o color particular */
.reaction-icon-container {
  display: inline-block; /* Para que el div no ocupe todo el ancho */
  cursor: pointer; /* Indicar que es clickeable */
  font-size: 1.2em; /* Ajusta el tamaño si es necesario */
  color: #ccc; /* Color por defecto (gris claro para no reaccionado) */
  transition: color 0.2s ease-in-out; /* Transición suave para el color */
}

/* Estilo cuando el pulgar está "gustado" (oscuro o un color de énfasis) */
.reaction-icon-container .fa-solid {
  color: #2c3e50; /* Un color oscuro para el pulgar lleno */
  /* O podrías usar un color de énfasis, como un azul: color: #1e90ff; */
}

/* Efecto hover */
.reaction-icon-container:hover {
  color: #1e90ff; /* Un color al pasar el mouse */
}
</style>