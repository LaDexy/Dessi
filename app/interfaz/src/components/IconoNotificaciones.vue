<template>
  <div>
    <!--ESTA ES LA PARTE DEL ICONO DE NOTIFICACIONES DE PAGINA CENTRAL-->
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
      newNotificationsCount: 0,
      pollInterval: null,
      apiUrl: 'http://localhost:4000/api',
    };
  },
  methods: {
    getToken() {
      return localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    },

    async fetchUnreadNotificationsCount() {
      try {
        const token = this.getToken();
        if (!token) {
          console.warn('No hay token de autenticación. No se puede obtener el recuento de notificaciones.');
          this.newNotificationsCount = 0;
          return;
        }

        const response = await axios.get(`${this.apiUrl}/notificaciones/unread-count`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        this.newNotificationsCount = response.data.count;

      } catch (error) {
        console.error('Error al obtener el recuento de notificaciones no leídas:', error);
        if (axios.isAxiosError(error) && error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.error('Sesión expirada en IconoNotificaciones. Se necesita reautenticación.');
          this.$emit('session-expired');
        }
        this.newNotificationsCount = 0;
      }
    },

    goToNotificationsPage() {
      this.$router.push({ name: 'Notificaciones' });
    },

    startPolling() {
      this.pollInterval = setInterval(this.fetchUnreadNotificationsCount, 30000);
    },

    stopPolling() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
      }
    }
  },
  mounted() {
    this.fetchUnreadNotificationsCount();
    this.startPolling();
  },
  beforeUnmount() {
    this.stopPolling();
  }
};
</script>

<style scoped>
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
  right: 20px;
  z-index: 100;
}

.Notificaciones:hover {
  transform: scale(1.1);
}

.Notificaciones .fa-bell.has-new-notifications {
  animation: shake 0.8s cubic-bezier(.36,.07,.19,.97) both infinite;
  transform-origin: top center;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

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
</style>