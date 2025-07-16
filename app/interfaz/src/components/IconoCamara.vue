<template>
  <div class="camera-icon-container" @click="openFileInput">
    <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;" accept="image/*">
    <i class="fa-solid fa-camera fa-2xl"></i>
  </div>
</template>

<script>
export default {
  name: "IconoCamara",
  methods: {
    // Abre el selector de archivos cuando se hace clic en el icono
    openFileInput() {
      this.$refs.fileInput.click();
    },
    // Maneja la selección del archivo y emite el evento
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.$emit('imageSelected', file); // Emite el archivo seleccionado al componente padre
      }
      // Limpia el valor del input para permitir seleccionar el mismo archivo si es necesario
      event.target.value = '';
    }
  }
}
</script>

<style>


</style>