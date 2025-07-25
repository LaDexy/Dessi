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
          <div class="action-buttons">
            <button @click.stop="openNewContactRequestModal(notification)" class="btn-view-status">Ver Solicitud</button>
          </div>
        </div>
        <div v-else-if="notification.tipo_notificacion === 'solicitud_aceptada' || notification.tipo_notificacion === 'solicitud_rechazada'">
          <button @click.stop="openAcceptedRejectedModal(notification)" class="btn-view-status">Ver Estado</button>
        </div>
        
        <div class="notification-actions">
            <button
                v-if="!notification.leida && 
                     notification.tipo_notificacion !== 'solicitud_contacto' &&
                     notification.tipo_notificacion !== 'solicitud_aceptada' &&
                     notification.tipo_notificacion !== 'solicitud_rechazada'"
                @click.stop="markNotificationAsRead(notification.id_notificacion)"
                class="action-button mark-read-button"
            >
                Marcar como leído
            </button>
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

    <div v-if="showNewContactRequestModal" class="message-modal-overlay">
      <div class="message-modal-content">
        <button @click="closeNewContactRequestModal" class="modal-close-button">&times;</button>
        <h3 class="message-modal-title">Nueva Solicitud de Contacto</h3>
        <p class="message-modal-message">
          Has recibido una solicitud de contacto de **{{ selectedNewRequest.nombre_usuario_emisor || 'un usuario' }}**.
          ¿Deseas aceptar o rechazar esta solicitud?
        </p>
        <div class="contact-details-modal-info">
            <p><strong>Mensaje:</strong> {{ selectedNewRequest.mensaje_solicitud || 'N/A' }}</p>
            <p><strong>Email de contacto:</strong> {{ selectedNewRequest.email_emisor || 'N/A' }}</p>
            <p v-if="selectedNewRequest.emisor_whatsapp"><strong>WhatsApp:</strong> {{ selectedNewRequest.emisor_whatsapp }}</p>
            <p v-if="selectedNewRequest.emisor_instagram"><strong>Instagram:</strong> {{ selectedNewRequest.emisor_instagram }}</p>
            <p v-if="selectedNewRequest.emisor_tiktok"><strong>TikTok:</strong> {{ selectedNewRequest.emisor_tiktok }}</p>
            <p v-if="selectedNewRequest.emisor_facebook"><strong>Facebook:</strong> {{ selectedNewRequest.emisor_facebook }}</p>
        </div>
        <div class="message-modal-actions">
          <button @click="acceptContactRequestFromModal(selectedNewRequest)" class="btn-accept">Aceptar</button>
          <button @click="rejectContactRequestFromModal(selectedNewRequest)" class="btn-reject">Rechazar</button>
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
      acceptedRejectedNotification: {}, 
      showNewContactRequestModal: false,
      selectedNewRequest: {}, 
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
          this.$router.push({ name: 'Principal' }); // <<< CAMBIADO AQUÍ: Asumiendo que 'Principal' es tu ruta de login/inicio
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
        case 'nuevo_desafio':
          return 'fas fa-bullhorn';
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
        await axios.patch(`http://localhost:4000/api/notificaciones/${id_notificacion}/marcar-leida`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const index = this.notifications.findIndex(n => n.id_notificacion === id_notificacion);
        if (index !== -1) {
          this.notifications[index].leida = 1; 
        }
        if (this.selectedNotification && this.selectedNotification.id_notificacion === id_notificacion) {
            this.selectedNotification.leida = 1;
        }
        await this.fetchNotifications(); 
      } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
      }
    },
    handleNotificationClick(notification) {
      if (notification.tipo_notificacion === 'solicitud_contacto' ||
          notification.tipo_notificacion === 'solicitud_aceptada' ||
          notification.tipo_notificacion === 'solicitud_rechazada') {
        console.log("Notificación de solicitud clickeada. Las acciones están en los botones específicos.");
        return;
      }

      if (notification.tipo_notificacion === 'nuevo_desafio') {
        if (notification.id_referencia) {
          this.$router.push({ name: 'PaginaDetalleDesafio', params: { id: notification.id_referencia } });
          console.log('Redirigiendo a detalles del desafío:', notification.id_referencia);
        } else {
          console.warn('Notificación de nuevo desafío sin id_referencia. No se puede redirigir.');
          this.showMessage('Error de Notificación', 'Esta notificación de desafío no tiene un ID válido para redirigir.');
        }
      }
    },
    openNewContactRequestModal(notification) {
      this.selectedNewRequest = { ...notification };
      this.showNewContactRequestModal = true;
    },
    closeNewContactRequestModal() {
      this.showNewContactRequestModal = false;
      this.selectedNewRequest = {};
    },
    async acceptContactRequestFromModal(notification) {
      console.log('Aceptando solicitud desde modal:', notification.id_referencia);
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const response = await axios.patch(`http://localhost:4000/api/solicitudes/${notification.id_referencia}/aceptar`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 200) {
          this.showMessage('Solicitud Aceptada', '¡Has aceptado la solicitud de contacto!');
          await this.markNotificationAsRead(notification.id_notificacion);
          this.closeNewContactRequestModal();
        } else {
          this.showErrorMessage('Error al Aceptar Solicitud', 'No se pudo aceptar la solicitud. Inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('Error al aceptar solicitud desde modal:', error);
        this.showErrorMessage('Error al Aceptar Solicitud', 'Error de conexión o problema al procesar la solicitud.');
      }
    },
    async rejectContactRequestFromModal(notification) {
      console.log('Rechazando solicitud desde modal:', notification.id_referencia);
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const response = await axios.patch(`http://localhost:4000/api/solicitudes/${notification.id_referencia}/rechazar`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 200) {
          this.showMessage('Solicitud Rechazada', 'Has rechazado la solicitud de contacto.');
          await this.markNotificationAsRead(notification.id_notificacion);
          this.closeNewContactRequestModal();
        } else {
          this.showErrorMessage('Error al Rechazar Solicitud', 'No se pudo rechazar la solicitud. Inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('Error al rechazar solicitud desde modal:', error);
        this.showErrorMessage('Error al Rechazar Solicitud', 'Error de conexión o problema al procesar la solicitud.');
      }
    },
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
      this.acceptedRejectedNotification = { ...notification };
      this.showAcceptedRejectedModal = true;
    },
    closeAcceptedRejectedModal() {
      this.showAcceptedRejectedModal = false;
      this.acceptedRejectedNotification = {};
    },
    markAsReadAndCloseAcceptedRejectedModal(id_notificacion) {
      this.markNotificationAsRead(id_notificacion);
      this.closeAcceptedRejectedModal();
    },
    async openContactDetailsModal(notification) {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const response = await axios.get(`http://localhost:4000/api/solicitudes/${notification.id_referencia}/details`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 200) {
          this.selectedContactDetails = response.data;
          this.showContactDetailsModal = true;
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
    - Un verde para aceptar: #8bc34a (Light Green 500 de Material Design)
    - Un rojo para rechazar: #ef5350 (Red 400 de Material Design)
    - Blanco muy suave: #fcfcfc
*/

.pagina-notificaciones-container {
  padding: 20px;
  max-width: 800px;
  margin: 20px auto;
  background-color: #fcfcfc; /* Un blanco muy suave */
  border-radius: 12px; /* Bordes más redondeados */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); /* Sombra más pronunciada pero suave */
  color: #333;
  font-family: 'Arial', sans-serif; /* Puedes ajustar la fuente si tienes una específica */
}

h2 {
  text-align: center;
  color: #5e1c7d; /* Título principal en morado oscuro */
  margin-bottom: 30px;
  font-size: 2.2em; /* Título un poco más grande */
  font-weight: 700; /* Más negrita para los títulos */
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
  font-size: 1.05em; /* Un poco más grande */
  font-weight: 600; /* Texto seminegrita */
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 25px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); /* Sombra ligera */
}

.back-button:hover {
  background-color: #c0a8c0; /* Tono ligeramente más oscuro al pasar el ratón */
  transform: translateY(-2px); /* Pequeño levantamiento */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.loading-message, .error-message, .no-notifications-message {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
  color: #5e1c7d; /* Mensajes en morado oscuro */
  background-color: #f2e6f2; /* Fondo muy suave para mensajes */
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
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
  padding: 18px 22px; /* Más padding para que respire */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); /* Sombra suave */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease;
  cursor: pointer;
  position: relative; /* Para el indicador de no leído */
  overflow: hidden; /* Asegura que la barra izquierda no se salga */
}

.notification-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12); /* Sombra más pronunciada al pasar el ratón */
}

