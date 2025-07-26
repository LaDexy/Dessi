<template>
  <div>
    <!--IMAGEN DE PERFIL-->
    <div class="Perfil">
      <div class="circulo">
        <img :src="profileImageSrc || require('../assets/Usuario.png')" alt="Foto de perfil">
        <input type="file" ref="fileInput" @change="onFileSelected" accept="image/*" style="display: none;">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ImagenPerfil",
  props: {
    profileImageSrc: {
      type: String,
      default: ''
    }
  },
  methods: {
    openFileInput() {
      this.$refs.fileInput.click();
    },
    onFileSelected(event) {
      const file = event.target.files[0];
      if (file) {
        this.$emit('imageSelected', file);
        console.log('Archivo de imagen seleccionado en ImagenPerfil:', file.name);
      }
    }
  }
};
</script>

<style scoped>
.Perfil {
  position: relative; 
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  justify-content: center;
}

.circulo {
  position: absolute;
    width: 200px;
  height: 200px;
  background-color: rgb(199, 127, 199); 
  border-radius: 50%; 
  overflow: hidden; 
  border: 5px solid white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  display: flex; 
  justify-content: center;
  align-items: center;
}

.circulo img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover; 
  border-radius: 50%; 
}
</style>  