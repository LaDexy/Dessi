<template>
  <div>
  <!-- ESTA ES LA PARTE QUE SE CARGA AL DARLE CLIC A LOS DATOS BASICOS DEL DESAFIO -->
  <div class="modal-overlay" @click.self="cerrarModalDetalle">
    <div class="modal-content-detail">
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
            <p><strong>De:</strong> {{ proposal.nombre_usuario }}</p> 
            <p>{{ proposal.texto_propuesta }}</p>
            <div v-if="proposal.imagen_url" class="proposal-image-container"> 
              <img :src="`http://localhost:4000${proposal.imagen_url}`" alt="Propuesta del participante" class="proposal-image"/>
            </div>
            <p class="proposal-date">Enviado el: {{ formatDate(proposal.fecha_envio) }}</p>

            <!-- Ícono de trofeo: visible si el desafío ha terminado y no hay ganador aún -->
            <button 
              v-if="challengeHasEnded && challengeDetail.usuario_ganador === null" 
              @click="openSelectWinnerModal(proposal)" 
              class="select-winner-icon"
              title="Seleccionar esta propuesta como ganadora"
            >
              <i class="fa-solid fa-trophy fa-lg" style="color: #f2bc00;"></i>
            </button>
            <!-- Muestra el badge "Ganador" si esta es la propuesta ganadora -->
            <span v-if="challengeDetail.usuario_ganador === proposal.id_usuario_proponente" class="winner-badge">
              🏆 GANADOR
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  
  <ModalSeleccionarGanador
    v-if="showSelectWinnerModal"
    :idDesafio="idDesafio"
    :idPropuestaGanadora="selectedProposal ? selectedProposal.id_propuesta : null"
    :nombreDesafio="challengeDetail ? challengeDetail.nombre_desafio : ''"
    @cerrar="showSelectWinnerModal = false"
    @ganadorSeleccionado="handleWinnerSelected"
  />
</div>

</template>

<script>
import axios from 'axios';
// Importa el nuevo componente de modal
import ModalSeleccionarGanador from './ModalSeleccionarGanador.vue'; 

export default {
  name: "ParticipantesDesafios",
  components: {
    ModalSeleccionarGanador 
  },
  props: {
    idDesafio: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      challengeDetail: null,
      proposals: [],
      isLoadingDetail: false,
      isLoadingProposals: false,
      detailErrorMessage: '',
      showSelectWinnerModal: false, 
      selectedProposal: null, 
    };
  },
  computed: {

    challengeHasEnded() {
      if (!this.challengeDetail || !this.challengeDetail.fecha_fin) {
        return false;
      }
      const today = new Date();
      const endDate = new Date(this.challengeDetail.fecha_fin);
    
      return today.setHours(0,0,0,0) > endDate.setHours(0,0,0,0);
    }
  },
  watch: {
    idDesafio: {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.fetchChallengeDetails(newId);
          this.fetchProposals(newId);
        } else {
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
         
          this.detailErrorMessage = 'No estás autenticado. Por favor, inicia sesión.';
         
          return;
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
           this.detailErrorMessage = 'No tienes permiso para ver este desafío o tu sesión ha expirado.';
           
        }
      } finally {
        this.isLoadingDetail = false;
      }
    },
    async fetchProposals(id) {
      this.isLoadingProposals = true;
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
           return;
        }

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
       
      } finally {
        this.isLoadingProposals = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    openSelectWinnerModal(proposal) {
      this.selectedProposal = proposal;
      this.showSelectWinnerModal = true;
    },
    handleWinnerSelected() {
     
      console.log('Ganador seleccionado. Refrescando detalles del desafío y propuestas.');
      this.showSelectWinnerModal = false; 
     
      this.fetchChallengeDetails(this.idDesafio); 
      
    },
    editChallenge() {
      alert('Funcionalidad de editar desafío (próximamente...)');
    },
    closeChallenge() {
       alert('Funcionalidad de cerrar desafío (próximamente...)');
    }
  }
}
</script>

