<template>
  <div class="album-container">
    <div class="portfolio-grid">
      <div v-for="project in projects" :key="project.id_proyecto" class="portfolio-item">
        <img v-if="project.imagenes && project.imagenes.length > 0" :src="project.imagenes[0].url_imagen" :alt="project.titulo_proyecto">
        <div v-else class="empty-project-placeholder">No Image</div>
      </div>
    </div>
    <p v-if="projects.length === 0" class="no-projects-message">
      ¡Tu portafolio está vacío! Presiona el icono de la cámara para empezar a subir tus trabajos.
    </p>
  </div>
</template>

<script>
export default {
  name: "PortafolioPerfil",
  props: {
    projects: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.album-container {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); /* Cuadrícula responsiva */
  gap: 15px; /* Espacio entre los elementos */
  justify-items: center;
  align-items: center;
}

.portfolio-item {
  width: 150px; /* Ancho fijo para cada elemento del portafolio */
  height: 150px; /* Alto fijo para cada elemento del portafolio */
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden; /* Asegura que la imagen no se desborde */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.portfolio-item img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Cubre el área del elemento */
}

.empty-project-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  color: #888;
  font-size: 0.9em;
  text-align: center;
}

.no-projects-message {
  text-align: center;
  color: #777;
  margin-top: 30px;
  font-style: italic;
}
</style>