.notification-card.unread {
  background-color: #f7eff7; /* Rosa-morado pastel muy suave para no leídas */
  border-left: 6px solid #5e1c7d; /* Barra lateral en morado oscuro, un poco más ancha */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), 0 0 0 1px #5e1c7d; /* Añade un borde sutil para destacar más */
}

.notification-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.notification-header i {
  font-size: 1.7em; /* Icono un poco más grande */
  margin-right: 15px;
  color: #5e1c7d; /* Color del icono en morado oscuro */
  min-width: 30px; /* Evita que el texto se superponga si el icono es muy pequeño */
  text-align: center;
}

.notification-header h3 {
  margin: 0;
  font-size: 1.3em; /* Título de notificación ligeramente más grande */
  color: #5e1c7d; /* Título de notificación en morado oscuro */
  flex-grow: 1;
  font-weight: 600;
}

.notification-message {
  font-size: 1.05em; /* Mensaje ligeramente más grande */
  color: #444; /* Color de texto más estándar */
  margin-bottom: 12px;
  line-height: 1.5; /* Mejor legibilidad */
}

.notification-date {
  font-size: 0.88em; /* Fecha un poco más grande */
  color: #777;
  text-align: right;
  margin-top: 10px;
}

/* Estilos específicos para solicitudes de contacto */
.solicitud-acciones {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* Alinea los elementos a la derecha */
}

