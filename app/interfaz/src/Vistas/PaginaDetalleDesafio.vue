<template>
  <div class="challenge-detail-container">
    <!--RENDERIZAR PARA ADAPTACION A NAVEGADOR-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!--ESTAS FUNCIONES CORRESPONDEN A LOS DATOS EMITIDOS PARA LOS DESAFIOS ACTIVOS (FUNCION SOLO VISTA POR DISEÑADOR Y MARKETING)-->
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
  props: ['id'],
  data() {
    return {
      challenge: null,
      isLoading: true,
      errorMessage: '',
      showParticipateModal: false,
      proposalText: '',
      imagenPropuesta: null,
      imagenPropuestaPreview: null,
      showMessageModal: false,
      messageModalTitle: '',
      messageModalMessage: '',
    };
  },
  async created() {
    await this.fetchChallengeDetails();
  },
  computed: {
    canPropose() {
      return this.challenge && this.challenge.estado === 'Activo';
    }
  },

  //FUNCION PARA MOSTRAR DESAFIOS ACTIVOS SOLO PAA PERFILES ESPECIFICOS
  methods: {
    goBack() {
      this.$router.go(-1);
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
      this.proposalText = '';
      this.imagenPropuesta = null;
      this.imagenPropuestaPreview = null;
    },
    closeParticipateModal() {
      this.showParticipateModal = false;
      this.proposalText = '';
      this.imagenPropuesta = null;
      this.imagenPropuestaPreview = null;
    },

    handleImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.imagenPropuesta = file;
        this.imagenPropuestaPreview = URL.createObjectURL(file);
      } else {
        this.imagenPropuesta = null;
        this.imagenPropuestaPreview = null;
      }
    },

    async submitProposal() {
      if (!this.proposalText.trim() && !this.imagenPropuesta) {
        this.showErrorMessage('Error de Propuesta', 'Por favor, ingresa texto para tu propuesta o sube una imagen.');
        return;
      }

      const formData = new FormData();
      formData.append('texto_propuesta', this.proposalText);
      if (this.imagenPropuesta) {
        formData.append('imagenPropuesta', this.imagenPropuesta);
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
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.status === 201) {
          this.showMessage('Propuesta Enviada', '¡Tu propuesta ha sido enviada con éxito! El emprendedor será notificado.');
          this.closeParticipateModal();
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
.challenge-detail-container {
  padding: 30px;
  max-width: 900px;
  margin: 30px auto;
  background-color: #ffffff;
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  color: #333;
  font-family: 'Inter', sans-serif;
}

.back-button {
  display: inline-flex;
  align-items: center;
  padding: 12px 20px;
  background-color: #d9bad9;
  color: #5e1c7d;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 30px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.back-button:hover {
  background-color: #c0a8c0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.back-button i {
    margin-right: 8px;
}

.loading-message, .error-message, .no-challenge-message {
    text-align: center;
    padding: 25px;
    font-size: 1.1em;
    font-weight: 500;
    border-radius: 12px;
    margin-top: 50px;
}

.loading-message {
    background-color: #f0f8ff;
    color: #007bff;
    border: 1px solid #cceeff;
}

.error-message, .no-challenge-message {
    background-color: #ffebee;
    color: #d32f2f;
    border: 1px solid #ef9a9a;
}

.challenge-title {
  font-size: 2.8em;
  color: #5e1c7d;
  margin-bottom: 25px;
  text-align: center;
  font-weight: 800;
  line-height: 1.2;
}

.challenge-description {
  font-size: 1.15em;
  line-height: 1.7;
  color: #444;
  margin-bottom: 40px;
  text-align: justify;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #eee;
}

.challenge-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.info-card {
  background-color: #f2e6f2;
  border: 1px solid #d9bad9;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
}

.info-label {
  font-size: 0.9em;
  color: #6a5b70;
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.info-value {
  font-size: 1.25em;
  color: #5e1c7d;
  font-weight: bold;
}

.challenge-section {
  background-color: #f8f8f8;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 35px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.8em;
  color: #5e1c7d;
  margin-bottom: 20px;
  font-weight: 700;
  border-bottom: 2px solid #d9bad9;
  padding-bottom: 12px;
  text-align: left;
}

.section-content {
  font-size: 1.05em;
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
    color: #5e1c7d;
    margin-right: 5px;
}

.participate-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 18px 25px;
  background-color: #8c52ff;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.3em;
  font-weight: bold;
  transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  margin-top: 30px;
}

.participate-button:hover {
  background-color: #7a3fe0;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.participate-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.participate-button i {
    margin-right: 10px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
  max-width: 650px;
  width: 90%;
  text-align: center;
  position: relative;
  animation: fadeInScale 0.3s ease-out forwards;
  max-height: 90vh;
  overflow-y: auto;
}

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
  top: 20px;
  right: 25px;
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s ease, transform 0.2s ease;
}

.modal-close-button:hover {
  color: #ff3d00;
  transform: rotate(90deg);
}

.modal-title {
  font-size: 2.2em;
  font-weight: bold;
  color: #5e1c7d;
  margin-bottom: 20px;
  line-height: 1.3;
}

.modal-description {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 25px;
}

.proposal-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
  color: #5e1c7d;
  font-size: 1em;
}

.proposal-textarea {
  width: 100%;
  min-height: 180px;
  padding: 15px;
  border: 1px solid #d9bad9;
  border-radius: 10px;
  font-size: 1.05em;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background-color: #fcfcfc;
  color: #333;
}

.proposal-textarea:focus {
  outline: none;
  border-color: #5e1c7d;
  box-shadow: 0 0 0 3px hsla(300, 29%, 78%, 0.6);
}

.file-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d9bad9;
  border-radius: 10px;
  background-color: #f2e6f2;
  cursor: pointer;
  color: #5e1c7d;
  font-weight: 500;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.file-input:hover {
    background-color: #e0d0e0;
    border-color: #c0a8c0;
}

.image-preview-container {
  margin-top: 20px;
  text-align: center;
  border: 2px dashed #d9bad9;
  padding: 15px;
  border-radius: 12px;
  background-color: #fdfdfd;
}

.image-preview {
  max-width: 100%;
  max-height: 250px;
  border: 1px solid #eee;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.submit-proposal-button {
  background-color: #5e1c7d;
  color: white;
  padding: 16px 30px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.2em;
  transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  cursor: pointer;
  border: none;
  width: 100%;
  margin-top: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.submit-proposal-button:hover:not(:disabled) {
  background-color: #4a148c;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.submit-proposal-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
}

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
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  max-width: 450px;
  width: 90%;
  text-align: center;
  position: relative;
  animation: fadeInScale 0.3s ease-out forwards;
}

.message-modal-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #5e1c7d;
  margin-bottom: 20px;
}

.message-modal-message {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 30px;
}

.message-modal-button-close {
  background-color: #d9bad9;
  color: #5e1c7d;
  padding: 12px 25px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.05em;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.message-modal-button-close:hover {
  background-color: #c0a8c0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style>