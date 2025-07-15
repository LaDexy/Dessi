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
/*Circulo de referencia para foto de perfil*/

.Perfil .circulo {
  position: absolute;
  width: 100px;
  height: 100px;
  background-color: rgb(199, 127, 199);
  border-radius: 50%;
  left: 700px;
  top: 50px;
}
</style>
