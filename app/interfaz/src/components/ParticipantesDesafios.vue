<template>
  <div class="modal-overlay" @click.self="cerrarModalDetalle">
    <div class="modal-content-detail">
      <span class="close-button" @click="cerrarModalDetalle">&times;</span>
      <div v-if="isLoadingDetail" class="loading-message-detail">Cargando detalles del desafío y participantes...</div>
      <div v-else-if="detailErrorMessage" class="error-message-detail">{{ detailErrorMessage }}</div>
      <div v-else-if="challengeDetail" class="challenge-detail-view">
        <h2 class="detail-title">{{ challengeDetail.nombre_desafio }}</h2>
        <p class="detail-description">{{ challengeDetail.descripcion_desafio }}</p>

        <div class="detail-info-grid">
          <div class="info-item"><p><strong>Estado:</strong> {{ challengeDetail.estado }}</p></div>
          <div class="info-item"><p><strong>Duración:</strong> {{ challengeDetail.dias_duracion }} días</p></div>
          <div class="info-item"><p><strong>Creado el:</strong> {{ formatDate(challengeDetail.fecha_creacion) }}</p></div>
          <div class="info-item"><p><strong>Fecha Fin:</strong> {{ formatDate(challengeDetail.fecha_fin) }}</p></div>
          <div class="info-item full-width"><p><strong>Beneficios:</strong> {{ challengeDetail.beneficios || 'No especificados' }}</p></div>
        </div>

        <hr>

        <h3 class="section-subtitle">Propuestas de los Participantes:</h3>
        <div v-if="isLoadingProposals">Cargando propuestas...</div>
        <div v-else-if="proposals.length === 0" class="no-proposals-message">
          <p>Aún no hay propuestas de participantes para este desafío.</p>
        </div>
        <div v-else class="proposals-list">
          <div v-for="proposal in proposals" :key="proposal.id_propuesta" class="proposal-card">
            <p><strong>De:</strong> {{ proposal.nombre_usuario }}</p> <p>{{ proposal.texto_propuesta }}</p>
            <div v-if="proposal.imagen_url" class="proposal-image-container"> <img :src="`http://localhost:4000${proposal.imagen_url}`" alt="Propuesta del participante" class="proposal-image"/>
            </div>
            <p class="proposal-date">Enviado el: {{ formatDate(proposal.fecha_envio) }}</p>
            </div>
        </div>

        <div class="detail-actions">
          <button @click="editChallenge" class="action-button edit-button">Editar Desafío</button>
          <button @click="closeChallenge" class="action-button close-button">Cerrar Desafío</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "ParticipantesDesafios",
  props: {
    idDesafio: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      challengeDetail: null,
      proposals: [], // Para almacenar las propuestas de este desafío
      isLoadingDetail: false,
      isLoadingProposals: false, // NUEVA PROPIEDAD: para el estado de carga de las propuestas
      detailErrorMessage: '',
    };
  },
  watch: {
    idDesafio: {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.fetchChallengeDetails(newId);
          this.fetchProposals(newId); // Cargar las propuestas también
        } else {
          // Limpiar datos si el idDesafio es nulo o indefinido
          this.challengeDetail = null;
          this.proposals = [];
          this.detailErrorMessage = '';
        }
      }
    }
  },
  methods: {
    cerrarModalDetalle() {
      this.$emit('cerrarDetalle');
    },
    async fetchChallengeDetails(id) {
      this.isLoadingDetail = true;
      this.detailErrorMessage = '';
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          throw new Error('No hay token de autenticación.');
        }

        const response = await axios.get(`http://localhost:4000/api/desafios/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200) {
          this.challengeDetail = response.data;
          console.log('Detalles del desafío para emprendedor cargados:', this.challengeDetail);
        } else {
          throw new Error(response.data.message || 'Error desconocido al cargar detalles del desafío.');
        }
      } catch (error) {
        console.error('Error al cargar los detalles del desafío para el emprendedor:', error);
        this.detailErrorMessage = 'Error al cargar los detalles del desafío: ' + (error.message || 'Error de conexión.');
        if (error.response && error.response.status === 403) {
           this.detailErrorMessage = 'No tienes permiso para ver este desafío.';
        }
      } finally {
        this.isLoadingDetail = false;
      }
    },
    async fetchProposals(id) {
      this.isLoadingProposals = true; // Establecer estado de carga al inicio
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          throw new Error('No hay token de autenticación.');
        }

        // ¡¡¡CAMBIO CLAVE AQUÍ: La URL debe ser /api/desafios/:id/propuestas !!!
        const response = await axios.get(`http://localhost:4000/api/desafios/${id}/propuestas`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200) {
          this.proposals = response.data;
          console.log('Propuestas recibidas para el desafío:', this.proposals);
        } else {
          throw new Error(response.data.message || 'Error desconocido al cargar propuestas.');
        }
      } catch (error) {
        console.error('Error al cargar las propuestas:', error);
        // Puedes agregar un mensaje de error específico para las propuestas si lo deseas
      } finally {
        this.isLoadingProposals = false; // Restablecer estado de carga al final
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    editChallenge() {
      alert('Funcionalidad de editar desafío (próximamente...)');
      // Emitir evento para abrir un formulario de edición o navegar a una ruta de edición
    },
    closeChallenge() {
      alert('Funcionalidad de cerrar desafío (próximamente...)');
      // Aquí enviarías una solicitud al backend para cambiar el estado del desafío a 'Cerrado'
    }
  }
}
</script>

