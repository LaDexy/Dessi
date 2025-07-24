<template>
  <div class="pagina-notificaciones-container">
    <h2>Tus Notificaciones</h2>
    <button @click="goBack" class="back-button">
      <i class="fas fa-arrow-left mr-2"></i> Volver
    </button>

    <div v-if="isLoading" class="loading-message">Cargando notificaciones...</div>
    <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-else-if="notifications.length > 0" class="notifications-list">
      <div
        v-for="notification in notifications"
        :key="notification.id_notificacion"
        :class="['notification-card', { 'unread': !notification.leida }]"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-header">
          <i :class="getNotificationIcon(notification.tipo_notificacion)"></i>
          <h3>{{ notification.titulo }}</h3>
        </div>
        <p class="notification-message">{{ notification.mensaje }}</p>
        <p class="notification-date">{{ formatDate(notification.creado_fecha) }}</p>

        <div v-if="notification.tipo_notificacion === 'solicitud_contacto'" class="solicitud-acciones">
          <p class="solicitud-estado">Estado: {{ notification.estatus_solicitud || 'Pendiente' }}</p>
          <div v-if="notification.estatus_solicitud === 'Pendiente'" class="action-buttons">
            <button @click.stop="acceptContactRequest(notification)" class="btn-accept">Aceptar</button>
            <button @click.stop="rejectContactRequest(notification)" class="btn-reject">Rechazar</button>
          </div>
          <div v-if="notification.estatus_solicitud === 'Aceptada' && notification.email_emisor" class="contact-details">
            <p><strong>Contacto:</strong></p>
            <p>Email: {{ notification.email_emisor }}</p>
            <p v-if="notification.emisor_whatsapp">WhatsApp: {{ notification.emisor_whatsapp }}</p>
            <p v-if="notification.emisor_instagram">Instagram: {{ notification.emisor_instagram }}</p>
            <p v-if="notification.emisor_tiktok">TikTok: {{ notification.emisor_tiktok }}</p>
            <p v-if="notification.emisor_facebook">Facebook: {{ notification.emisor_facebook }}</p>
          </div>
        </div>
        <div v-else-if="notification.tipo_notificacion === 'solicitud_aceptada' || notification.tipo_notificacion === 'solicitud_rechazada'">
          <button @click.stop="openAcceptedRejectedModal(notification)" class="btn-view-status">Ver Estado</button>
        </div>
        
      </div>
    </div>
    <div v-else class="no-notifications-message">
      No tienes notificaciones por el momento.
    </div>

    <div v-if="showMessageModal" class="message-modal-overlay">
      <div class="message-modal-content">
        <h3 class="message-modal-title">{{ messageModalTitle }}</h3>
        <p class="message-modal-message">{{ messageModalMessage }}</p>
        <div class="message-modal-actions">
          <button @click="closeMessageModal" class="message-modal-button-close">Cerrar</button>
        </div>
      </div>
    </div>

    <div v-if="showContactDetailsModal" class="message-modal-overlay">
      <div class="message-modal-content">
        <button @click="closeContactDetailsModal" class="modal-close-button">&times;</button>
        <h3 class="message-modal-title">Datos de Contacto de {{ selectedContactDetails.nombre_usuario }}</h3>
        <div class="contact-details-modal-info">
          <p>Email: {{ selectedContactDetails.email }}</p>
          <p v-if="selectedContactDetails.whatsapp">WhatsApp: {{ selectedContactDetails.whatsapp }}</p>
          <p v-if="selectedContactDetails.instagram">Instagram: {{ selectedContactDetails.instagram }}</p>
          <p v-if="selectedContactDetails.tiktok">TikTok: {{ selectedContactDetails.tiktok }}</p>
          <p v-if="selectedContactDetails.facebook">Facebook: {{ selectedContactDetails.facebook }}</p>
        </div>
        <button @click="markAsReadAndCloseContactModal(selectedContactDetails.id_notificacion)" class="message-modal-button-close">
          Cerrar
        </button>
      </div>
    </div>

    <div v-if="showAcceptedRejectedModal" class="message-modal-overlay">
      <div class="message-modal-content">
        <button @click="closeAcceptedRejectedModal" class="modal-close-button">&times;</button>
        <div class="icon-container">
            <i :class="{'fas fa-check-circle success-icon': acceptedRejectedNotification.tipo_notificacion === 'solicitud_aceptada', 'fas fa-times-circle error-icon': acceptedRejectedNotification.tipo_notificacion === 'solicitud_rechazada'}"></i>
        </div>
        <h3 class="message-modal-title" :class="{'success-title': acceptedRejectedNotification.tipo_notificacion === 'solicitud_aceptada', 'error-title': acceptedRejectedNotification.tipo_notificacion === 'solicitud_rechazada'}">
          {{ acceptedRejectedNotification.tipo_notificacion === 'solicitud_aceptada' ? 'Solicitud de Contacto Aceptada' : 'Solicitud de Contacto Rechazada' }}
        </h3>
        <p class="message-modal-message">
          {{ acceptedRejectedNotification.tipo_notificacion === 'solicitud_aceptada' ? '¡Tu solicitud de contacto ha sido ACEPTADA por ' + (acceptedRejectedNotification.nombre_usuario_emisor || 'el emprendedor') + '!' : 'Tu solicitud de contacto ha sido RECHAZADA por ' + (acceptedRejectedNotification.nombre_usuario_emisor || 'el emprendedor') + '.' }}
        </p>
        <p class="received-date">Recibida el: {{ formatDate(acceptedRejectedNotification.creado_fecha) }}</p>
        <div class="message-modal-actions">
          <button @click="markAsReadAndCloseAcceptedRejectedModal(acceptedRejectedNotification.id_notificacion)" class="message-modal-button-close">
            Marcar como leído
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PaginaNotificaciones',
  data() {
    return {
      notifications: [],
      isLoading: true,
      errorMessage: '',
      showMessageModal: false,
      messageModalTitle: '',
      messageModalMessage: '',
      showContactDetailsModal: false,
      selectedContactDetails: {},
      showAcceptedRejectedModal: false,
      acceptedRejectedNotification: {}, // Para la notificación de solicitud aceptada/rechazada
    };
  },
  async created() {
    await this.fetchNotifications();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async fetchNotifications() {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          this.errorMessage = 'No hay token de autenticación. Por favor, inicia sesión.';
          this.$router.push({ name: 'Principal' });
          return;
        }

        const response = await axios.get('http://localhost:4000/api/notificaciones', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200) {
          this.notifications = response.data;
          console.log('Notificaciones cargadas:', this.notifications);
        } else {
          this.errorMessage = 'Error al cargar notificaciones: ' + (response.data.message || 'Error desconocido.');
          console.error('Error al cargar notificaciones:', response.status, response.data);
        }
      } catch (error) {
        console.error('Error en la solicitud para obtener notificaciones:', error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.errorMessage = 'Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión.';
          localStorage.removeItem('userToken');
          sessionStorage.removeItem('userToken');
          this.$router.push({ name: 'Principal' });
        } else {
          this.errorMessage = 'Error de conexión con el servidor o al obtener notificaciones.';
        }
      } finally {
        this.isLoading = false;
      }
    },
    getNotificationIcon(type) {
      switch (type) {
        case 'solicitud_contacto':
          return 'fas fa-handshake';
        case 'solicitud_aceptada':
          return 'fas fa-check-circle text-success';
        case 'solicitud_rechazada':
          return 'fas fa-times-circle text-danger';
        case 'nuevo_desafio': // Icono para nuevos desafíos
          return 'fas fa-bullhorn';
        // Agrega más tipos de notificación e iconos aquí
        default:
          return 'fas fa-bell';
      }
    },
    async markNotificationAsRead(id_notificacion) {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          console.warn('No hay token de autenticación para marcar notificación como leída.');
          return;
        }
        await axios.patch(`http://localhost:4000/api/notificaciones/${id_notificacion}/leida`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Actualizar el estado en el frontend
        const index = this.notifications.findIndex(n => n.id_notificacion === id_notificacion);
        if (index !== -1) {
          this.$set(this.notifications[index], 'leida', 1);
        }
      } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
      }
    },
    handleNotificationClick(notification) {
      // Marcar la notificación como leída si no lo está
      if (!notification.leida) {
        this.markNotificationAsRead(notification.id_notificacion);
      }

      // Lógica de redirección o apertura de modal según el tipo de notificación
      if (notification.tipo_notificacion === 'solicitud_contacto') {
        // Si es una solicitud de contacto, se maneja con los botones Aceptar/Rechazar
        // o con la visualización de detalles de contacto si ya fue aceptada.
        // No hay una acción de clic global que haga algo si ya está aceptada/rechazada.
        // Puedes implementar aquí abrir un modal con la información si lo deseas.
        console.log("Notificación de solicitud de contacto clickeada. Las acciones están en los botones.");
      } else if (notification.tipo_notificacion === 'solicitud_aceptada' || notification.tipo_notificacion === 'solicitud_rechazada') {
        this.openAcceptedRejectedModal(notification);
      } else if (notification.tipo_notificacion === 'nuevo_desafio') {
        // NUEVA LÓGICA: Redirigir a la página de detalles del desafío
        if (notification.id_referencia) { // id_referencia debe ser el id_desafio
          this.$router.push({ name: 'PaginaDetalleDesafio', params: { id: notification.id_referencia } });
          console.log('Redirigiendo a detalles del desafío:', notification.id_referencia);
        } else {
          console.warn('Notificación de nuevo desafío sin id_referencia. No se puede redirigir.');
          this.showMessage('Error de Notificación', 'Esta notificación de desafío no tiene un ID válido para redirigir.');
        }
      }
      // Puedes añadir más casos para otros tipos de notificación aquí
    },
    async acceptContactRequest(notification) {
      console.log('Aceptando solicitud:', notification.id_referencia);
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const response = await axios.patch(`http://localhost:4000/api/solicitudes/${notification.id_referencia}/aceptar`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 200) {
          this.showMessage('Solicitud Aceptada', '¡Has aceptado la solicitud de contacto!');
          await this.markNotificationAsRead(notification.id_notificacion);
          await this.fetchNotifications(); // Recargar notificaciones para actualizar el estado
        } else {
          this.showErrorMessage('Error al Aceptar Solicitud', 'No se pudo aceptar la solicitud. Inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('Error al aceptar solicitud:', error);
        this.showErrorMessage('Error al Aceptar Solicitud', 'Error de conexión o problema al procesar la solicitud.');
      }
    },
    async rejectContactRequest(notification) {
      console.log('Rechazando solicitud:', notification.id_referencia);
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const response = await axios.patch(`http://localhost:4000/api/solicitudes/${notification.id_referencia}/rechazar`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 200) {
          this.showMessage('Solicitud Rechazada', 'Has rechazado la solicitud de contacto.');
          await this.markNotificationAsRead(notification.id_notificacion);
          await this.fetchNotifications(); // Recargar notificaciones
        } else {
          this.showErrorMessage('Error al Rechazar Solicitud', 'No se pudo rechazar la solicitud. Inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('Error al rechazar solicitud:', error);
        this.showErrorMessage('Error al Rechazar Solicitud', 'Error de conexión o problema al procesar la solicitud.');
      }
    },
    // Métodos para mostrar/ocultar modales
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
    openAcceptedRejectedModal(notification) {
      this.acceptedRejectedNotification = { ...notification }; // Copiar para evitar mutar el original
      this.showAcceptedRejectedModal = true;
    },
    closeAcceptedRejectedModal() {
      this.showAcceptedRejectedModal = false;
      this.acceptedRejectedNotification = {};
    },
    markAsReadAndCloseAcceptedRejectedModal(id_notificacion) {
      this.markNotificationAsRead(id_notificacion);
      this.closeAcceptedRejectedModal();
      this.fetchNotifications(); // Recargar para que la notificación se actualice como leída
    },
    // Este método es para mostrar los detalles de contacto de una solicitud ACEPTADA
    async openContactDetailsModal(notification) {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const response = await axios.get(`http://localhost:4000/api/solicitudes/${notification.id_referencia}/details`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 200) {
          this.selectedContactDetails = response.data; // Aquí debes recibir los datos de contacto y el nombre del usuario emisor
          this.showContactDetailsModal = true;
          // Marcar como leída después de abrir el modal si no lo está
          if (!notification.leida) {
            this.markNotificationAsRead(notification.id_notificacion);
          }
        } else {
          this.showErrorMessage('Error', 'No se pudieron cargar los detalles de contacto.');
        }
      } catch (error) {
        console.error('Error al obtener detalles de contacto:', error);
        this.showErrorMessage('Error', 'Error de conexión o al obtener detalles de contacto.');
      }
    },
    closeContactDetailsModal() {
      this.showContactDetailsModal = false;
      this.selectedContactDetails = {};
    },
    markAsReadAndCloseContactModal(id_notificacion) {
      this.markNotificationAsRead(id_notificacion);
      this.closeContactDetailsModal();
      this.fetchNotifications(); // Recargar para que la notificación se actualice como leída
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    }
  }
};
</script>

