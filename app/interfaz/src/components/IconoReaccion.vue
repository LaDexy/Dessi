<template>

  <!--ESTA ES LA PARTE DEL ICONO DE REACCION EN FORO-->
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
.reaction-icon-container {
  display: inline-block;
  cursor: pointer;
  font-size: 1.2em;
  color: #ccc;
  transition: color 0.2s ease-in-out;
}

.reaction-icon-container .fa-solid {
  color: #2c3e50;
}

.reaction-icon-container:hover {
  color: #1e90ff;
}
</style>