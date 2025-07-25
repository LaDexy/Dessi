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
/* Colores de referencia:
   - hsl(300, 29%, 78%) = #d9bad9 (Rosa-morado pastel)
   - #5e1c7d (Morado oscuro)
*/

.pagina-notificaciones-container {
  padding: 20px;
  max-width: 800px;
  margin: 20px auto;
  background-color: #fcfcfc; /* Un blanco muy suave */
  border-radius: 12px; /* Bordes más redondeados */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); /* Sombra más pronunciada pero suave */
  color: #333;
}

h2 {
  text-align: center;
  color: #5e1c7d; /* Título principal en morado oscuro */
  margin-bottom: 30px;
  font-size: 2em; /* Título un poco más grande */
}

.back-button {
  display: inline-flex;
  align-items: center;
  padding: 10px 18px; /* Un poco más de padding */
  background-color: #d9bad9; /* Rosa-morado pastel para el botón Volver */
  color: #5e1c7d; /* Texto en morado oscuro */
  border: 1px solid #c0a8c0; /* Borde sutil del mismo tono */
  border-radius: 25px; /* Bordes muy redondeados (pastilla) */
  cursor: pointer;
  font-size: 1em; /* Un poco más grande */
  font-weight: 600; /* Texto seminegrita */
  transition: background-color 0.2s ease, transform 0.2s ease;
  margin-bottom: 25px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); /* Sombra ligera */
}

.back-button:hover {
  background-color: #c0a8c0; /* Tono ligeramente más oscuro al pasar el ratón */
  transform: translateY(-2px); /* Pequeño levantamiento */
}

.loading-message, .error-message, .no-notifications-message {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
  color: #5e1c7d; /* Mensajes en morado oscuro */
  background-color: #f2e6f2; /* Fondo muy suave para mensajes */
  border-radius: 8px;
  margin-top: 20px;
}

.error-message {
  color: #d84315; /* Un rojo más oscuro para errores */
  background-color: #ffe0b2; /* Fondo naranja suave para errores */
  border: 1px solid #ffcc80;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification-card {
  background-color: #ffffff; /* Fondo blanco para las tarjetas */
  border: 1px solid #eee; /* Borde muy sutil */
  border-radius: 10px; /* Bordes ligeramente más redondeados */
  padding: 15px 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08); /* Sombra suave */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease;
  cursor: pointer;
}

.notification-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12); /* Sombra más pronunciada al pasar el ratón */
}

.notification-card.unread {
  background-color: #f2e6f2; /* Rosa-morado pastel muy suave para no leídas */
  border-left: 5px solid #5e1c7d; /* Barra lateral en morado oscuro */
}

.notification-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.notification-header i {
  font-size: 1.6em; /* Icono un poco más grande */
  margin-right: 12px;
  color: #5e1c7d; /* Color del icono en morado oscuro */
}

.notification-header h3 {
  margin: 0;
  font-size: 1.25em; /* Título de notificación ligeramente más grande */
  color: #5e1c7d; /* Título de notificación en morado oscuro */
  flex-grow: 1;
}

.notification-message {
  font-size: 1em; /* Mensaje ligeramente más grande */
  color: #444; /* Color de texto más estándar */
  margin-bottom: 10px;
}

.notification-date {
  font-size: 0.85em; /* Fecha un poco más grande */
  color: #777;
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
  color: #5e1c7d; /* Estado en morado oscuro */
  margin-bottom: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-accept, .btn-reject, .btn-view-status {
  padding: 8px 18px; /* Más padding */
  border: none;
  border-radius: 20px; /* Bordes muy redondeados */
  cursor: pointer;
  font-size: 0.95em; /* Un poco más grande */
  font-weight: 600;
  transition: background-color 0.2s ease, transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-accept {
  background-color: #8bc34a; /* Verde suave para aceptar */
  color: white;
}

.btn-accept:hover {
  background-color: #7cb342; /* Verde más oscuro al pasar el ratón */
  transform: translateY(-1px);
}

.btn-reject {
  background-color: #ef5350; /* Rojo suave para rechazar */
  color: white;
}

.btn-reject:hover {
  background-color: #e53935; /* Rojo más oscuro al pasar el ratón */
  transform: translateY(-1px);
}

.btn-view-status {
  background-color: #5e1c7d; /* Morado oscuro */
  color: white;
}

.btn-view-status:hover {
  background-color: #4a148c; /* Morado más oscuro al pasar el ratón */
  transform: translateY(-1px);
}

.contact-details {
  margin-top: 10px;
  background-color: #f7eaf7; /* Fondo muy suave en el color pastel */
  border: 1px solid #e0c0e0;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.9em;
  color: #5e1c7d; /* Texto en morado oscuro */
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
  background-color: rgba(0, 0, 0, 0.5); /* Opacidad media */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.message-modal-content {
  background-color: #ffffff;
  padding: 30px; /* Más padding */
  border-radius: 15px; /* Bordes más redondeados */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* Sombra más profunda */
  max-width: 450px;
  width: 90%;
  text-align: center;
  position: relative;
}

.modal-close-button {
  position: absolute;
  top: 15px;
  right: 18px;
  background: none;
  border: none;
  font-size: 28px; /* Icono de cierre más grande */
  cursor: pointer;
  color: #a30000; /* Un rojo más oscuro */
  transition: transform 0.2s ease;
}
.modal-close-button:hover {
  color: #7a0000;
  transform: rotate(90deg); /* Gira al pasar el ratón */
}


.message-modal-title {
  font-size: 1.8rem; /* Título de modal más grande */
  font-weight: bold;
  color: #5e1c7d; /* Título de modal en morado oscuro */
  margin-bottom: 15px;
}

.message-modal-message {
  font-size: 1.1rem; /* Mensaje de modal más grande */
  color: #444;
  margin-bottom: 25px; /* Más espacio */
}

.message-modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px; /* Espacio entre botones en acciones del modal */
}

.message-modal-button-close {
  background-color: #d9bad9; /* Rosa-morado pastel para el botón de cerrar modal */
  color: #5e1c7d; /* Texto en morado oscuro */
  padding: 12px 25px; /* Más padding */
  border-radius: 25px; /* Bordes redondeados */
  font-weight: 600;
  transition: background-color 0.2s ease-in-out, transform 0.2s ease;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

.message-modal-button-close:hover {
  background-color: #c0a8c0; /* Tono ligeramente más oscuro */
  transform: translateY(-2px);
}

.contact-details-modal-info p {
  margin: 8px 0;
  font-size: 1.05em;
  color: #333;
}

.icon-container {
  font-size: 3.5em; /* Iconos más grandes en el modal */
  margin-bottom: 20px;
}

.success-icon {
  color: #8bc34a; /* Verde para éxito (de la paleta pastel) */
}

.error-icon {
  color: #ef5350; /* Rojo para error (de la paleta pastel) */
}

.success-title {
  color: #8bc34a; /* Verde para título de éxito */
}

.error-title {
  color: #ef5350; /* Rojo para título de error */
}

.received-date {
  font-size: 0.9em;
  color: #888;
  margin-top: 15px;
}
</style>