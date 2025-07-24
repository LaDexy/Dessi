<template>
  <div class="notifications-page-wrapper p-4 sm:p-6 md:p-8 lg:p-10">
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
      <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Tus Notificaciones
      </h1>

      <button
        @click="goBack"
        class="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
      >
        <i class="fas fa-arrow-left mr-2"></i> Volver
      </button>

      <div v-if="loading" class="text-center py-10">
        <p class="text-gray-600 text-lg">Cargando notificaciones...</p>
        <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mt-4"></i>
      </div>

      <div v-else-if="error" class="text-center py-10 text-red-600">
        <p class="text-lg font-semibold">Error al cargar notificaciones:</p>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="notifications.length === 0" class="text-center py-10">
        <p class="text-gray-500 text-xl">
          <i class="fas fa-bell-slash text-5xl mb-4 text-gray-400"></i><br />
          No tienes notificaciones por el momento.
        </p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="notification in sortedNotifications"
          :key="notification.id_notificacion"
          :class="[
            'notification-card p-4 rounded-lg shadow-sm transition-all duration-300 ease-in-out',
            notification.leida ? 'bg-gray-100 text-gray-600 opacity-80' : 'bg-white text-gray-800 border border-blue-200',
            { 'border-l-4 border-blue-500': !notification.leida && notification.tipo_notificacion !== 'solicitud_contacto' },
            { 'border-l-4 border-green-500': notification.tipo_notificacion === 'solicitud_contacto' && notification.estatus_solicitud === 'Pendiente' && !notification.leida }
          ]"
        >
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <i :class="getNotificationIcon(notification.tipo_notificacion)" class="text-2xl sm:text-3xl text-blue-500"></i>
            </div>
            <div class="flex-grow">
              <h3 class="font-bold text-lg sm:text-xl mb-1">{{ notification.titulo }}</h3>
              <p class="text-sm sm:text-base mb-2">{{ notification.mensaje }}</p>
              <p class="text-xs text-gray-400 mt-1">
                Recibida el: {{ formatDate(notification.creado_en) }}
              </p>

              <!-- Acciones para Solicitudes de Contacto Pendientes -->
              <div
                v-if="notification.tipo_notificacion === 'solicitud_contacto' && notification.estatus_solicitud === 'Pendiente'"
                class="mt-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2"
              >
                <button
                  @click="acceptRequest(notification.id_referencia, notification.id_notificacion)"
                  class="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 text-sm font-medium shadow-md"
                >
                  <i class="fas fa-check-circle mr-2"></i> Aceptar
                </button>
                <button
                  @click="rejectRequest(notification.id_referencia, notification.id_notificacion)"
                  class="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm font-medium shadow-md"
                >
                  <i class="fas fa-times-circle mr-2"></i> Rechazar
                </button>
              </div>
              <!-- Estado de Solicitudes de Contacto ya manejadas -->
              <div
                v-else-if="notification.tipo_notificacion === 'solicitud_contacto' && notification.estatus_solicitud !== 'Pendiente'"
                :class="[
                  'mt-3 text-sm font-semibold',
                  notification.estatus_solicitud === 'Aceptada' ? 'text-green-600' : 'text-red-600'
                ]"
              >
                <i :class="notification.estatus_solicitud === 'Aceptada' ? 'fas fa-check-double' : 'fas fa-ban'" class="mr-1"></i>
                Solicitud {{ notification.estatus_solicitud }}
              </div>

              <!-- Botón para marcar como leído (para otras notificaciones no manejables) -->
              <div v-if="!notification.leida && notification.tipo_notificacion !== 'solicitud_contacto'" class="mt-3">
                <button
                  @click="markAsRead(notification.id_notificacion)"
                  class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 text-xs font-medium"
                >
                  Marcar como leído
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para mostrar datos de contacto al aceptar -->
    <div v-if="showContactDetailsModal" class="modal-overlay">
      <div class="modal-content">
        <button @click="closeContactDetailsModal" class="modal-close-button">
          &times;
        </button>
        <h3 class="text-2xl font-bold text-gray-800 mb-4">
          Datos de Contacto de {{ currentContactDetails.emisor_nombre }}
        </h3>
        <div class="text-left text-gray-700 space-y-2">
          <p v-if="currentContactDetails.emisor_email">
            <strong>Correo:</strong> {{ currentContactDetails.emisor_email }}
          </p>
          <p v-if="currentContactDetails.emisor_whatsapp">
            <strong>WhatsApp:</strong> {{ currentContactDetails.emisor_whatsapp }}
          </p>
          <p v-if="currentContactDetails.emisor_instagram">
            <strong>Instagram:</strong> {{ currentContactDetails.emisor_instagram }}
          </p>
          <p v-if="currentContactDetails.emisor_tiktok">
            <strong>TikTok:</strong> {{ currentContactDetails.emisor_tiktok }}
          </p>
          <p v-if="currentContactDetails.emisor_facebook">
            <strong>Facebook:</strong> {{ currentContactDetails.emisor_facebook }}
          </p>
        </div>
        <button @click="closeContactDetailsModal" class="button-primary mt-6">
          Cerrar
        </button>
      </div>
    </div>

    <!-- Modal de Mensaje Genérico (reutilizado de PaginaCentral) -->
    <div v-if="showMessageModal" class="message-modal-overlay">
      <div class="message-modal-content">
        <h3 class="message-modal-title">{{ messageModalTitle }}</h3>
        <p class="message-modal-message">{{ messageModalMessage }}</p>
        <div class="message-modal-actions">
          <button @click="closeMessageModal" class="message-modal-button-close">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PaginaNotificaciones",
  data() {
    return {
      notifications: [],
      loading: true,
      error: null,
      showContactDetailsModal: false,
      currentContactDetails: {},
      showMessageModal: false, // Para mensajes de éxito/error
      messageModalTitle: "",
      messageModalMessage: "",
    };
  },
  computed: {
    sortedNotifications() {
      // Ordenar notificaciones: no leídas/pendientes primero, luego por fecha descendente
      return [...this.notifications].sort((a, b) => {
        // Solicitudes pendientes primero
        const aIsPendingRequest = a.tipo_notificacion === 'solicitud_contacto' && a.estatus_solicitud === 'Pendiente';
        const bIsPendingRequest = b.tipo_notificacion === 'solicitud_contacto' && b.estatus_solicitud === 'Pendiente';

        if (aIsPendingRequest && !bIsPendingRequest) return -1;
        if (!aIsPendingRequest && bIsPendingRequest) return 1;

        // Luego, notificaciones no leídas
        if (!a.leida && b.leida) return -1;
        if (a.leida && !b.leida) return 1;

        // Finalmente, por fecha (más reciente primero)
        return new Date(b.creado_en) - new Date(a.creado_en);
      });
    },
  },
  async created() {
    await this.fetchNotifications();
  },
  methods: {
    goBack() {
      this.$router.go(-1); // Vuelve a la página anterior
    },
    async fetchNotifications() {
      this.loading = true;
      this.error = null;
      try {
        const token =
          localStorage.getItem("userToken") ||
          sessionStorage.getItem("userToken");
        if (!token) {
          this.error = "No hay token de autenticación. Por favor, inicia sesión.";
          this.$router.push({ name: "Principal" }); // Redirige al login si no hay token
          return;
        }

        // Obtener todas las notificaciones (leídas y no leídas)
        const response = await axios.get("http://localhost:4000/api/notificaciones", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.notifications = response.data;

        // Si se llegó a esta página desde una solicitud específica, marcarla como leída
        // y opcionalmente abrir el modal de detalles si es una solicitud de contacto
        const solicitudIdFromUrl = this.$route.query.solicitud;
        if (solicitudIdFromUrl) {
          const notificationForRequest = this.notifications.find(
            (n) => n.tipo_notificacion === 'solicitud_contacto' && String(n.id_referencia) === solicitudIdFromUrl
          );
          if (notificationForRequest && !notificationForRequest.leida) {
            await this.markAsRead(notificationForRequest.id_notificacion);
            // Si es una solicitud pendiente, abrir el modal de detalles
            if (notificationForRequest.estatus_solicitud === 'Pendiente') {
              this.currentContactDetails = notificationForRequest;
              this.showContactDetailsModal = true;
            }
          }
        }

      } catch (err) {
        console.error("Error al cargar notificaciones:", err);
        if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
          this.error = "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.";
          this.$router.push({ name: "Principal" });
        } else {
          this.error = "No se pudieron cargar las notificaciones. Inténtalo de nuevo más tarde.";
        }
      } finally {
        this.loading = false;
      }
    },
    async markAsRead(notificationId) {
      try {
        const token =
          localStorage.getItem("userToken") ||
          sessionStorage.getItem("userToken");
        if (!token) return;

        await axios.patch(
          `http://localhost:4000/api/notificaciones/${notificationId}/marcar-leida`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Actualizar el estado 'leida' en el array local de notificaciones
        const index = this.notifications.findIndex(
          (n) => n.id_notificacion === notificationId
        );
        if (index !== -1) {
          this.notifications[index].leida = true;
        }
        // Emitir un evento global para que IconoNotificaciones actualice su contador
        this.$emit('notifications-updated'); // Esto lo escuchará el componente padre (App.vue o similar)
      } catch (err) {
        console.error("Error al marcar notificación como leída:", err);
        this.showErrorMessage("Error", "No se pudo marcar la notificación como leída.");
      }
    },
    async acceptRequest(solicitudId, notificationId) {
      try {
        const token =
          localStorage.getItem("userToken") ||
          sessionStorage.getItem("userToken");
        if (!token) return;

        await axios.patch(
          `http://localhost:4000/api/solicitudes/${solicitudId}/aceptar`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Actualizar el estado de la solicitud en el array local
        const notificationIndex = this.notifications.findIndex(
          (n) => n.id_referencia === solicitudId && n.tipo_notificacion === 'solicitud_contacto'
        );
        if (notificationIndex !== -1) {
          this.notifications[notificationIndex].estatus_solicitud = 'Aceptada';
          this.notifications[notificationIndex].leida = true; // Marcar como leída al manejar
        }

        // Marcar la notificación específica como leída en la DB
        await this.markAsRead(notificationId);

        // Mostrar el modal con los datos de contacto
        const acceptedNotification = this.notifications[notificationIndex];
        this.currentContactDetails = {
          emisor_nombre: acceptedNotification.emisor_nombre,
          emisor_email: acceptedNotification.emisor_email,
          emisor_whatsapp: acceptedNotification.emisor_whatsapp,
          emisor_instagram: acceptedNotification.emisor_instagram,
          emisor_tiktok: acceptedNotification.emisor_tiktok,
          emisor_facebook: acceptedNotification.emisor_facebook,
        };
        this.showContactDetailsModal = true;
        this.showMessage("Solicitud Aceptada", "¡Has aceptado la solicitud de contacto!");

      } catch (err) {
        console.error("Error al aceptar solicitud:", err);
        this.showErrorMessage("Error", "No se pudo aceptar la solicitud.");
      }
    },
    async rejectRequest(solicitudId, notificationId) {
      try {
        const token =
          localStorage.getItem("userToken") ||
          sessionStorage.getItem("userToken");
        if (!token) return;

        await axios.patch(
          `http://localhost:4000/api/solicitudes/${solicitudId}/rechazar`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Actualizar el estado de la solicitud en el array local
        const notificationIndex = this.notifications.findIndex(
          (n) => n.id_referencia === solicitudId && n.tipo_notificacion === 'solicitud_contacto'
        );
        if (notificationIndex !== -1) {
          this.notifications[notificationIndex].estatus_solicitud = 'Rechazada';
          this.notifications[notificationIndex].leida = true; // Marcar como leída al manejar
        }

        // Marcar la notificación específica como leída en la DB
        await this.markAsRead(notificationId);
        this.showMessage("Solicitud Rechazada", "Has rechazado la solicitud de contacto.");
      } catch (err) {
        console.error("Error al rechazar solicitud:", err);
        this.showErrorMessage("Error", "No se pudo rechazar la solicitud.");
      }
    },
    closeContactDetailsModal() {
      this.showContactDetailsModal = false;
      this.currentContactDetails = {};
      // Después de cerrar el modal de detalles, recargar las notificaciones
      // para asegurar que el estado visual esté actualizado (ej. el badge)
      this.fetchNotifications();
    },
    getNotificationIcon(type) {
      switch (type) {
        case 'solicitud_contacto':
        case 'solicitud_aceptada':
        case 'solicitud_rechazada':
          return 'fas fa-handshake'; // Icono para solicitudes
        case 'desafio_participacion':
          return 'fas fa-trophy'; // Icono para desafíos
        case 'foro_reaccion':
          return 'fas fa-heart'; // Icono para reacciones en foro
        case 'foro_respuesta':
          return 'fas fa-reply'; // Icono para respuestas en foro
        case 'desafio_propuesta':
          return 'fas fa-lightbulb'; // Icono para propuestas en desafío
        default:
          return 'fas fa-bell'; // Icono por defecto
      }
    },
    formatDate(dateString) {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString("es-ES", options);
    },
    showErrorMessage(title, message) {
      this.messageModalTitle = title;
      this.messageModalMessage = message;
      this.showMessageModal = true;
    },
    showMessage(title, message) {
      this.messageModalTitle = title;
      this.messageModalMessage = message;
      this.showMessageModal = true;
    },
    closeMessageModal() {
      this.showMessageModal = false;
      this.messageModalTitle = "";
      this.messageModalMessage = "";
    },
  },
};
</script>

<style>
/* Estilos generales de la página de notificaciones */
.notifications-page-wrapper {
  min-height: calc(100vh - 80px); /* Ajusta según el header/footer si tienes */
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Alinea el contenido arriba */
  align-items: center;
  background-color: #f0f2f5; /* Fondo suave */
}

.notification-card {
  border-radius: 0.75rem; /* rounded-lg */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* shadow-md */
}

.notification-card.bg-white {
    border: 1px solid #e2e8f0; /* border-gray-200 */
}

.notification-card.bg-gray-100 {
    border: 1px solid #cbd5e0; /* border-gray-300 */
}

/* Estilos para el modal de datos de contacto (reutilizados del simulador) */
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
  z-index: 2000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  text-align: center;
  position: relative;
}

.modal-close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
}

.modal-close-button:hover {
  color: #ff4d4f;
}

/* Estilos para el modal de mensaje genérico (reutilizados de PaginaCentral) */
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
  z-index: 3000; /* Asegúrate de que esté por encima de otros modales si se usan juntos */
}

.message-modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
  max-width: 400px;
  width: 90%;
  text-align: center;
  position: relative;
}

.message-modal-title {
  font-size: 1.5rem; /* text-2xl */
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.message-modal-message {
  font-size: 1rem; /* text-base */
  color: #555;
  margin-bottom: 20px;
}

.message-modal-button-close {
  background-color: #007bff; /* blue-600 */
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out;
  cursor: pointer;
  border: none;
}

.message-modal-button-close:hover {
  background-color: #0056b3; /* blue-700 */
}

/* Estilos para botones de acción en notificaciones */
.button-small {
    padding: 0.375rem 0.75rem; /* px-3 py-1.5 */
    font-size: 0.875rem; /* text-sm */
}
</style>