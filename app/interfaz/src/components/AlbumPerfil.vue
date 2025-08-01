<template>
  <transition name="modal-fade">
    <div class="modal-overlay" v-if="show" @click.self="$emit('close')">
      <div class="modal-content">
        <button class="modal-close-button" @click="$emit('close')">&times;</button>
        
        <h3 class="modal-title">Álbum de {{ profileName }}</h3>
        
        <div v-if="album && album.length > 0" class="album-grid">
          <div v-for="(image, index) in album" :key="index" class="album-image-container">
            <img :src="image.url_imagen" :alt="`Imagen de álbum ${index + 1}`" class="album-image">
          </div>
        </div>
        <div v-else class="empty-album-message">
          Este usuario aún no ha subido imágenes a su álbum.
        </div>
        
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'AlbumPerfil',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    profileName: {
      type: String,
      required: true
    },
    album: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close']
};
</script>

<style scoped>

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
.modal-content {
  background-color: white;
  padding: 2.5rem;
  border-radius: 1.25rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 90%;
  width: 700px;
  position: relative;
}
.modal-close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.875rem;
  cursor: pointer;
  color: #ef4444; /* Rojo */
}
.modal-title {
  font-size: 1.875rem;
  font-weight: bold;
  color: #6a0dad; /* Púrpura */
  margin-bottom: 1.5rem;
  text-align: center;
}
.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  max-height: 400px; /* Altura máxima para el scroll */
  overflow-y: auto;
  padding-right: 1rem;
}
.album-image-container {
  position: relative;
  width: 100%;
  padding-top: 100%; /* Proporción 1:1 */
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.album-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.empty-album-message {
  text-align: center;
  color: #6b7280; /* Gris */
  font-style: italic;
  margin-top: 1rem;
}
</style>