<template>
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
            <p><strong>De:</strong> {{ proposal.nombre_usuario }}</p> <p>{{ proposal.texto_propuesta }}</p>
            <div v-if="proposal.imagen_url" class="proposal-image-container"> <img :src="`http://localhost:4000${proposal.imagen_url}`" alt="Propuesta del participante" class="proposal-image"/>
            </div>
            <p class="proposal-date">Enviado el: {{ formatDate(proposal.fecha_envio) }}</p>
            </div>
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
/* Colores de referencia:
   - hsl(300, 29%, 78%) se traduce aproximadamente a #d9bad9 (Rosa-morado pastel)
   - #5e1c7d (Morado oscuro)
*/

/* Título del modal */
.modal-content h2 {
  font-size: 2.5em; /* Tamaño de fuente para el título */
  color: #5e1c7d; /* Morado oscuro para el título */
  text-align: center;
  margin-bottom: 35px; /* Espacio debajo del título */
  font-weight: bold;
}

/* Overlay general del modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75); /* Fondo más oscuro y opaco */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2500; /* Asegura que esté por encima de otros elementos */
  backdrop-filter: blur(6px); /* Mayor desenfoque */
  animation: fadeIn 0.3s ease-out forwards; /* Animación de entrada para el overlay */
}

/* Animación de entrada para el overlay */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Contenido principal del modal de detalle */
.modal-content-detail {
  background-color: #ffffff; /* Fondo blanco puro */
  padding: 40px; /* Más padding para una sensación premium */
  border-radius: 20px; /* Bordes más redondeados */
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4); /* Sombra más profunda */
  max-width: 800px; /* Ancho más generoso para el detalle */
  width: 90%; /* Responsivo */
  max-height: 90vh; /* Limita la altura y permite scroll */
  overflow-y: auto;
  position: relative;
  text-align: left;
  animation: slideInFromTop 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; /* Animación de entrada más dinámica */
  font-family: 'Inter', sans-serif;
}

/* Animación para el contenido del modal */
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

/* Mensajes de carga y error */
.loading-message-detail, .error-message-detail {
  text-align: center;
  padding: 30px;
  font-size: 1.2em;
  font-weight: 500;
  border-radius: 12px;
  margin-top: 20px;
  background-color: #f0f8ff; /* Azul muy claro para carga */
  color: #007bff; /* Azul */
  border: 1px solid #cceeff;
}

.error-message-detail {
  background-color: #ffebee; /* Rojo muy claro para error */
  color: #d32f2f; /* Rojo oscuro para error */
  border: 1px solid #ef9a9a;
}


.detail-title {
  font-size: 2.8em; /* Título principal más grande */
  color: #5e1c7d; /* Morado oscuro para el título */
  margin-bottom: 20px;
  text-align: center;
  font-weight: 800; /* Extra bold */
  line-height: 1.2;
}

.detail-description {
  font-size: 1.15em; /* Descripción ligeramente más grande */
  line-height: 1.7;
  color: #444; /* Gris oscuro para el texto */
  margin-bottom: 35px; /* Más espacio */
  text-align: justify;
  background-color: #f9f9f9; /* Fondo suave para la descripción */
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #eee;
}

/* Grid de información clave del desafío */
.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Más flexible */
  gap: 20px; /* Más espacio entre ítems */
  margin-bottom: 35px;
}

.info-item {
  background-color: #f2e6f2; /* Rosa-morado pastel muy suave */
  border: 1px solid #d9bad9; /* Borde pastel */
  border-radius: 12px; /* Más redondeado */
  padding: 15px 20px; /* Más padding */
  font-size: 0.95em;
  color: #333;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); /* Sombra más pronunciada */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.info-item:hover {
  transform: translateY(-3px); /* Efecto de levantamiento */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
}

.info-item p {
  margin: 0;
  line-height: 1.4;
}

.info-item strong {
  color: #5e1c7d; /* Morado oscuro para las etiquetas */
  margin-right: 5px;
}