.solicitud-estado {
  font-weight: bold;
  color: #5e1c7d; /* Estado en morado oscuro */
  margin-bottom: 10px;
  align-self: flex-start; /* Alinea el estado a la izquierda */
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn-accept, .btn-reject, .btn-view-status {
  padding: 9px 20px; /* Más padding */
  border: none;
  border-radius: 22px; /* Bordes muy redondeados */
  cursor: pointer;
  font-size: 0.98em; /* Un poco más grande */
  font-weight: 600;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  white-space: nowrap; /* Evita que el texto del botón se rompa */
}

.btn-accept {
  background-color: #8bc34a; /* Verde suave para aceptar */
  color: white;
}

.btn-accept:hover {
  background-color: #7cb342; /* Verde más oscuro al pasar el ratón */
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.btn-reject {
  background-color: #ef5350; /* Rojo suave para rechazar */
  color: white;
}

.btn-reject:hover {
  background-color: #e53935; /* Rojo más oscuro al pasar el ratón */
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.btn-view-status {
  background-color: #5e1c7d; /* Morado oscuro */
  color: white;
}

.btn-view-status:hover {
  background-color: #4a148c; /* Morado más oscuro al pasar el ratón */
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
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
  background-color: rgba(0, 0, 0, 0.6); /* Opacidad media-alta para el fondo */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px); /* Efecto de desenfoque en el fondo */
}

.message-modal-content {
  background-color: #ffffff;
  padding: 35px 30px; /* Más padding en general */
  border-radius: 18px; /* Bordes más redondeados */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); /* Sombra más profunda y notable */
  max-width: 500px; /* Un poco más de ancho máximo */
  width: 90%;
  text-align: center;
  position: relative;
  animation: fadeIn 0.3s ease-out; /* Animación de entrada */
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-close-button {
  position: absolute;
  top: 15px;
  right: 18px;
  background: none;
  border: none;
  font-size: 30px; /* Icono de cierre más grande */
  cursor: pointer;
  color: #b71c1c; /* Un rojo más oscuro y distintivo */
  transition: transform 0.2s ease, color 0.2s ease;
}
.modal-close-button:hover {
  color: #8c0000;
  transform: rotate(90deg) scale(1.1); /* Gira y se agranda ligeramente */
}


.message-modal-title {
  font-size: 2rem; /* Título de modal más grande */
  font-weight: bold;
  color: #5e1c7d; /* Título de modal en morado oscuro */
  margin-bottom: 20px;
  line-height: 1.2;
}

.message-modal-message {
  font-size: 1.15rem; /* Mensaje de modal más grande */
  color: #444;
  margin-bottom: 30px; /* Más espacio */
  line-height: 1.6;
}

.message-modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px; /* Espacio entre botones en acciones del modal */
  margin-top: 20px; /* Espacio superior para separar del texto */
}

.message-modal-button-close {
  background-color: #d9bad9; /* Rosa-morado pastel para el botón de cerrar modal */
  color: #5e1c7d; /* Texto en morado oscuro */
  padding: 12px 28px; /* Más padding */
  border-radius: 25px; /* Bordes redondeados */
  font-weight: 600;
  transition: background-color 0.2s ease-in-out, transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-modal-button-close:hover {
  background-color: #c0a8c0; /* Tono ligeramente más oscuro */
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.contact-details-modal-info {
  text-align: left; /* Alinea el texto de los detalles a la izquierda */
  margin-bottom: 25px;
  background-color: #fcf6fc; /* Fondo muy suave para la info de contacto */
  border-radius: 10px;
  padding: 15px 20px;
  border: 1px solid #eee;
}
.contact-details-modal-info p {
  margin: 8px 0;
  font-size: 1.05em;
  color: #333;
  line-height: 1.4;
}
.contact-details-modal-info strong {
  color: #5e1c7d; /* Resalta las etiquetas fuertes */
}


.icon-container {
  font-size: 4em; /* Iconos más grandes en el modal */
  margin-bottom: 20px;
  display: flex; /* Para centrar el icono */
  justify-content: center;
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
  font-size: 0.95em;
  color: #888;
  margin-top: 20px; /* Más espacio superior */
}

/* Nuevos estilos para el botón "Marcar como leído" */
.action-button.mark-read-button {
    background-color: #793096; /* Morado oscuro para el botón de leído */
    color: white;
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 0.9em;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    border: none;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.action-button.mark-read-button:hover {
    background-color: #61257a; /* Un morado más oscuro al pasar el ratón */
    transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 600px) {
    .pagina-notificaciones-container {
        padding: 15px;
        margin: 10px auto;
        border-radius: 8px;
    }

    h2 {
        font-size: 1.8em;
        margin-bottom: 20px;
    }

    .back-button {
        padding: 8px 15px;
        font-size: 0.9em;
        margin-bottom: 20px;
    }

    .notification-card {
        padding: 15px;
        border-radius: 8px;
    }

    .notification-header i {
        font-size: 1.5em;
        margin-right: 10px;
    }

    .notification-header h3 {
        font-size: 1.1em;
    }

    .notification-message {
        font-size: 0.95em;
    }

    .notification-date {
        font-size: 0.8em;
    }

    .btn-accept, .btn-reject, .btn-view-status, .action-button.mark-read-button {
        padding: 7px 15px;
        font-size: 0.85em;
        border-radius: 18px;
    }

    .message-modal-content {
        padding: 25px 20px;
        border-radius: 12px;
        max-width: 95%;
    }

    .modal-close-button {
        font-size: 24px;
        top: 10px;
        right: 12px;
    }

    .message-modal-title {
        font-size: 1.5rem;
    }

    .message-modal-message {
        font-size: 1em;
    }

    .message-modal-actions {
        flex-direction: column; /* Apila los botones en móviles */
        gap: 10px;
    }
    .message-modal-button-close, .btn-accept, .btn-reject {
        width: 100%; /* Botones de ancho completo */
        margin-left: 0 !important; /* Resetea el margen si se establece en otro lugar */
    }
    .icon-container {
        font-size: 3em;
    }
}

</style>