<template>
  <div>
    <div class="Notificaciones" @click="toggleNotificacionesModal">
      <i class="fa-solid fa-bell" :class="{ 'has-new-notifications': newNotificationsCount > 0 }" style="color: #B197FC;"></i>
      <span v-if="newNotificationsCount > 0" class="notification-badge">{{ newNotificationsCount }}</span>
    </div>

    <div v-if="isNotificacionesModalOpen" class="notificaciones-modal-overlay" @click.self="toggleNotificacionesModal">
      <div class="notificaciones-modal-content">
        <div class="notificaciones-header">
          <h3 class="notificaciones-title">Mis Notificaciones</h3>
          <button class="notificaciones-close-button" @click="toggleNotificacionesModal">&times;</button>
        </div>
        <div class="notificaciones-list">
          <div v-if="notifications.length === 0" class="no-notifications-message">
            No tienes notificaciones.
          </div>
          <div
            v-for="notif in notifications"
            :key="notif.id_notificacion"
            :class="['notification-item', { 'unread': !notif.leido }]"
            @click="handleNotificationItemClick(notif)"
          >
            <p class="notification-message">{{ notif.mensaje }}</p>
            <p class="notification-date">{{ formatarFecha(notif.fecha_creacion) }}</p>
            <div class="notification-actions">
              <button
                v-if="notif.tipo_notificacion === 'solicitud_aceptada'"
                @click.stop="viewStatus(notif)"
                class="action-button view-status-button"
              >
                Ver Estado
              </button>

              <button
                v-if="!notif.leido && notif.tipo_notificacion !== 'solicitud_aceptada'"
                @click.stop="markAsReadButton(notif)"
                class="action-button mark-read-button"
              >
                Marcar como leído
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showStatusModal" class="modal-overlay">
      <div class="modal-content">
        <button @click="closeStatusModal" class="close-modal-button">&times;</button>
        <div class="modal-header">
          <i class="fas fa-check-circle modal-icon"></i>
          <h3>Solicitud de Contacto Aceptada</h3>
        </div>
        <p class="modal-message">¡Tu solicitud de contacto ha sido ACEPTADA por el emprendedor!</p>
        <p class="modal-date">Recibida el: {{ formatarFecha(selectedNotification.fecha_creacion) }}</p>
        <button @click="markAsReadAndCloseModal(selectedNotification)" class="action-button modal-read-button">
          Marcar como leído
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'; // Necesitas axios para hacer peticiones HTTP

export default {
  name: "IconoNotificaciones",
  data() {
    return {
      notifications: [], // Almacena todas las notificaciones del usuario
      newNotificationsCount: 0, // Contador para el badge de notificaciones no leídas
      isNotificacionesModalOpen: false, // Controla la visibilidad del modal de notificaciones
      pollInterval: null, // Para el polling (actualización periódica) de nuevas notificaciones
      apiUrl: 'http://localhost:4000/api', // URL base de tu backend Express.js
      showStatusModal: false, // Controla la visibilidad del modal de estado de solicitud
      selectedNotification: null, // Almacena la notificación seleccionada para el modal de estado
    };
  },
  methods: {
    // Método para obtener el token de autenticación del usuario
    getToken() {
      return localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    },

    // 1. Método para obtener las notificaciones desde el backend
    async fetchNotifications() {
      try {
        const token = this.getToken();
        if (!token) {
          console.warn('No hay token de autenticación. No se pueden obtener notificaciones.');
          this.notifications = [];
          this.newNotificationsCount = 0;
          return;
        }

        // CAMBIADO: Usar la ruta '/api/notificaciones' para coincidir con tu base de datos y error
        const response = await axios.get(`${this.apiUrl}/notificaciones`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Actualiza la lista de notificaciones y cuenta las no leídas
        this.notifications = response.data;
        this.newNotificationsCount = this.notifications.filter(notif => !notif.leido).length;

      } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        if (axios.isAxiosError(error) && error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.error('Sesión expirada en IconoNotificaciones. Se necesita reautenticación.');
          this.$emit('session-expired');
        }
        this.notifications = [];
        this.newNotificationsCount = 0;
      }
    },

    // 2. Método para abrir/cerrar el modal de notificaciones
    async toggleNotificacionesModal() {
      this.isNotificacionesModalOpen = !this.isNotificacionesModalOpen;
      if (this.isNotificacionesModalOpen) {
        await this.fetchNotifications(); // Recargar notificaciones cada vez que se abre el modal
      } else {
        this.fetchNotifications(); // Actualizar el badge al cerrar
      }
    },

    // NUEVO MÉTODO: Marcar una notificación específica como leída (backend y frontend)
    async markNotificationAsRead(notif) {
      if (!notif.leido) {
        try {
          const token = this.getToken();
          // CAMBIADO: Usar la ruta '/api/notificaciones/:id/marcar-leida' para coincidir con tu base de datos
          await axios.patch(`${this.apiUrl}/notificaciones/${notif.id_notificacion}/marcar-leida`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          notif.leido = true;
          this.newNotificationsCount = this.notifications.filter(n => !n.leido).length;
          console.log(`Notificación ${notif.id_notificacion} marcada como leída.`);
        } catch (error) {
          console.error('Error al marcar notificación como leída:', error);
          alert('Error al marcar la notificación como leída.');
        }
      }
    },

    // 3. Método para manejar el clic en un elemento de la notificación (marcar como leído y redirigir)
    async handleNotificationItemClick(notif) {
      await this.markNotificationAsRead(notif);
      
      if (notif.url_redireccion) {
        this.$router.push(notif.url_redireccion).catch(() => {});
      }
      this.toggleNotificacionesModal();
    },

    // NUEVO MÉTODO: Manejar el clic del botón "Marcar como leído" (solo marcar como leído)
    async markAsReadButton(notif) {
        await this.markNotificationAsRead(notif);
        this.toggleNotificacionesModal();
    },

    // Método para abrir el modal de estado de solicitud
    viewStatus(notif) {
      this.selectedNotification = notif;
      this.showStatusModal = true;
    },

    // Método para cerrar el modal de estado de solicitud
    closeStatusModal() {
      this.showStatusModal = false;
      this.selectedNotification = null;
    },

    // Método para marcar como leído y cerrar el modal (usado en el modal de estado)
    async markAsReadAndCloseModal(notif) {
      await this.markNotificationAsRead(notif);
      this.closeStatusModal();
    },

    // 4. Método para formatear la fecha de forma legible
    formatarFecha(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },

    // 5. Iniciar el polling para nuevas notificaciones (ej. cada 30 segundos)
    startPolling() {
      this.pollInterval = setInterval(this.fetchNotifications, 30000);
    },

    // 6. Detener el polling (importante para evitar fugas de memoria)
    stopPolling() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
      }
    }
  },
  mounted() {
    this.fetchNotifications();
    this.startPolling();
  },
  beforeUnmount() {
    this.stopPolling();
  }
};
</script>

