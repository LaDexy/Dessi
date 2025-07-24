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

    <div v-if="showParticipateModal && canPropose" class="modal-overlay">
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
      // --- NUEVAS VARIABLES PARA LA IMAGEN ---
      imagenPropuesta: null, // Para el archivo de imagen seleccionado
      imagenPropuestaPreview: null, // Para la URL de la vista previa de la imagen
      // --- FIN NUEVAS VARIABLES ---
      showMessageModal: false,
      messageModalTitle: '',
      messageModalMessage: '',
    };
  },
  async created() {
    await this.fetchChallengeDetails();
  },
  computed: {
    // Determina si el usuario logeado es Diseñador o Marketing
    isDesignerOrMarketing() {
      const userType = localStorage.getItem('userType'); // Asume que 'userType' se guarda aquí
      return userType === 'Diseñador' || userType === 'Marketing';
    },
    // Obtiene el ID del usuario logeado
    currentUserId() {
        // Asume que 'userId' se guarda en localStorage
        return parseInt(localStorage.getItem('userId'));
    },
    // Determina si el usuario logeado es el creador de este desafío
    isChallengeCreator() {
        // IMPORTANTE: Tu backend (GET /api/desafios/:id) debe retornar el id_usuario del creador
        // Si tu `challenge` objeto NO tiene `challenge.id_usuario_creador`,
        // necesitarás modificar la consulta SQL en el backend para incluirlo.
        // Por ejemplo, un JOIN con la tabla `emprendedor` para obtener `id_usuario`.
        return this.challenge && this.challenge.id_usuario_creador === this.currentUserId;
    },
    // Determina si el botón "Participar" y el modal deben mostrarse
    canPropose() {
        return this.isDesignerOrMarketing && // Es un tipo de usuario que puede proponer
               !this.isChallengeCreator && // NO es el creador del desafío
               this.challenge && this.challenge.estado === 'Activo'; // El desafío existe y está activo
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
          this.$router.push({ name: 'Principal' });
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

    // --- NUEVO MÉTODO: Manejar la selección de imagen ---
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

    // --- MÉTODO MODIFICADO: Enviar la propuesta con imagen ---
    async submitProposal() {
      // Validar que al menos haya texto o imagen
      if (!this.proposalText.trim() && !this.imagenPropuesta) {
        this.showErrorMessage('Error de Propuesta', 'Por favor, ingresa texto para tu propuesta o sube una imagen.');
        return;
      }

      const formData = new FormData(); // Usamos FormData para enviar archivos
      formData.append('texto_propuesta', this.proposalText);
      if (this.imagenPropuesta) {
        formData.append('imagenPropuesta', this.imagenPropuesta); // 'imagenPropuesta' debe coincidir con el nombre del campo en Multer
      }

      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        this.showErrorMessage('Autenticación Requerida', 'No estás autenticado. Por favor, inicia sesión.');
        this.$router.push({ name: 'Principal' });
        return;
      }

      try {
        const response = await axios.post(
          `http://localhost:4000/api/desafios/${this.challenge.id_desafio}/proponer`,
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
          // Si es un 403 (por ejemplo, por intentar proponer a tu propio desafío), podrías redirigir o dar un mensaje específico.
          if (error.response.status === 403) {
            // this.$router.push({ name: 'AlgunLugar' }); // Puedes redirigir si es necesario
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
/* Estilos existentes */
.challenge-detail-container {
  padding: 20px;
  max-width: 800px;
  margin: 20px auto;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: #333;
}

.back-button {
  display: inline-flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #6c757d; /* Gris */
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s ease;
  margin-bottom: 25px;
}

.back-button:hover {
  background-color: #5a6268;
}

.challenge-title {
  font-size: 2.2em;
  color: #0056b3;
  margin-bottom: 15px;
  text-align: center;
  font-weight: bold;
}

.challenge-description {
  font-size: 1.1em;
  line-height: 1.6;
  color: #555;
  margin-bottom: 30px;
  text-align: justify;
}

.challenge-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.info-card {
  background-color: #f0f8ff; /* Azul muy claro */
  border: 1px solid #cceeff;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.info-label {
  font-size: 0.85em;
  color: #666;
  margin-bottom: 5px;
  font-weight: 600;
}

.info-value {
  font-size: 1.1em;
  color: #333;
  font-weight: bold;
}

.challenge-section {
  background-color: #f8f8f8;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.5em;
  color: #007bff;
  margin-bottom: 15px;
  font-weight: bold;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
}

.section-content {
  font-size: 1em;
  line-height: 1.6;
  color: #444;
  text-align: justify;
}

.contact-info p {
  margin-bottom: 5px;
}

.participate-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 15px 25px;
  background-color: #28a745; /* Verde */
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.2em;
  font-weight: bold;
  transition: background-color 0.2s ease, transform 0.1s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.participate-button:hover {
  background-color: #218838;
  transform: translateY(-2px);
}

.participate-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Estilos para el modal de propuesta */
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
  z-index: 2000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  text-align: center;
  position: relative;
}

.modal-close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
}

.modal-close-button:hover {
  color: #ff4d4f;
}

.modal-title {
  font-size: 1.8em;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.modal-description {
  font-size: 1em;
  color: #555;
  margin-bottom: 20px;
}

/* Estilos para el formulario dentro del modal */
.proposal-form {
  display: flex;
  flex-direction: column;
  gap: 15px; /* Espacio entre los grupos de formulario */
}

.form-group {
  text-align: left; /* Alinea etiquetas y campos a la izquierda */
}

.form-group label {
  display: block; /* Asegura que la etiqueta esté en su propia línea */
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.proposal-textarea {
  width: 100%;
  min-height: 150px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1em;
  resize: vertical;
}

.file-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  cursor: pointer;
}

.image-preview-container {
  margin-top: 15px;
  text-align: center;
  border: 1px dashed #cccccc; /* Un borde punteado para el área de preview */
  padding: 10px;
  border-radius: 8px;
  background-color: #f0f0f0;
}

.image-preview {
  max-width: 100%; /* Asegura que la imagen no se desborde */
  max-height: 200px; /* Limita la altura de la vista previa */
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.submit-proposal-button {
  background-color: #007bff; /* Azul */
  color: white;
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: bold;
  transition: background-color 0.2s ease;
  cursor: pointer;
  border: none;
  width: 100%;
  margin-top: 20px; /* Espacio adicional antes del botón */
}

.submit-proposal-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-proposal-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Estilos para el modal de mensaje genérico (reutilizados) */
.message-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000; /* Asegúrate de que esté por encima de otros modales */
}

.message-modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
  max-width: 400px;
  width: 90%;
  text-align: center;
  position: relative;
}

.message-modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.message-modal-message {
  font-size: 1rem;
  color: #555;
  margin-bottom: 20px;
}

.message-modal-button-close {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out;
  cursor: pointer;
  border: none;
}

.message-modal-button-close:hover {
  background-color: #0056b3;
}
</style>