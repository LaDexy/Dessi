<template>
  <div class="main-wrapper">
    <div class="content-card">
      <!-- Componentes de perfil y navegación -->
      <BarraPerfil :userName="userName" />

      <div class="profile-image-section">
        <ImagenPerfil
          ref="imagenPerfilComponent"
          :profileImageSrc="profileImageSrc"
          @imageSelected="handleImageSelected"
        />
      </div>

      <div class="user-name-display-wrapper">
        <h1 class="user-name-display">{{ userName }}</h1>
        <p class="user-profile-type">{{ userProfileType }}</p>
      </div>

      <OpcionPerfil class="component-margin-bottom"/>
      <ContenidoMenu :userRole="userProfileType" class="component-margin-bottom"/>

      <BarraBusqueda @search="handleSearch" class="component-margin-bottom"/>

      <BotonesFiltro @filter="handleFilter" class="buttons-filter-margin-bottom"/>

      <h2 class="section-title">Perfiles de Usuarios</h2>

      <TarjetasPerfiles
        :profiles="filteredProfiles"
        @send-request="openVentanaSolicitud"
        @view-profile="handleViewProfile"
      />

      <p v-if="filteredProfiles.length === 0" class="no-profiles-message">No se encontraron perfiles que coincidan con su búsqueda o filtro.</p>
    </div>

    <!-- Icono de Chat Flotante -->
    <div class="chat-icon-wrapper-fixed">
      <IconoChat @click="toggleChatbotModal" :has-new-requests="hasNewRequests" />
    </div>

    <!-- Icono de Notificaciones Flotante -->
    <div class="notifications-icon-wrapper-fixed">
      <IconoNotificaciones />
    </div>

    <!--Modal abierto -->

    <div v-if="showChatbotModal" style="position: fixed; top: 10px; left: 10px; background: red; color: white; padding: 5px; z-index: 9999;">
      MODAL DE CHAT DEBERIA ESTAR ABIERTO!
    </div>

    <!-- Modal del Chatbot (Solicitudes Recibidas) -->
    <div v-if="showChatbotModal" class="chatbot-modal-overlay">
      <div class="chatbot-modal-content">
        <div class="chatbot-header">
          <h3 class="chatbot-title">Solicitudes Recibidas</h3>
          <button @click="toggleChatbotModal" class="chatbot-close-button">&times;</button>
        </div>
        <div class="chatbot-messages">
          <div v-if="receivedRequests.length === 0" class="no-requests-message">
            No tienes solicitudes de contacto pendientes.
          </div>
          <div v-for="request in receivedRequests" :key="request.id_solicitud" class="request-message-card">
            <div class="message-header">
              <img :src="request.emisor_foto_perfil || 'https://via.placeholder.com/50'" alt="Foto de perfil" class="message-profile-image">
              <div>
                <p class="message-sender-name">{{ request.emisor_nombre }} te ha enviado una solicitud de contacto.</p>
                <p class="message-date">Recibida el: {{ formatDate(request.creado_fecha) }}</p>
              </div>
            </div>
            <div class="message-contact-info">
              <p v-if="request.emisor_email">Email: {{ request.emisor_email }}</p>
              <p v-if="request.emisor_whatsapp">WhatsApp: {{ request.emisor_whatsapp }}</p>
              <p v-if="request.emisor_instagram">Instagram: {{ request.emisor_instagram }}</p>
              <p v-if="request.emisor_tiktok">TikTok: {{ request.emisor_tiktok }}</p>
              <p v-if="request.emisor_facebook">Facebook: {{ request.emisor_facebook }}</p>
            </div>
            <div class="message-actions">
              <button @click="acceptRequest(request.id_solicitud)" class="button-base button-primary button-small">Aceptar</button>
              <button @click="rejectRequest(request.id_solicitud)" class="button-base button-secondary button-small">Rechazar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Mensaje Genérico -->
    <div v-if="showMessageModal" class="message-modal-overlay">
      <div class="message-modal-content">
        <h3 class="message-modal-title">{{ messageModalTitle }}</h3>
        <p class="message-modal-message">{{ messageModalMessage }}</p>
        <div class="message-modal-actions">
          <button @click="closeMessageModal" class="message-modal-button-close">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Modal para Enviar Solicitud de Contacto -->
    <VentanaSolicitud
      :show="showVentanaSolicitud"
      :targetProfileId="selectedProfileId"
      :targetProfileName="selectedProfileName"
      @close="showVentanaSolicitud = false"
      @send-contact-request="handleSendContactRequest"
    />
  </div>
</template>