<style scoped>
/* Estilos para el nuevo modal de detalle */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* Fondo más oscuro */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2500; /* Asegura que esté por encima de otros modales */
}

.modal-content-detail {
  background-color: white;
  padding: 35px;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  max-width: 700px; /* Un poco más ancho para más contenido */
  width: 95%;
  max-height: 90vh; /* Limita la altura y permite scroll */
  overflow-y: auto;
  position: relative;
  text-align: left;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 30px;
  cursor: pointer;
  color: #555;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #dc3545; /* Rojo para cerrar */
}

.loading-message-detail, .error-message-detail {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
  color: #007bff;
}
.error-message-detail {
    color: #dc3545;
}

.detail-title {
  font-size: 2.2em;
  color: #0056b3;
  margin-bottom: 10px;
  text-align: center;
  font-weight: bold;
}

.detail-description {
  font-size: 1.1em;
  line-height: 1.6;
  color: #555;
  margin-bottom: 25px;
  text-align: justify;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.info-item {
  background-color: #e9f5ff; /* Azul más claro */
  border: 1px solid #cceeff;
  border-radius: 10px;
  padding: 12px 18px;
  font-size: 0.95em;
  color: #333;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}
.info-item p {
    margin: 0;
}
.info-item strong {
    color: #0056b3;
}
.full-width {
    grid-column: 1 / -1; /* Ocupa todo el ancho en el grid */
}

hr {
  border: 0;
  border-top: 1px solid #eee;
  margin: 30px 0;
}

.section-subtitle {
  font-size: 1.7em;
  color: #007bff;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
}

.no-proposals-message {
  text-align: center;
  font-style: italic;
  color: #777;
  padding: 20px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  margin-bottom: 25px;
}

.proposals-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.proposal-card {
  background-color: #fcfcfc;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.proposal-card p {
  margin-bottom: 8px;
  line-height: 1.5;
  color: #444;
}

.proposal-card strong {
  color: #007bff;
}

.proposal-image-container {
  margin-top: 15px;
  text-align: center;
  border: 1px dashed #cccccc;
  padding: 10px;
  border-radius: 8px;
  background-color: #f0f0f0;
}
.proposal-image {
  max-width: 100%;
  max-height: 250px; /* Limita el tamaño de la imagen de la propuesta */
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.proposal-date {
  font-size: 0.85em;
  color: #888;
  text-align: right;
  margin-top: 10px;
}

.detail-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.action-button {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.edit-button {
  background-color: #ffc107; /* Amarillo para editar */
  color: #333;
}

.edit-button:hover {
  background-color: #e0a800;
  transform: translateY(-2px);
}

.close-button {
  background-color: #dc3545; /* Rojo para cerrar/eliminar */
  color: white;
}

.close-button:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}
</style>