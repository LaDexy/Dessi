<template>
  <!--ESTE ES EL ICONO DE LA CAMARA QUE PERMITE A USUARIO SUBIR IMAGENES A SU PORTAFOLIO-->
  <div class="camera-icon-container" @click="openFileInput">
    <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;" accept="image/*">
    <i class="fa-solid fa-camera fa-2xl"></i>
  </div>
</template>

<script>
export default {
  name: "IconoCamara",
  methods: {
    openFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.$emit('imageSelected', file);
      }
      event.target.value = '';
    }
  }
}
</script>

<style scoped> 
.camera-icon-container {
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
  background-color: hsl(300, 29%, 78%); 
  transform: scale(1.05); 
}

.camera-icon-container:active {
  background-color: hsl(300, 29%, 78%); 
  transform: scale(0.95); 
}

.camera-icon-container i {
  font-size: 1.8em; 
}
</style>