<style scoped>

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2500;
  backdrop-filter: blur(6px);
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content-detail {
  background-color: #ffffff;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  text-align: left;
  animation: slideInFromTop 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  font-family: 'Inter', sans-serif;
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.loading-message-detail, .error-message-detail {
  text-align: center;
  padding: 30px;
  font-size: 1.2em;
  font-weight: 500;
  border-radius: 12px;
  margin-top: 20px;
  background-color: #f0f8ff;
  color: #007bff;
  border: 1px solid #cceeff;
}

.error-message-detail {
  background-color: #ffebee;
  color: #d32f2f;
  border: 1px solid #ef9a9a;
}

.detail-title {
  font-size: 2.8em;
  color: #5e1c7d;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 800;
  line-height: 1.2;
}

.detail-description {
  font-size: 1.15em;
  line-height: 1.7;
  color: #444;
  margin-bottom: 35px;
  text-align: justify;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #eee;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 35px;
}

.info-item {
  background-color: #f2e6f2;
  border: 1px solid #d9bad9;
  border-radius: 12px;
  padding: 15px 20px;
  font-size: 0.95em;
  color: #333;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.info-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
}

.info-item p {
  margin: 0;
  line-height: 1.4;
}

.info-item strong {
  color: #5e1c7d;
  margin-right: 5px;
}

.info-item.full-width {
  grid-column: 1 / -1;
  text-align: left;
}

hr {
  border: 0;
  border-top: 2px solid #f2e6f2;
  margin: 35px 0;
}

.section-subtitle {
  font-size: 2.1em;
  color: #5e1c7d;
  margin-bottom: 25px;
  text-align: center;
  font-weight: 700;
  padding-bottom: 10px;
  border-bottom: 2px solid #d9bad9;
}

.no-proposals-message {
  text-align: center;
  font-style: italic;
  color: #777;
  padding: 25px;
  border: 2px dashed #d9bad9;
  border-radius: 12px;
  margin-bottom: 30px;
  background-color: #fdfafc;
}

.proposals-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.proposal-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative; 
}

.proposal-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.proposal-card p {
  margin-bottom: 10px;
  line-height: 1.6;
  color: #444;
}

.proposal-card p:first-of-type {
    font-size: 1.1em;
    font-weight: 600;
    color: #5e1c7d;
}

.proposal-card strong {
  color: #5e1c7d;
  margin-right: 5px;
}

.proposal-image-container {
  margin-top: 20px;
  text-align: center;
  border: 2px dashed #d9bad9;
  padding: 15px;
  border-radius: 12px;
  background-color: #fefefe;
  display: inline-block;
  max-width: 100%;
}

.proposal-image {
  max-width: 100%;
  max-height: 280px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  object-fit: contain;
}

.proposal-date {
  font-size: 0.9em;
  color: #888;
  text-align: right;
  margin-top: 15px;
  font-style: italic;
}


.select-winner-icon {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 2em; 
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
  padding: 5px; 
  z-index: 10;
}

.select-winner-icon:hover {
  transform: scale(1.2);
}


.winner-badge {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background-color: #ffcc00; 
  color: #333;
  padding: 5px 10px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.9em;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.action-button {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  flex-grow: 1;
  max-width: 220px;
}

.edit-button {
  background-color: #ffc107;
  color: #333;
}

.edit-button:hover {
  background-color: #e0a800;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.close-button.action-button {
  background-color: #dc3545;
  color: white;
}

.close-button.action-button:hover {
  background-color: #c82333;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .modal-content-detail {
    padding: 25px;
    width: 95%;
  }

  .detail-title {
    font-size: 2.2em;
  }

  .section-subtitle {
    font-size: 1.8em;
  }

  .detail-info-grid {
    grid-template-columns: 1fr;
  }

  .detail-actions {
    flex-direction: column;
    gap: 15px;
  }

  .action-button {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .modal-content-detail {
    padding: 20px;
  }

  .detail-title {
    font-size: 1.8em;
  }

  .close-button {
    font-size: 2.2em;
    top: 15px;
    right: 15px;
  }

  .section-subtitle {
    font-size: 1.6em;
  }

  .proposal-card p {
    font-size: 0.95em;
  }
}
</style>
