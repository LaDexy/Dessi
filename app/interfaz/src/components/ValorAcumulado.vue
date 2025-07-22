<template>
  <div class="valor-acumulado-display">
    <i class="fa-solid fa-medal" style="color: #FFD43B;"></i>
    <span class="valor">{{ reputacion }}</span>
  </div>
</template>

<script>
export default {
  name: 'ValorAcumulado',
  props: {
    reputacion: {
      type: Number,
      required: true,
      default: 0
    }
  }
};
</script>

<style scoped>
/* Estos estilos son para el componente ValorAcumulado.vue en sí */
.valor-acumulado-display {
  display: flex;
  align-items: center;
  /* Centrar horizontalmente si el contenedor padre es flex o grid */
  justify-content: center; 
  /* Puedes ajustar el espacio interior si lo necesitas */
  padding: 3px 8px; 
  background-color: #e6e6fa; /* Fondo suave para destacarlo */
  border-radius: 20px;
  border: 1px solid #dcdcdc;
  gap: 5px; /* Espacio entre el icono y el número */
  font-size: 0.9em; /* Reduce el tamaño para que encaje bien al lado del nombre */
}

.icon-reputacion-medalla {
  width: 20px; /* Tamaño más pequeño para el icono de la medalla */
  height: 20px;
}

.valor {
  font-weight: bold;
  color: #4a4a4a;
}
</style>