<style scoped>
/* Estilos existentes */
.pagina-notificaciones-container {
  padding: 20px;
  max-width: 800px;
  margin: 20px auto;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #333;
}

h2 {
  text-align: center;
  color: #0056b3;
  margin-bottom: 30px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #6c757d; /* Gris */
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s ease;
  margin-bottom: 25px;
}

.back-button:hover {
  background-color: #5a6268;
}

.loading-message, .error-message, .no-notifications-message {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
  color: #666;
}

.error-message {
  color: #d9534f;
  background-color: #f2dede;
  border: 1px solid #ebccd1;
  border-radius: 4px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease-in-out, background-color 0.2s ease;
  cursor: pointer;
}

.notification-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
}

.notification-card.unread {
  background-color: #e6f7ff; /* Fondo azul claro para no leídas */
  border-left: 5px solid #007bff; /* Barra lateral azul */
}

.notification-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.notification-header i {
  font-size: 1.5em;
  margin-right: 10px;
  color: #007bff; /* Color predeterminado para iconos */
}

.notification-header h3 {
  margin: 0;
  font-size: 1.2em;
  color: #333;
  flex-grow: 1;
}

.notification-message {
  font-size: 0.95em;
  color: #555;
  margin-bottom: 10px;
}

.notification-date {
  font-size: 0.8em;
  color: #888;
  text-align: right;
}