.info-item.full-width {
  grid-column: 1 / -1; /* Ocupa todo el ancho en el grid */
  text-align: left; /* Alinea el texto a la izquierda en la fila completa */
}

hr {
  border: 0;
  border-top: 2px solid #f2e6f2; /* Línea divisoria más gruesa y pastel */
  margin: 35px 0;
}

.section-subtitle {
  font-size: 2.1em; /* Subtítulo más grande */
  color: #5e1c7d; /* Morado oscuro */
  margin-bottom: 25px;
  text-align: center;
  font-weight: 700; /* Negrita */
  padding-bottom: 10px;
  border-bottom: 2px solid #d9bad9; /* Borde inferior pastel */
}

.no-proposals-message {
  text-align: center;
  font-style: italic;
  color: #777;
  padding: 25px;
  border: 2px dashed #d9bad9; /* Borde punteado pastel */
  border-radius: 12px;
  margin-bottom: 30px;
  background-color: #fdfafc; /* Fondo casi blanco */
}

/* Lista de propuestas */
.proposals-list {
  display: flex;
  flex-direction: column;
  gap: 25px; /* Más espacio entre propuestas */
}

/* Tarjeta de propuesta individual */
.proposal-card {
  background-color: #ffffff; /* Fondo blanco para las tarjetas */
  border: 1px solid #e0e0e0; /* Borde suave */
  border-radius: 15px; /* Más redondeado */
  padding: 25px; /* Más padding */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); /* Sombra suave */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative; /* Para la fecha de envío */
}

.proposal-card:hover {
  transform: translateY(-3px); /* Ligero levantamiento */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.proposal-card p {
  margin-bottom: 10px; /* Más espacio entre párrafos */
  line-height: 1.6;
  color: #444;
}

.proposal-card p:first-of-type { /* "De: [nombre]" */
    font-size: 1.1em;
    font-weight: 600;
    color: #5e1c7d; /* Morado oscuro para el nombre */
}

.proposal-card strong {
  color: #5e1c7d; /* Morado oscuro para las etiquetas */
  margin-right: 5px;
}

.proposal-image-container {
  margin-top: 20px; /* Más espacio */
  text-align: center;
  border: 2px dashed #d9bad9; /* Borde punteado pastel */
  padding: 15px;
  border-radius: 12px;
  background-color: #fefefe;
  display: inline-block; /* Para que el borde se ajuste al contenido */
  max-width: 100%; /* Asegura que no desborde */
}

.proposal-image {
  max-width: 100%;
  max-height: 280px; /* Límite de altura para la imagen de la propuesta */
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  object-fit: contain; /* Asegura que la imagen se ajuste sin recortarse */
}

.proposal-date {
  font-size: 0.9em;
  color: #888;
  text-align: right;
  margin-top: 15px; /* Más espacio */
  font-style: italic;
}


.action-button {
  padding: 14px 28px; /* Más padding para botones más grandes */
  border: none;
  border-radius: 12px; /* Más redondeado */
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  flex-grow: 1; /* Permite que los botones crezcan */
  max-width: 220px; /* Limita el ancho para que no sean demasiado grandes */
}

.edit-button {
  background-color: #ffc107; /* Amarillo para editar */
  color: #333;
}

.edit-button:hover {
  background-color: #e0a800; /* Amarillo más oscuro al pasar el ratón */
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.close-button.action-button { /* Asegura la especificidad para el botón de acción "Cerrar Desafío" */
  background-color: #dc3545; /* Rojo para cerrar/eliminar */
  color: white;
}

.close-button.action-button:hover {
  background-color: #c82333; /* Rojo más oscuro al pasar el ratón */
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

/* Media Queries para responsividad */
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
    grid-template-columns: 1fr; /* Una columna en pantallas pequeñas */
  }

  .detail-actions {
    flex-direction: column; /* Botones apilados en pantallas pequeñas */
    gap: 15px;
  }

  .action-button {
    max-width: 100%; /* Ocupa todo el ancho disponible */
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