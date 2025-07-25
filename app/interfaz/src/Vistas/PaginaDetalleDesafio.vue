<template>
  <div class="challenge-detail-container">
    <button @click="goBack" class="back-button">
      <i class="fas fa-arrow-left mr-2"></i> Volver a Desafíos
    </button>

    <div v-if="isLoading" class="loading-message">Cargando detalles del desafío...</div>
    <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-else-if="challenge" class="challenge-content">
      <h1 class="challenge-title">{{ challenge.nombre_desafio }}</h1>
      <p class="challenge-description">{{ challenge.descripcion_desafio }}</p>

      <div class="challenge-info-grid">
        <div class="info-card">
          <p class="info-label">Emprendedor:</p>
          <p class="info-value">{{ challenge.nombre_usuario_emprendedor }}</p>
        </div>
        <div class="info-card">
          <p class="info-label">Estado:</p>
          <p class="info-value">{{ challenge.estado }}</p>
        </div>
        <div class="info-card">
          <p class="info-label">Duración:</p>
          <p class="info-value">{{ challenge.dias_duracion }} días</p>
        </div>
        <div class="info-card">
          <p class="info-label">Fecha de Creación:</p>
          <p class="info-value">{{ formatDate(challenge.fecha_creacion) }}</p>
        </div>
        <div class="info-card">
          <p class="info-label">Fecha Límite:</p>
          <p class="info-value">{{ formatDate(challenge.fecha_fin) }}</p>
        </div>
      </div>

      <div class="challenge-section">
        <h3 class="section-title">Beneficios:</h3>
        <p class="section-content">{{ challenge.beneficios }}</p>
      </div>

      <div class="challenge-section">
        <h3 class="section-title">Contacto del Emprendedor:</h3>
        <div class="contact-info">
          <p v-if="challenge.email_emprendedor"><strong>Email:</strong> {{ challenge.email_emprendedor }}</p>
        </div>
      </div>

      <button v-if="canPropose" @click="openParticipateModal" class="participate-button">
        <i class="fas fa-paper-plane mr-2"></i> Participar en este Desafío
      </button>
    </div>
    <div v-else class="no-challenge-message">
      No se pudo cargar la información del desafío.
    </div>

    <div v-if="showParticipateModal && challenge && challenge.estado === 'Activo'" class="modal-overlay">
      <div class="modal-content">
        <button @click="closeParticipateModal" class="modal-close-button">&times;</button>
        <h3 class="modal-title">Enviar Propuesta para "{{ challenge.nombre_desafio }}"</h3>
        <p class="modal-description">Describe tu propuesta detallada:</p>
        <form @submit.prevent="submitProposal" class="proposal-form">
          <div class="form-group">
            <label for="proposalTextarea">Texto de tu propuesta:</label>
            <textarea
              id="proposalTextarea"
              v-model="proposalText"
              class="proposal-textarea"
              placeholder="Tu propuesta..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="imagenPropuesta">Sube una imagen (opcional):</label>
            <input
              type="file"
              id="imagenPropuesta"
              accept="image/*"
              @change="handleImageChange"
              class="file-input"
            />
            <div v-if="imagenPropuestaPreview" class="image-preview-container">
              <img :src="imagenPropuestaPreview" alt="Vista previa de la propuesta" class="image-preview"/>
            </div>
          </div>

          <button type="submit" :disabled="!proposalText.trim() && !imagenPropuesta" class="submit-proposal-button">
            Enviar Propuesta
          </button>
        </form>
      </div>
    </div>

    <div v-if="showMessageModal" class="message-modal-overlay">
      <div class="message-modal-content">
        <h3 class="message-modal-title">{{ messageModalTitle }}</h3>
        <p class="message-modal-message">{{ messageModalMessage }}</p>
        <div class="message-modal-actions">
          <button @click="closeMessageModal" class="message-modal-button-close">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PaginaDetalleDesafio',
  props: ['id'], // Recibe el ID del desafío como una prop de la ruta
  data() {
    return {
      challenge: null,
      isLoading: true,
      errorMessage: '',
      showParticipateModal: false,
      proposalText: '',
      imagenPropuesta: null, // Para el archivo de imagen seleccionado
      imagenPropuestaPreview: null, // Para la URL de la vista previa de la imagen
      showMessageModal: false,
      messageModalTitle: '',
      messageModalMessage: '',
    };
  },
  async created() {
    await this.fetchChallengeDetails();
  },
  computed: {
    // La lógica simplificada: el botón "Participar" solo se muestra si el desafío está cargado y su estado es "Activo".
    // Asumimos que la autorización de rol (Diseñador/Marketing) se maneja en el router de Vue o en el backend.
    canPropose() {
      return this.challenge && this.challenge.estado === 'Activo';
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1); // Vuelve a la página anterior (PaginaDesafios)
    },
    async fetchChallengeDetails() {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          this.errorMessage = 'No hay token de autenticación. Por favor, inicia sesión.';
          this.$router.push({ name: 'Principal' }); // Redirige a la página principal si no hay token
          return;
        }

        const response = await axios.get(`http://localhost:4000/api/desafios/${this.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200) {
          this.challenge = response.data;
          console.log('Detalles del desafío cargados:', this.challenge);
        } else {
          this.errorMessage = 'Error al cargar los detalles del desafío: ' + (response.data.message || 'Error desconocido.');
          console.error('Error al cargar detalles del desafío:', response.status, response.data);
        }
      } catch (error) {
        console.error('Error en la solicitud para obtener detalles del desafío:', error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.errorMessage = 'Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión.';
          this.$router.push({ name: 'Principal' });
        } else if (error.response && error.response.status === 404) {
          this.errorMessage = 'Desafío no encontrado.';
        } else {
          this.errorMessage = 'Error de conexión con el servidor o al obtener detalles del desafío.';
        }
      } finally {
        this.isLoading = false;
      }
    },
    openParticipateModal() {
      this.showParticipateModal = true;
      this.proposalText = ''; // Limpiar el texto de la propuesta al abrir
      this.imagenPropuesta = null; // Limpiar la imagen seleccionada
      this.imagenPropuestaPreview = null; // Limpiar la vista previa
    },
    closeParticipateModal() {
      this.showParticipateModal = false;
      this.proposalText = ''; // Limpiar el texto de la propuesta al cerrar
      this.imagenPropuesta = null; // Limpiar la imagen seleccionada
      this.imagenPropuestaPreview = null; // Limpiar la vista previa
    },

    // Manejar la selección de imagen
    handleImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.imagenPropuesta = file;
        this.imagenPropuestaPreview = URL.createObjectURL(file); // Crea una URL para la vista previa
      } else {
        this.imagenPropuesta = null;
        this.imagenPropuestaPreview = null;
      }
    },

    // Enviar la propuesta con imagen
    async submitProposal() {
      // Validar que al menos haya texto o imagen
      if (!this.proposalText.trim() && !this.imagenPropuesta) {
        this.showErrorMessage('Error de Propuesta', 'Por favor, ingresa texto para tu propuesta o sube una imagen.');
        return;
      }

      const formData = new FormData(); // Usamos FormData para enviar archivos
      formData.append('texto_propuesta', this.proposalText);
      if (this.imagenPropuesta) {
        formData.append('imagenPropuesta', this.imagenPropuesta); // 'imagenPropuesta' debe coincidir con el nombre del campo en Multer del backend
      }

      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        this.showErrorMessage('Autenticación Requerida', 'No estás autenticado. Por favor, inicia sesión.');
        this.$router.push({ name: 'Principal' });
        return;
      }

      try {
        const response = await axios.post(
          `http://localhost:4000/api/desafios/${this.challenge.id_desafio}/proponer`, // ¡Revisa esta URL! En tu código Express era /propuestas, no /proponer
          formData, // Enviamos el FormData
          {
            headers: {
              'Content-Type': 'multipart/form-data', // MUY IMPORTANTE para enviar archivos
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.status === 201) {
          this.showMessage('Propuesta Enviada', '¡Tu propuesta ha sido enviada con éxito! El emprendedor será notificado.');
          this.closeParticipateModal(); // Cierra el modal de propuesta
          // Limpiar el formulario después de un envío exitoso
          this.proposalText = '';
          this.imagenPropuesta = null;
          this.imagenPropuestaPreview = null;
        } else {
          this.showErrorMessage('Error al Enviar Propuesta', response.data.message || 'Error desconocido al enviar propuesta.');
        }
      } catch (error) {
        console.error('Error al enviar propuesta:', error);
        if (error.response) {
          this.showErrorMessage('Error al Enviar Propuesta', error.response.data.message || 'Error en el servidor al enviar propuesta.');
          // Si tu backend devuelve 403 (Forbidden) por alguna razón, podrías manejarlo aquí
          if (error.response.status === 403) {
            // Ejemplo: this.showErrorMessage('Acceso Denegado', 'No tienes permiso para enviar propuestas a este desafío.');
          }
        } else {
          this.showErrorMessage('Error de Conexión', 'No se pudo conectar con el servidor. Inténtalo de nuevo.');
        }
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    showMessage(title, message) {
      this.messageModalTitle = title;
      this.messageModalMessage = message;
      this.showMessageModal = true;
    },
    showErrorMessage(title, message) {
      this.messageModalTitle = title;
      this.messageModalMessage = message;
      this.showMessageModal = true;
    },
    closeMessageModal() {
      this.showMessageModal = false;
      this.messageModalTitle = '';
      this.messageModalMessage = '';
    },
  }
};
</script>

