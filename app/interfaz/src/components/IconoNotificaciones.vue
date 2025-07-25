<template>
  <div>
    <div class="Notificaciones" @click="goToNotificationsPage">
      <i class="fa-solid fa-bell" :class="{ 'has-new-notifications': newNotificationsCount > 0 }" style="color: #B197FC;"></i>
      <span v-if="newNotificationsCount > 0" class="notification-badge">{{ newNotificationsCount }}</span>
    </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "IconoNotificaciones",
  data() {
    return {
      newNotificationsCount: 0, // Solo necesitamos el contador de no leídas aquí
      pollInterval: null,       // Para el polling
      apiUrl: 'http://localhost:4000/api', // URL base de tu backend Express.js
    };
  },
  methods: {
    getToken() {
      return localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    },

    // Solo para obtener el recuento de notificaciones no leídas
    async fetchUnreadNotificationsCount() {
      try {
        const token = this.getToken();
        if (!token) {
          console.warn('No hay token de autenticación. No se puede obtener el recuento de notificaciones.');
          this.newNotificationsCount = 0;
          return;
        }

        const response = await axios.get(`${this.apiUrl}/notificaciones/unread-count`, { // NUEVA RUTA EN BACKEND
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        this.newNotificationsCount = response.data.count;

      } catch (error) {
        console.error('Error al obtener el recuento de notificaciones no leídas:', error);
        if (axios.isAxiosError(error) && error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.error('Sesión expirada en IconoNotificaciones. Se necesita reautenticación.');
          // Emitir un evento para que el componente padre (App.vue o similar) maneje la expiración de sesión
          this.$emit('session-expired'); 
        }
        this.newNotificationsCount = 0;
      }
    },

    // Redirige a la página de notificaciones completa
    goToNotificationsPage() {
      this.$router.push({ name: 'Notificaciones' }); // Asegúrate de que 'PaginaNotificaciones' sea el nombre de tu ruta
      // Opcional: una vez que el usuario va a la página, podríamos forzar un fetch de nuevo
      // para que el badge se actualice más rápido al volver (si es que no se actualiza por polling)
      // this.fetchUnreadNotificationsCount(); 
    },

    startPolling() {
      this.pollInterval = setInterval(this.fetchUnreadNotificationsCount, 30000); // Cada 30 segundos
    },

    stopPolling() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
      }
    }
  },
  mounted() {
    this.fetchUnreadNotificationsCount(); // Obtener el recuento inicial
    this.startPolling(); // Iniciar el polling
  },
  beforeUnmount() {
    this.stopPolling(); // Detener el polling al desmontar el componente
  }
};
</script>

<style scoped>
/* (El CSS es el mismo que el anterior para el icono y el badge) */
/* Estilos para el icono de notificaciones */
.Notificaciones {
  position: fixed;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px; 
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease-in-out;
  border-radius: 50%; 
  background-color: #f7f7f7; 
  bottom: 0;
  right: 20px; /* Ajusta la posición si es necesario */
  z-index: 100; /* Asegúrate de que esté visible */
}

.Notificaciones:hover {
  transform: scale(1.1);
}

/* Estilo para la campana cuando HAY nuevas notificaciones */
.Notificaciones .fa-bell.has-new-notifications {
  animation: shake 0.8s cubic-bezier(.36,.07,.19,.97) both infinite; 
  transform-origin: top center;
}

/* Animación de temblor para el icono */
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

/* Estilos para el badge de notificación */
.notification-badge {
  position: absolute;
  top: 0px; 
  right: 5px;
  background-color: #793096;
  color: white;
  border-radius: 50%;
  padding: 2px 7px; 
  font-size: 0.7em;
  font-weight: bold;
  min-width: 15px;
  text-align: center;
  line-height: 1; 
  border: 1px solid white; 
}

/* El resto de estilos para el modal y los ítems de notificación deben ir en PaginaNotificaciones.vue */
</style>