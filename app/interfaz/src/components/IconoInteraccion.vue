<template>
  <div class="interacciones-foro-display">
    <i class="fa-solid fa-heart-circle-check icon-heart" :style="{ color: heartColor }"></i>
    <span class="count">{{ totalLikesForo }}</span>
  </div>
</template>

<script>
export default {
  name: "IconoInteraccion", // Asegúrate de que el nombre sea correcto
  props: {
    totalLikesForo: {
      type: Number,
      required: true,
      default: 0
    },
    heartColor: {
      type: String,
      default: '#B197FC' // El color que especificaste
    }
  }
};
</script>

<style scoped>
/* Estos estilos son para que IconoInteraccion se vea como un "badge" */
.interacciones-foro-display {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px; /* Ajusta el padding para que sea similar a ValorAcumulado */
  background-color: #f8f0ff; /* Un color de fondo suave para el badge */
  border-radius: 20px; /* Bordes redondeados */
  border: 1px solid #dcd0e7; /* Borde sutil */
  gap: 5px; /* Espacio entre el icono y el número */
  font-size: 0.9em; /* Tamaño de fuente para el número */
  white-space: nowrap; /* Evita que el texto se rompa */
}

.icon-heart {
  font-size: 20px; /* Tamaño del icono de Font Awesome */
  /* El color ya se aplica desde la prop heartColor */
}

.count {
  font-weight: bold;
  color: #6c5ce7; /* Color del texto del conteo */
}
</style>