<script>
import axios from 'axios';
import BarraPerfil from "../components/BarraPerfil.vue";
import OpcionPerfil from "../components/OpcionPerfil.vue";
import ContenidoMenu from "../components/ContenidoMenu.vue";
import ImagenPerfil from "../components/ImagenPerfil.vue";
import BarraBusqueda from "../components/BarraBusqueda.vue";
import BotonesFiltro from "../components/BotonesFiltro.vue";
import TarjetasPerfiles from '@/components/TarjetasPerfiles.vue';
import VentanaSolicitud from '@/components/VentanaSolicitud.vue';
import IconoChat from '@/components/IconoChat.vue'; // Importa IconoChat
import IconoNotificaciones from '@/components/IconoNotificaciones.vue'; // Importa IconoNotificaciones

export default {
  name: 'PaginaCentral',
  components: {
    BarraPerfil,
    OpcionPerfil,
    ContenidoMenu,
    ImagenPerfil,
    BarraBusqueda,
    BotonesFiltro,
    TarjetasPerfiles,
    VentanaSolicitud,
    IconoChat, // Registra IconoChat
    IconoNotificaciones, // Registra IconoNotificaciones
  },
  data() {
    return {
      userName: "Cargando...",
      profileImageSrc: "",
      userProfileType: "",
      loggedInUserId: null,
      allProfiles: [],
      searchTerm: '',
      activeFilter: 'Todos',
      showMessageModal: false,
      messageModalTitle: '',
      messageModalMessage: '',
      showVentanaSolicitud: false,
      selectedProfileId: null,
      selectedProfileName: '',
      showChatbotModal: false, // Controla la visibilidad del modal del chatbot
      receivedRequests: [], // Almacenará las solicitudes de contacto recibidas
      hasNewRequests: false, // Para indicar visualmente si hay nuevas solicitudes
    };
  },
  computed: {
    filteredProfiles() {
      let profilesToFilter = this.allProfiles;

      if (this.searchTerm) {
        const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
        profilesToFilter = profilesToFilter.filter(profile => {
          return profile.nombre_usuario.toLowerCase().includes(lowerCaseSearchTerm);
        });
      }

      if (this.activeFilter !== 'Todos') {
        profilesToFilter = profilesToFilter.filter(profile => {
          return profile.tipo_perfil === this.activeFilter;
        });
      }
      return profilesToFilter.filter(profile => profile.id_usuario !== this.loggedInUserId);
    }
  },
  async created() {
    await this.fetchLoggedInUserProfile();
    await this.fetchAllProfiles();
    await this.fetchReceivedRequests(); // Carga las solicitudes recibidas al inicio
  },
  methods: {
    async fetchLoggedInUserProfile() {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          console.warn('No hay token de autenticación. Redirigiendo a la página principal.');
          this.$router.push({ name: 'Principal' });
          return;
        }

        const response = await axios.get('http://localhost:4000/api/profile/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          const profile = response.data;
          this.userName = profile.nombre_usuario;
          this.profileImageSrc = profile.foto_perfil_url || '';
          this.userProfileType = profile.tipo_perfil;
          this.loggedInUserId = profile.id_usuario;
          console.log('Datos de usuario logueado cargados en PaginaCentral:', {
            userName: this.userName,
            profileImageSrc: this.profileImageSrc,
            userProfileType: this.userProfileType,
            loggedInUserId: this.loggedInUserId
          });
        } else {
          console.error('Error al cargar el perfil del usuario logueado:', response.status, response.data);
          this.showErrorMessage('Error de Carga', 'No se pudo cargar tu información de perfil.');
        }
      } catch (error) {
        console.error('Error en la solicitud para obtener el perfil del usuario logueado:', error);
        if (axios.isAxiosError(error) && error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.showErrorMessage('Sesión Expirada', 'Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo.');
          this.$router.push({ name: 'Principal' });
        } else {
          this.showErrorMessage('Error de Conexión', 'No se pudo conectar con el servidor para cargar tu perfil.');
        }
      }
    },

    async fetchAllProfiles() {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          console.warn('No se encontró token de autenticación para cargar perfiles de otros usuarios.');
          return;
        }

        const response = await axios.get('http://localhost:4000/api/profiles', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.allProfiles = response.data;
        console.log('Perfiles de otros usuarios cargados:', this.allProfiles);
      } catch (error) {
        console.error('Error al obtener todos los perfiles:', error);
        if (axios.isAxiosError(error) && error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.showErrorMessage('Sesión Expirada', 'Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo.');
          this.$router.push({ name: 'Principal' });
        } else {
          this.showErrorMessage('Error al Cargar Perfiles', 'No se pudieron cargar los perfiles de otros usuarios. Inténtalo de nuevo más tarde.');
        }
      }
    },

    handleSearch(term) {
      this.searchTerm = term;
      console.log('Término de búsqueda recibido en PaginaCentral:', term);
    },

    handleFilter(filterType) {
      this.activeFilter = filterType;
      console.log('Filtro de tipo de perfil recibido en PaginaCentral:', filterType);
    },

    handleImageSelected(imageFile) {
      console.log("Imagen seleccionada en PaginaCentral:", imageFile.name);
      this.showMessage('Imagen Seleccionada', `Se ha seleccionado la imagen: ${imageFile.name}. La gestión de la imagen de perfil se realiza en la página de tu perfil.`);
    },

    openVentanaSolicitud(profile) {
      this.selectedProfileId = profile.id_usuario;
      this.selectedProfileName = profile.nombre_usuario;
      this.showVentanaSolicitud = true;
    },

    async handleSendContactRequest(requestDetails) {
      console.log('Datos recibidos de VentanaSolicitud:', requestDetails);

      if (!this.loggedInUserId) {
        this.showErrorMessage('Error de Autenticación', 'No se pudo identificar tu ID de usuario. Por favor, intenta iniciar sesión de nuevo.');
        this.showVentanaSolicitud = false;
        return;
      }

      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          throw new Error('No se encontró token de autenticación.');
        }

        const response = await axios.post('http://localhost:4000/api/solicitudes-contacto', {
          id_emisor: this.loggedInUserId,
          id_receptor: requestDetails.id_receptor,
          ...requestDetails.contactDetails
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 201) {
          this.showMessage('Solicitud Enviada', '¡Tu solicitud de contacto ha sido enviada con éxito!');
        } else {
          this.showErrorMessage('Error al Enviar', 'Hubo un problema al enviar la solicitud de contacto. Inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('Error al enviar solicitud de contacto:', error);
        if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
          this.showErrorMessage('Sesión Expirada', 'Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo.');
          this.$router.push({ name: 'Principal' });
        } else if (axios.isAxiosError(error) && error.response && error.response.status === 409) {
          this.showErrorMessage('Solicitud Duplicada', 'Ya existe una solicitud pendiente para este usuario.');
        }
        else {
          this.showErrorMessage('Error de Conexión', 'No se pudo conectar con el servidor o hubo un error al enviar la solicitud.');
        }
      } finally {
        this.showVentanaSolicitud = false;
      }
    },

    handleViewProfile(profile) {
      console.log('Navegando a la PaginaPerfil para:', profile.nombre_usuario);
      this.$router.push({ name: 'PaginaPerfil', params: { id: profile.id_usuario } });
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
      this.messageModalTitle = '';
      this.messageModalMessage = '';
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    // --- FUNCIONES DEL CHATBOT (SOLICITUDES RECIBIDAS) ---
    async fetchReceivedRequests() {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) return;

      try {
        const response = await axios.get('http://localhost:4000/api/solicitudes-recibidas?estatus=Pendiente', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.receivedRequests = response.data;
        this.hasNewRequests = this.receivedRequests.length > 0;
      } catch (error) {
        console.error('Error fetching received requests:', error);
        if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
          // Si el token expira aquí, limpia y redirige
          localStorage.removeItem('userToken');
          sessionStorage.removeItem('userToken');
          this.$router.push({ name: 'Principal' });
          this.showErrorMessage('Sesión Expirada', 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        }
      }
    },
    toggleChatbotModal() {
      console.log('PaginaCentral: toggleChatbotModal llamado. Valor actual de showChatbotModal:', this.showChatbotModal); // <--- console.log para depuración
      this.showChatbotModal = !this.showChatbotModal;
      if (this.showChatbotModal) {
        this.fetchReceivedRequests(); // Recargar solicitudes cada vez que se abre el modal
        this.hasNewRequests = false; // Una vez abierto, el usuario ya vio las solicitudes
      }
    },
    async acceptRequest(requestId) {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) return;

      try {
        await axios.patch(`http://localhost:4000/api/solicitudes/${requestId}/aceptar`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.showMessage('Solicitud Aceptada', '¡Has aceptado la solicitud de contacto!');
        this.fetchReceivedRequests(); // Actualiza la lista después de aceptar
      } catch (error) {
        console.error('Error accepting request:', error);
        this.showErrorMessage('Error al Aceptar', error.response?.data?.message || 'Error al aceptar la solicitud.');
      }
    },
    async rejectRequest(requestId) {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) return;

      try {
        await axios.patch(`http://localhost:4000/api/solicitudes/${requestId}/rechazar`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.showMessage('Solicitud Rechazada', 'Has rechazado la solicitud de contacto.');
        this.fetchReceivedRequests(); // Actualiza la lista después de rechazar
      } catch (error) {
        console.error('Error rejecting request:', error);
        this.showErrorMessage('Error al Rechazar', error.response?.data?.message || 'Error al rechazar la solicitud.');
      }
    }
  }
};
</script>

<style>

</style>