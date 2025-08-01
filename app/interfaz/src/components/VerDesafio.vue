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
          <div v-for="challenge in challenges" :key="challenge.id_desafio" class="challenge-card">
            <h3>{{ challenge.nombre_desafio }}</h3>
            <p><strong>Descripción:</strong> {{ challenge.descripcion_desafio }}</p>
            <p v-if="challenge.beneficios"><strong>Beneficios:</strong> {{ challenge.beneficios }}</p>
            <p><strong>Duración:</strong> {{ challenge.dias_duracion }} días</p>
            <p><strong>Creado el:</strong> {{ formatDate(challenge.fecha_creacion) }}</p>
            <p><strong>Fecha Fin:</strong> {{ formatDate(challenge.fecha_fin) }}</p>

            <button @click="emitirVerDetalle(challenge.id_desafio)" class="view-proposals-button">
              Ver Propuestas
            </button>
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
    };
  },
  mounted() {
    this.loadChallenges();
  },
  methods: {
    cerrarModal() {
      this.$emit('cerrar');
    },
    emitirVerDetalle(id) {
      this.$emit('verDetalle', id);
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
.VerDesafios {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: #ffffff;
  padding: 40px;
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: fadeInScale 0.3s ease-out forwards;
  font-family: 'Inter', sans-serif;
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

.close-button {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 2.2em;
  color: #a30000;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
}

.close-button:hover {
  color: #7a0000;
  transform: rotate(90deg);
}

.modal-content h2 {
  font-size: 2.5em;
  color: #5e1c7d;
  text-align: center;
  margin-bottom: 35px;
  font-weight: bold;
}

.no-challenges-message, .loading-message {
  text-align: center;
  padding: 30px;
  font-size: 1.2em;
  color: #5e1c7d;
  background-color: #f2e6f2;
  border-radius: 12px;
  margin-top: 20px;
  line-height: 1.6;
  border: 1px solid #d9bad9;
}

.loading-message {
  color: #5e1c7d;
  background-color: #f0f8ff;
  border: 1px solid #cceeff;
}

.challenges-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  padding-top: 10px;
}

.challenge-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;
}

.challenge-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.challenge-card h3 {
  font-size: 1.6em;
  color: #5e1c7d;
  margin-bottom: 15px;
  font-weight: bold;
  line-height: 1.3;
}

.challenge-card p {
  font-size: 0.95em;
  color: #555;
  margin-bottom: 8px;
  line-height: 1.5;
}

.challenge-card p strong {
  color: #5e1c7d;
  margin-right: 5px;
}

.challenge-card p:nth-of-type(2),
.challenge-card p:nth-of-type(3) {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 10px;
}

.view-proposals-button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background-color: #6a0dad;
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}


.view-proposals-button:hover {
  background-color: #55008c; 
}



</style>