<template>
  <div>
    <div class="LapizPerfil" @click="$emit('click')">
      <i class="fa-solid fa-pencil"></i>
    </div>

    <div class="LapizDescripcion">
      <i class="fa-solid fa-pencil"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: "IconoEditar",
  emits: ["click"],
};
</script>

<style>
.LapizPerfil {
  position: absolute;
  top: 130px;
  left: 790px;
  padding: 8px;
}

.LapizDescripcion {
  position: absolute;
  top: 360px;
  left: 955px;
}
</style>
