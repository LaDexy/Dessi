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

<style scoped> 
.camera-icon-container {
  /* Estilos para el contenedor del icono, simulando un botón circular */
  position: relative;
  background-color: #9c27b0; 
  color: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex; 
  justify-content: center;
  align-items: center; 
  cursor: pointer; 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); 
  transition: background-color 0.3s ease, transform 0.2s ease; 
  left: 48%;
  
}

.camera-icon-container:hover {
  background-color:  hsl(300, 29%, 78%); 
  transform: scale(1.05); 
}

.camera-icon-container:active {
  background-color:  hsl(300, 29%, 78%); 
  transform: scale(0.95); 
}

/* Estilos para el icono de la cámara */
.camera-icon-container i {
  
  font-size: 1.8em; 
}
</style>