<style scoped>
/* Colores de referencia:
   - hsl(300, 29%, 78%) se traduce aproximadamente a #d9bad9 (Rosa-morado pastel)
   - #5e1c7d (Morado oscuro)
*/

.challenge-detail-container {
  padding: 30px; /* Aumentar el padding para más espacio */
  max-width: 900px; /* Ligeramente más ancho */
  margin: 30px auto; /* Centrar y dar más margen vertical */
  background-color: #ffffff; /* Fondo blanco puro */
  border-radius: 18px; /* Bordes más redondeados */
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); /* Sombra más pronunciada y suave */
  color: #333;
  font-family: 'Inter', sans-serif; /* Consistencia en la fuente */
}

.back-button {
  display: inline-flex;
  align-items: center;
  padding: 12px 20px; /* Más padding */
  background-color: #d9bad9; /* Color pastel para el botón de volver */
  color: #5e1c7d; /* Texto morado oscuro */
  border: none;
  border-radius: 10px; /* Bordes redondeados */
  cursor: pointer;
  font-size: 1em; /* Un poco más grande */
  font-weight: 600; /* Seminegrita */
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 30px; /* Más espacio debajo */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.back-button:hover {
  background-color: #c0a8c0; /* Un poco más oscuro al pasar el ratón */
  transform: translateY(-2px); /* Efecto de levantamiento */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.back-button i {
    margin-right: 8px; /* Espacio entre icono y texto */
}

/* Mensajes de estado (cargando, error, sin desafío) */
.loading-message, .error-message, .no-challenge-message {
    text-align: center;
    padding: 25px;
    font-size: 1.1em;
    font-weight: 500;
    border-radius: 12px;
    margin-top: 50px;
}

.loading-message {
    background-color: #f0f8ff; /* Azul muy claro */
    color: #007bff; /* Azul */
    border: 1px solid #cceeff;
}

.error-message, .no-challenge-message {
    background-color: #ffebee; /* Rojo muy claro */
    color: #d32f2f; /* Rojo oscuro */
    border: 1px solid #ef9a9a;
}


/* Contenido del desafío */
.challenge-content {
  /* No se necesitan estilos directos aquí si los hijos ya están bien espaciados */
}

.challenge-title {
  font-size: 2.8em; /* Título más grande */
  color: #5e1c7d; /* Morado oscuro para el título principal */
  margin-bottom: 25px;
  text-align: center;
  font-weight: 800; /* Extra bold */
  line-height: 1.2;
}

.challenge-description {
  font-size: 1.15em; /* Descripción un poco más grande */
  line-height: 1.7;
  color: #444; /* Gris oscuro para el texto */
  margin-bottom: 40px; /* Más espacio */
  text-align: justify;
  background-color: #f9f9f9; /* Fondo ligero para la descripción */
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #eee;
}

.challenge-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); /* Columnas un poco más anchas */
  gap: 20px; /* Más espacio entre tarjetas */
  margin-bottom: 40px;
}

