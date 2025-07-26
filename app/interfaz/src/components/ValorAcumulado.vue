<template>

  <!--ESTE ES EL ICONO DE MEDALLA DE TARJETAS DE PERFIL QUE MAS ADELANTE SE IMPLEMENTARA COMO CONTADOR DE DESAFIOS PARTICIPADOS-->
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
.valor-acumulado-display {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  background-color: #e6e6fa;
  border-radius: 20px;
  border: 1px solid #dcdcdc;
  gap: 5px;
  font-size: 0.9em;
}

.icon-reputacion-medalla {
  width: 20px;
  height: 20px;
}

.valor {
  font-weight: bold;
  color: #4a4a4a;
}
</style>