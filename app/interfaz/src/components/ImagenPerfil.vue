<template>
  <div>
    <!-- Contenedor principal de la foto de perfil -->
    <div class="Perfil">
      <div class="circulo">
        <!-- La imagen de perfil se muestra dinámicamente -->
        <!-- Si profileImageSrc es nulo o vacío, muestra una imagen por defecto -->
        <img :src="profileImageSrc || require('../assets/Usuario.png')" alt="Foto de perfil">
        
        <!-- Input de tipo archivo oculto -->
        <!-- Este input será activado por un método llamado desde el componente padre -->
        <input type="file" ref="fileInput" @change="onFileSelected" accept="image/*" style="display: none;">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ImagenPerfil",
  props: {
    // Prop para la URL de la imagen de perfil actual
    profileImageSrc: {
      type: String,
      default: '' // Valor por defecto vacío
    }
  },
  methods: {
    // ¡NUEVO! Este método será llamado por el componente padre (PaginaPerfil)
    openFileInput() {
      this.$refs.fileInput.click();
    },
    // Método que se ejecuta cuando se selecciona un archivo
    onFileSelected(event) {
      const file = event.target.files[0]; // Obtiene el primer archivo seleccionado
      if (file) {
        // Emitir un evento al componente padre con el archivo seleccionado
        this.$emit('imageSelected', file);
        console.log('Archivo de imagen seleccionado en ImagenPerfil:', file.name);
      }
    }
  }
};
</script>

<style>
.Perfil {
  display: flex;
  justify-content: center; /* Centra el círculo horizontalmente */
  /* margin-top se manejará en PaginaPerfil para el espaciado general */
}

/* Círculo de referencia para foto de perfil */
.Perfil .circulo {
  position: relative; /* Necesario para posicionar el icono de lápiz sobre él */
  width: 200px;
  height: 200px;
  background-color: rgb(199, 127, 199); /* Tu color de fondo */
  border-radius: 50%; /* ¡CLAVE! Para un círculo perfecto */
  overflow: hidden; /* Recorta la imagen dentro del círculo */
  border: 5px solid white; /* Borde blanco para el círculo */
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3); /* Sombra más pronunciada */
  z-index: 2; /* ¡CLAVE! Asegura que la imagen esté por encima de la barra rosa */
}

.circulo img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Mantiene la imagen cubriendo el círculo, recortando si es necesario */
  border-radius: 50%; /* ¡CLAVE! También redondea la imagen misma */
}
</style>