.info-card {
  background-color: #f2e6f2; /* Rosa-morado pastel muy suave */
  border: 1px solid #d9bad9; /* Borde pastel */
  border-radius: 12px; /* Más redondeado */
  padding: 20px; /* Más padding */
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); /* Sombra más definida */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.info-card:hover {
  transform: translateY(-5px); /* Efecto de levantamiento al pasar el ratón */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
}

.info-label {
  font-size: 0.9em; /* Un poco más grande */
  color: #6a5b70; /* Un gris-morado para las etiquetas */
  margin-bottom: 8px; /* Más espacio */
  font-weight: 600;
  text-transform: uppercase; /* Mayúsculas para las etiquetas */
}

.info-value {
  font-size: 1.25em; /* Valor más grande y destacado */
  color: #5e1c7d; /* Morado oscuro para los valores importantes */
  font-weight: bold;
}

.challenge-section {
  background-color: #f8f8f8; /* Fondo suave para secciones */
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 25px; /* Más padding */
  margin-bottom: 35px; /* Más espacio */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.8em; /* Título de sección más grande */
  color: #5e1c7d; /* Morado oscuro para títulos de sección */
  margin-bottom: 20px;
  font-weight: 700; /* Negrita */
  border-bottom: 2px solid #d9bad9; /* Borde inferior pastel */
  padding-bottom: 12px; /* Más padding inferior */
  text-align: left; /* Alineación a la izquierda */
}

