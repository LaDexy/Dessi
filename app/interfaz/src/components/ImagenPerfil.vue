<template>
  <div>
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
  display: flex;
  justify-content: center;
  /* No margin-top aquí; el componente padre (PaginaPerfil) manejará el espaciado vertical */
}

.circulo {
  position: relative;
  width: 200px; /* Tamaño definitivo del círculo */
  height: 200px;
  background-color: rgb(199, 127, 199); /* Color de fondo del círculo */
  border-radius: 50%; /* Para un círculo perfecto */
  overflow: hidden; /* Recorta la imagen dentro del círculo */
  border: 5px solid white; /* Borde blanco para el círculo */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* Sombra suave */
  display: flex; /* Para centrar la imagen dentro del círculo si es más pequeña */
  justify-content: center;
  align-items: center;
}

.circulo img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Asegura que la imagen cubra el círculo sin distorsionarse */
  border-radius: 50%; /* ¡Importante! También redondea la imagen misma */
}
</style>
