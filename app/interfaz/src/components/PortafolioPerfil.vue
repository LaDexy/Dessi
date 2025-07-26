<template>

  <!--ESTA ES LA PARTE DONDE SE CARGAN LAS IMAGENES DE LOS USUARIOS, LA PARTE DE PORTAFOLIO-->
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
  background-color: #fcfcfc;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  justify-items: center;
  padding-bottom: 20px;
}

.portfolio-item {
  width: 100%;
  max-width: 250px;
  height: 180px;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.portfolio-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}

.portfolio-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.empty-project-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #e0e0e0;
  color: #616161;
  font-size: 1em;
  text-align: center;
  padding: 10px;
  box-sizing: border-box;
}

.no-projects-message {
  text-align: center;
  color: #8d6e63;
  margin-top: 40px;
  margin-bottom: 20px;
  font-size: 1.1em;
  line-height: 1.5;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 15px;
}
</style>