.section-content {
  font-size: 1.05em; /* Contenido ligeramente más grande */
  line-height: 1.7;
  color: #444;
  text-align: justify;
}

.contact-info p {
  margin-bottom: 8px;
  font-size: 1.05em;
  color: #444;
}

.contact-info strong {
    color: #5e1c7d; /* Morado oscuro para el "Email:" */
    margin-right: 5px;
}


.participate-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 18px 25px; /* Botón más grande */
  background-color: #8c52ff; /* Un morado vibrante para la acción principal */
  color: white;
  border: none;
  border-radius: 12px; /* Bordes consistentes */
  cursor: pointer;
  font-size: 1.3em; /* Texto más grande */
  font-weight: bold;
  transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  margin-top: 30px; /* Espacio superior */
}

.participate-button:hover {
  background-color: #7a3fe0; /* Morado más oscuro al pasar el ratón */
  transform: translateY(-3px); /* Efecto de levantamiento más pronunciado */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.participate-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.participate-button i {
    margin-right: 10px; /* Espacio entre icono y texto */
}


/* Estilos para el modal de propuesta */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* Fondo más oscuro para el overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px); /* Suave desenfoque */
}

.modal-content {
  background-color: white;
  padding: 40px; /* Más padding */
  border-radius: 20px; /* Más redondeado */
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4); /* Sombra más fuerte */
  max-width: 650px; /* Un poco más ancho */
  width: 90%;
  text-align: center;
  position: relative;
  animation: fadeInScale 0.3s ease-out forwards; /* Animación de entrada */
  max-height: 90vh; /* Permite scroll si el contenido es muy largo */
  overflow-y: auto; /* Habilitar scroll */
}

/* Animación para modales (reutilizada) */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-close-button {
  position: absolute;
  top: 20px; /* Ajustar posición */
  right: 25px; /* Ajustar posición */
  background: none;
  border: none;
  font-size: 32px; /* Más grande */
  cursor: pointer;
  color: #666; /* Un gris más suave */
  transition: color 0.2s ease, transform 0.2s ease;
}

