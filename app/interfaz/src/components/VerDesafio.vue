<template>
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
          <!-- Si quisieras asociar imágenes a desafíos en el futuro, necesitarías una nueva tabla
               de unión (desafio_imagen) o una FK de imagen a desafio. Por ahora, no hay imágenes aquí. -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "VerDesafio",
  props: {
    userId: { // Aunque se obtiene el userId del token, es buena práctica pasarlo si es necesario para depuración o futuras validaciones.
      type: [Number, String], // Puede ser string si viene de localStorage
      required: true
    }
  },
  data() {
    return {
      challenges: [],
      isLoadingChallenges: false, // Nuevo estado para indicar si se están cargando los desafíos
    };
  },
  mounted() {
    // Cuando el componente se monta, carga los desafíos
    this.loadChallenges();
  },
  methods: {
    cerrarModal() {
      this.$emit('cerrar');
    },
    async loadChallenges() {
      this.isLoadingChallenges = true; // Inicia el estado de carga
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
        this.isLoadingChallenges = false; // Finaliza el estado de carga
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      // Asegúrate de que el formato de fecha sea compatible con Date
      // Si viene de MySQL como DATETIME, debería funcionar directamente.
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  }
}
</script>

<style>

.VerDesafios {
  position: absolute;
  left: 530px;
  top: 250px;
  padding: 40px;
  font-family: "Times New Roman", serif;
  width: 450px;
  height: 160px;
  background: white;
  border: 5px solid rgba(0, 0, 0, 0.5);
  border-radius: 100px;
  backdrop-filter: blur(20px);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  opacity: 0.9;
}

.CerrarDesafio {
  width: 100%;
  height: 30px;
  background: #440857;
  border: none;
  outline: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  color: #fff;
  font-weight: 500;
}


</style>