/* Estilos específicos para solicitudes de contacto */
.solicitud-acciones {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.solicitud-estado {
  font-weight: bold;
  color: #007bff;
  margin-bottom: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-accept, .btn-reject, .btn-view-status {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s ease;
}

.btn-accept {
  background-color: #28a745;
  color: white;
}

.btn-accept:hover {
  background-color: #218838;
}

.btn-reject {
  background-color: #dc3545;
  color: white;
}

.btn-reject:hover {
  background-color: #c82333;
}

.btn-view-status {
  background-color: #007bff;
  color: white;
}

.btn-view-status:hover {
  background-color: #0056b3;
}

.contact-details {
  margin-top: 10px;
  background-color: #f0f8ff;
  border: 1px solid #cceeff;
  border-radius: 5px;
  padding: 10px;
  font-size: 0.9em;
}

.contact-details p {
  margin: 5px 0;
}

/* Estilos para modales (reutilizados y específicos) */
.message-modal-overlay {
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
}

.message-modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
  max-width: 450px;
  width: 90%;
  text-align: center;
  position: relative;
}

.modal-close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}
.modal-close-button:hover {
  color: #555;
}


.message-modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.message-modal-message {
  font-size: 1rem;
  color: #555;
  margin-bottom: 20px;
}

.message-modal-button-close {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out;
  cursor: pointer;
  border: none;
}

.message-modal-button-close:hover {
  background-color: #0056b3;
}

.contact-details-modal-info p {
  margin: 8px 0;
  font-size: 1em;
  color: #444;
}

.icon-container {
  font-size: 3em;
  margin-bottom: 15px;
}

.success-icon {
  color: #28a745; /* Verde para éxito */
}

.error-icon {
  color: #dc3545; /* Rojo para error */
}

.success-title {
  color: #28a745;
}

.error-title {
  color: #dc3545;
}

.received-date {
  font-size: 0.9em;
  color: #777;
  margin-top: 15px;
}
</style>