.modal-close-button:hover {
  color: #ff3d00; /* Naranja rojizo para cerrar */
  transform: rotate(90deg);
}

.modal-title {
  font-size: 2.2em; /* Título de modal más grande */
  font-weight: bold;
  color: #5e1c7d; /* Morado oscuro para títulos de modal */
  margin-bottom: 20px;
  line-height: 1.3;
}

.modal-description {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 25px;
}

/* Estilos para el formulario dentro del modal */
.proposal-form {
  display: flex;
  flex-direction: column;
  gap: 20px; /* Más espacio entre grupos de formulario */
}

.form-group {
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 10px; /* Más espacio */
  font-weight: bold;
  color: #5e1c7d; /* Morado oscuro para etiquetas del modal */
  font-size: 1em;
}

.proposal-textarea {
  width: 100%;
  min-height: 180px; /* Altura mínima mayor */
  padding: 15px; /* Más padding */
  border: 1px solid #d9bad9; /* Borde pastel */
  border-radius: 10px; /* Más redondeado */
  font-size: 1.05em;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background-color: #fcfcfc;
  color: #333;
}

.proposal-textarea:focus {
  outline: none;
  border-color: #5e1c7d; /* Morado oscuro al enfocar */
  box-shadow: 0 0 0 3px hsla(300, 29%, 78%, 0.6); /* Sombra de enfoque pastel */
}

.file-input {
  width: 100%;
  padding: 12px; /* Más padding */
  border: 1px solid #d9bad9;
  border-radius: 10px;
  background-color: #f2e6f2; /* Fondo pastel suave */
  cursor: pointer;
  color: #5e1c7d; /* Texto morado oscuro */
  font-weight: 500;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.file-input:hover {
    background-color: #e0d0e0;
    border-color: #c0a8c0;
}

.image-preview-container {
  margin-top: 20px; /* Más espacio */
  text-align: center;
  border: 2px dashed #d9bad9; /* Borde punteado pastel */
  padding: 15px;
  border-radius: 12px;
  background-color: #fdfdfd;
}

.image-preview {
  max-width: 100%;
  max-height: 250px; /* Altura máxima de la vista previa */
  border: 1px solid #eee;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.submit-proposal-button {
  background-color: #5e1c7d; /* Morado oscuro para el botón de enviar */
  color: white;
  padding: 16px 30px; /* Más padding */
  border-radius: 12px; /* Más redondeado */
  font-weight: bold;
  font-size: 1.2em; /* Texto más grande */
  transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  cursor: pointer;
  border: none;
  width: 100%;
  margin-top: 25px; /* Más espacio */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.submit-proposal-button:hover:not(:disabled) {
  background-color: #4a148c; /* Morado más oscuro al pasar el ratón */
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.submit-proposal-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
}

/* Estilos para el modal de mensaje genérico (reutilizados y actualizados) */
.message-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  backdrop-filter: blur(4px);
}

.message-modal-content {
  background-color: white;
  padding: 30px; /* Más padding */
  border-radius: 20px; /* Más redondeado */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35); /* Sombra más fuerte */
  max-width: 450px; /* Un poco más ancho */
  width: 90%;
  text-align: center;
  position: relative;
  animation: fadeInScale 0.3s ease-out forwards;
}

.message-modal-title {
  font-size: 1.8rem; /* Título más grande */
  font-weight: bold;
  color: #5e1c7d; /* Morado oscuro */
  margin-bottom: 20px;
}

.message-modal-message {
  font-size: 1.1rem; /* Mensaje más grande */
  color: #555;
  margin-bottom: 30px;
}

.message-modal-button-close {
  background-color: #d9bad9; /* Pastel para el botón de cerrar */
  color: #5e1c7d; /* Texto morado oscuro */
  padding: 12px 25px; /* Más padding */
  border-radius: 10px; /* Más redondeado */
  font-weight: 600;
  font-size: 1.05em;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.message-modal-button-close:hover {
  background-color: #c0a8c0; /* Un poco más oscuro */
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style>