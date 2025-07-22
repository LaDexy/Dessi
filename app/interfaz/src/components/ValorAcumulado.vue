<template>
  <div class="Medalla">
    <i class="fa-regular fa-medal" style="color: #cc9e00;"></i>
    <span class="reputacion-valor">{{ reputacion || 0 }}</span>
  </div>
</template>

<script>
export default {
  name: "ValorAcumulado",
  props: {
    reputacion: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style scoped>
.Medalla {
  display: flex;
  align-items: center;
  gap: 3px; /* Reduje un poco el espacio para que esté más cerca del nombre */
  font-size: 0.9em; /* Posiblemente más pequeño para que no ocupe mucho espacio */
  color: #555;
}

.Medalla i {
  color: #FFD700; /* Dorado para la medalla */
  font-size: 1.1em; /* Ajusta el tamaño del icono */
}

.reputacion-valor {
  font-weight: bold;
  color: #007bff;
}
</style>