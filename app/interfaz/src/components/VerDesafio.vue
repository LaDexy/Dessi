<template>
    <div class="VerDesafios">
        <div class="modal-overlay" @click.self="cerrarModal">
            <div class="modal-content">
                <span class="close-button" @click="cerrarModal">&times;</span>
                <h2>Mis Desafíos Creados</h2>

                <div v-if="challenges.length === 0 && !isLoadingChallenges" class="no-challenges-message">
                    <p>¡Aún no has creado ningún desafío!</p>
                    <p>Presiona "Crear desafío" para empezar.</p>
                </div>

                <div v-else-if="isLoadingChallenges" class="loading-message">
                    <p>Cargando desafíos...</p>
                </div>

                <div v-else class="challenges-list">
                    <div v-for="challenge in challenges" :key="challenge.id_desafio" 
                         class="challenge-card"
                         @click="emitirVerDetalle(challenge.id_desafio)"> <h3>{{ challenge.nombre_desafio }}</h3>
                        <p><strong>Descripción:</strong> {{ challenge.descripcion_desafio }}</p>
                        <p v-if="challenge.beneficios"><strong>Beneficios:</strong> {{ challenge.beneficios }}</p>
                        <p><strong>Duración:</strong> {{ challenge.dias_duracion }} días</p>
                        <p><strong>Creado el:</strong> {{ formatDate(challenge.fecha_creacion) }}</p>
                        <p><strong>Fecha Fin:</strong> {{ formatDate(challenge.fecha_fin) }}</p>
                    </div>
                </div>
            </div>
        </div>
        </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "VerDesafios",
  // Elimina 'DetalleDesafioEmprendedor' de components si estaba aquí
  // components: { DetalleDesafioEmprendedor }, 
  props: {
    userId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      challenges: [],
      isLoadingChallenges: false,
      // Elimina estas propiedades si estaban aquí:
      // showDetalleDesafioModal: false, 
      // selectedChallengeId: null,      
    };
  },
  mounted() {
    this.loadChallenges();
  },
  methods: {
    cerrarModal() {
      this.$emit('cerrar');
    },
    // NUEVO MÉTODO: Emite el evento 'verDetalle'
    emitirVerDetalle(id) {
      this.$emit('verDetalle', id); // Emitir el ID del desafío al padre (PaginaPerfil)
    },
    async loadChallenges() {
      this.isLoadingChallenges = true;
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          alert("No estás autenticado. Por favor, inicia sesión.");
          this.$router.push({ name: 'Principal' });
          return;
        }

        console.log('Cargando desafíos para el usuario:', this.userId);
        const response = await axios.get('http://localhost:4000/api/challenges/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          this.challenges = response.data;
          console.log('Desafíos cargados:', this.challenges);
        } else {
          alert('Error al cargar los desafíos: ' + (response.data.message || 'Error desconocido.'));
        }
      } catch (error) {
        console.error('Error al cargar los desafíos:', error);
        alert('Error al cargar los desafíos. Por favor, inténtalo de nuevo.');
        if (error.response && error.response.status === 403) {
          alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
          this.$router.push({ name: "Principal" });
        }
      } finally {
        this.isLoadingChallenges = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  }
}
</script>

<style scoped>
/* Mantener los estilos existentes para VerDesafios, asegurando que el z-index sea menor
   que el del nuevo modal de detalle (DetalleDesafioEmprendedor) */
.VerDesafios {
  position: absolute;
  left: 530px;
  top: 250px;
  padding: 40px;
  font-family: "Times New Roman", serif;
  width: 450px;
  height: 100%; 
  background: white;
  border: 5px solid rgba(0, 0, 0, 0.5);
  border-radius: 20px; 
  backdrop-filter: blur(20px);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; 
  opacity: 0.9;
  z-index: 1000; /* Asegura que este modal esté por encima del contenido principal */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999; 
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  text-align: center;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
}

.close-button:hover {
  color: #ff4d4f;
}

h2 {
  font-size: 1.8em;
  color: #007bff;
  margin-bottom: 20px;
}

.no-challenges-message, .loading-message {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #777;
}

.challenges-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.challenge-card {
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 15px 20px;
  text-align: left;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.challenge-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.challenge-card h3 {
  font-size: 1.4em;
  color: #0056b3;
  margin-bottom: 10px;
}

.challenge-card p {
  font-size: 0.95em;
  color: #555;
  margin-bottom: 5px;
}

.challenge-card strong {
  color: #333;
}
</style>