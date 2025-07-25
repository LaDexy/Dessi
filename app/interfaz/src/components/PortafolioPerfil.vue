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
  background-color: #fcfcfc; /* Un fondo muy ligero para el contenedor general */
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* Elementos ligeramente más grandes y más flexibles */
  gap: 20px; /* Más espacio entre los elementos */
  justify-items: center;
  /* align-items: center; - Quitado para permitir que los elementos se estiren si hay diferente contenido, pero si solo son imágenes, puedes dejarlo */
  padding-bottom: 20px; /* Espacio extra al final de la cuadrícula */
}

.portfolio-item {
  width: 100%; /* El ancho lo controla la cuadrícula ahora */
  max-width: 250px; /* Un máximo para que no sean enormes en pantallas grandes */
  height: 180px; /* Alto fijo, ajustado al nuevo ancho */
  border: none; /* Quitamos el borde para un look más limpio */
  border-radius: 12px; /* Bordes más redondeados */
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff; /* Fondo blanco puro para las tarjetas */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08); /* Sombra más pronunciada pero suave */
  transition: transform 0.2s ease, box-shadow 0.2s ease; /* Transición para hover */
  cursor: pointer; /* Indica que pueden ser interactivos */
}

.portfolio-item:hover {
  transform: translateY(-5px); /* Pequeño levantamiento al pasar el ratón */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12); /* Sombra más intensa al pasar el ratón */
}

.portfolio-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block; /* Elimina espacio extra debajo de la imagen si lo hubiera */
}

.empty-project-placeholder {
  display: flex;
  flex-direction: column; /* Para apilar texto y quizás un icono en el futuro */
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #e0e0e0; /* Un gris más neutro */
  color: #616161; /* Color de texto más oscuro */
  font-size: 1em; /* Un poco más grande */
  text-align: center;
  padding: 10px; /* Espaciado interno */
  box-sizing: border-box; /* Asegura que el padding no aumente el tamaño total */
}

.no-projects-message {
  text-align: center;
  color: #8d6e63; /* Un color de texto más cálido y amigable */
  margin-top: 40px; /* Más espacio superior */
  margin-bottom: 20px; /* Espacio inferior */
  font-size: 1.1em; /* Mensaje un poco más grande */
  line-height: 1.5; /* Mejor legibilidad */
  max-width: 600px; /* Limita el ancho para que no se extienda demasiado en pantallas grandes */
  margin-left: auto; /* Centra el mensaje */
  margin-right: auto; /* Centra el mensaje */
  padding: 0 15px; /* Padding horizontal */
}
</style>