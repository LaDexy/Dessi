<template>
  <div>
    <div class="Barra">
      </div>
  </div>
</template>

<script>
export default {
  name: "BarraPerfil",
};
</script>

<style scoped>


/* Rectángulo de barra superior */
.Barra {
  position: relative;
  width: 100%; /* Ocupa el 100% del ancho disponible */
  height: 180px; /* Altura fija para la barra */
  background-color: hsl(300, 29%, 78%); /* Tu color rosado */
  /* Eliminamos el margin-top para que la barra esté pegada a la parte superior */
  margin-top: 0; 
  box-sizing: border-box; /* Asegura que el padding se incluya en el ancho/alto */
}
</style>
