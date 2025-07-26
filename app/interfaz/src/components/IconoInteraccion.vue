<template>

  <!--ESTA ES LA PARTE DEL ICONO DE CORAZCON DE TARJETA DE PERFIL DONDE SE AGREGARA FUNCION DE LIKES ACUMULADOS EN FOROS-->
  <div class="interacciones-foro-display">
    <i class="fa-solid fa-heart-circle-check icon-heart" :style="{ color: heartColor }"></i>
    <span class="count">{{ totalLikesForo }}</span>
  </div>
</template>

<script>
export default {
  name: "IconoInteraccion",
  props: {
    totalLikesForo: {
      type: Number,
      required: true,
      default: 0
    },
    heartColor: {
      type: String,
      default: '#B197FC'
    }
  }
};
</script>

<style scoped>
.interacciones-foro-display {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  background-color: #f8f0ff;
  border-radius: 20px;
  border: 1px solid #dcd0e7;
  gap: 5px;
  font-size: 0.9em;
  white-space: nowrap;
}

.icon-heart {
  font-size: 20px;
}

.count {
  font-weight: bold;
  color: #6c5ce7;
}
</style>