<style scoped>
/* (El CSS es el mismo que el anterior, no necesita cambios) */
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

/* Estilos para el Modal de Notificaciones */
.notificaciones-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Asegúrate de que esté por encima de todo lo demás */
}

.notificaciones-modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 450px; /* Ancho deseado para el modal */
  max-height: 80vh; /* Altura máxima para permitir scroll */
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.notificaciones-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.notificaciones-title {
  font-size: 1.5em;
  font-weight: bold;
  color: #333;
}

.notificaciones-close-button {
  background: none;
  border: none;
  font-size: 2em;
  cursor: pointer;
  color: #aaa;
  line-height: 1; /* Para alinear bien la 'x' */
}

.notificaciones-close-button:hover {
  color: #777;
}

.notificaciones-list {
  flex-grow: 1;
  overflow-y: auto; 
  padding-right: 5px;
}

/* Estilos de la barra de desplazamiento para el área de mensajes */
.notificaciones-list::-webkit-scrollbar {
  width: 8px;
}
.notificaciones-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.notificaciones-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}
.notificaciones-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.no-notifications-message {
  text-align: center;
  color: #777;
  padding: 20px;
}

.notification-item {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.notification-item.unread {
  background-color: #e6f7ff; /* Fondo más claro para notificaciones no leídas */
  border-color: #91d5ff;
}

.notification-item:hover {
  background-color: #e0e0e0;
}

.notification-item.unread:hover {
  background-color: #cce0f0;
}

.notification-message {
  font-size: 1em;
  color: #333;
  margin-bottom: 5px;
}

.notification-date {
  font-size: 0.8em;
  color: #777;
  text-align: right;
}

.notification-actions {
  display: flex;
  justify-content: flex-end; /* Alinea los botones a la derecha */
  gap: 10px; /* Espacio entre botones */
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}

.action-button {
  padding: 8px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.view-status-button {
  background-color: #e4a0d5; /* Rosa vibrante */
  color: white;
}

.view-status-button:hover {
  background-color: #d288c0;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.mark-read-button {
  background-color: #d9bad9; /* Rosa pastel */
  color: #5e1c7d; /* Morado oscuro */
}

.mark-read-button:hover {
  background-color: #c0a8c0;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

/* Estilos del Modal de "Ver Estado" */
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
  z-index: 2001; /* Mayor que el modal principal */
}

.modal-content {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 450px;
  text-align: center;
  position: relative;
}

.close-modal-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.8em;
  color: #888;
  cursor: pointer;
  transition: color 0.2s ease;
}

.close-modal-button:hover {
  color: #333;
}

.modal-header {
  margin-bottom: 20px;
}

.modal-icon {
  font-size: 3.5em;
  color: #28a745; /* Verde para éxito */
  margin-bottom: 15px;
}

.modal-content h3 {
  color: #5e1c7d;
  font-size: 1.8em;
  margin-bottom: 10px;
}

.modal-message {
  font-size: 1.1em;
  color: #444;
  margin-bottom: 20px;
  line-height: 1.6;
}

.modal-date {
  font-size: 0.9em;
  color: #888;
  font-style: italic;
  margin-bottom: 25px;
}

.modal-read-button {
  background-color: #d9bad9;
  color: #5e1c7d;
  padding: 12px 25px;
  font-size: 1em;
}

.modal-read-button:hover {
  background-color: #c0a8c0;
}

/* Media Queries para responsividad */
@media (max-width: 768px) {
  .notificaciones-modal-content {
    width: 95%;
    max-width: none;
  }
  .notification-item {
    padding: 10px 12px;
  }
  .notification-message {
    font-size: 0.95em;
  }
  .action-button {
    padding: 6px 10px;
    font-size: 0.8em;
  }
}

@media (max-width: 480px) {
  .Notificaciones {
    width: 45px;
    height: 45px;
    font-size: 24px;
    right: 15px;
  }
  .notification-badge {
    top: -2px;
    right: 0px;
    padding: 1px 6px;
    font-size: 0.6em;
  }
  .notificaciones-modal-content {
    padding: 15px;
  }
  .notificaciones-title {
    font-size: 1.3em;
  }
  .notificaciones-close-button {
    font-size: 1.5em;
  }
  .notification-item {
    padding: 8px 10px;
  }
  .notification-actions {
    flex-direction: column;
    gap: 8px;
  }
  .action-button {
    width: 100%;
  }
}
</style>