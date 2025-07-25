<template>
  <div>
    <div class="Notificaciones" @click="toggleNotificacionesModal">
     <i class="fa-solid fa-bell" style="color: #B197FC;"></i>
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
          <div v-for="notif in notifications" :key="notif.id_notificacion"
               :class="['notification-item', { 'unread': !notif.leida }]"
               @click="markAsReadAndRedirect(notif)">
            <p class="notification-message">{{ notif.mensaje }}</p>
            <p class="notification-date">{{ formatarFecha(notif.creado_fecha) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'; // Necesitas axios para hacer peticiones HTTP

export default {
  name: "IconoNotificaciones",
  components: {
  
  },
  data() {
    return {
      notifications: [], // Almacena todas las notificaciones del usuario
      newNotificationsCount: 0, // Contador para el badge de notificaciones no leídas
      isNotificacionesModalOpen: false, // Controla la visibilidad del modal de notificaciones
      pollInterval: null, // Para el polling (actualización periódica) de nuevas notificaciones
      apiUrl: 'http://localhost:4000/api', // URL base de tu backend Express.js
    };
  },
  methods: {
    // Método para obtener el token de autenticación del usuario
    getToken() {
      // Usa la misma lógica que tu PaginaCentral.vue
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

        const response = await axios.get(`${this.apiUrl}/notificaciones`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Actualiza la lista de notificaciones y cuenta las no leídas
        this.notifications = response.data;
        this.newNotificationsCount = this.notifications.filter(notif => !notif.leida).length;

      } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        // Si hay un error 401 (No autorizado), limpia el token y no muestres notificaciones
        if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
          // No redirigir aquí. Deja que PaginaCentral maneje la redirección para evitar conflictos.
          console.error('Sesión expirada en IconoNotificaciones. Se necesita reautenticación.');
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
        // Al cerrar el modal, vuelve a obtener las notificaciones para actualizar el badge
        this.fetchNotifications();
      }
    },

    // 3. Método para marcar una notificación como leída y, opcionalmente, redirigir
    async markAsReadAndRedirect(notif) {
      if (!notif.leida) { // Solo si la notificación no ha sido leída
        try {
          const token = this.getToken();
          await axios.patch(`${this.apiUrl}/notificaciones/${notif.id_notificacion}/marcar-leida`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          // Actualizar el estado de la notificación en el frontend
          notif.leida = true;
          this.newNotificationsCount = this.notifications.filter(n => !n.leida).length;

        } catch (error) {
          console.error('Error al marcar notificación como leída:', error);
          // Puedes añadir un mensaje de error al usuario aquí si lo deseas
        }
      }

      // Si la notificación tiene una URL de redirección, navega a ella
      if (notif.url_redireccion) {
        // Usamos Vue Router para la navegación interna si es una SPA
        this.$router.push(notif.url_redireccion).catch(() => {}); // .catch evita errores de navegación si ya estás en la ruta
      }
      this.toggleNotificacionesModal(); // Cierra el modal después de la acción
    },

    // 4. Método para formatear la fecha de forma legible
    formatarFecha(dateString) {
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
    this.fetchNotifications(); // Obtener notificaciones al cargar el componente por primera vez
    this.startPolling(); // Iniciar el polling para actualizaciones periódicas
  },
  beforeUnmount() {
    this.stopPolling(); // Detener el polling cuando el componente se destruye
  }
};
</script>

<style scoped>
/* Estilos para el icono de notificaciones */
.Notificaciones {
  position: fixed;
  width: 50px; /* Tamaño del área del icono */
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px; /* Tamaño del icono de campana */
  color: #f4bd00; /* Color inicial de la campana */
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease-in-out;
  border-radius: 50%; /* Hace que el contenedor sea redondo */
  background-color: #f7f7f7; /* Fondo para el círculo */
  bottom: 0;
  
}

.Notificaciones:hover {
  transform: scale(1.1);
}

/* Estilo para la campana cuando HAY nuevas notificaciones */
.Notificaciones .fa-bell.has-new-notifications {
  color: #ff4d4f; /* Rojo para indicar nueva notificación */
  animation: shake 0.8s cubic-bezier(.36,.07,.19,.97) both infinite; /* Efecto de temblor */
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
  top: 0px; /* Ajusta la posición */
  right: 5px; /* Ajusta la posición */
  background-color: #ff4d4f; /* Rojo */
  color: white;
  border-radius: 50%;
  padding: 2px 7px; /* Ajusta el padding para que sea un círculo o un óvalo pequeño */
  font-size: 0.7em;
  font-weight: bold;
  min-width: 15px; /* Para asegurar que el círculo no sea demasiado pequeño */
  text-align: center;
  line-height: 1; /* Centrar el texto verticalmente */
  border: 1px solid white; /* Borde blanco para visibilidad */
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
  overflow-y: auto; /* Permite el scroll si hay muchas notificaciones */
  padding-right: 5px; /* Pequeño espacio para la barra de scroll */
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
</style>