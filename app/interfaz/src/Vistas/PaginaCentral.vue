<template>
  <div class="main-wrapper">
    <div class="content-card">
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
        @send-request="openVentanaSolicitud"   @view-profile="handleViewProfile"  />

      <p v-if="filteredProfiles.length === 0" class="no-profiles-message">No se encontraron perfiles que coincidan con su búsqueda o filtro.</p>
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
import VentanaSolicitud from '@/components/VentanaSolicitud.vue'; // <-- ¡IMPORTA TU NUEVO MODAL!

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
    VentanaSolicitud // <-- REGISTRA TU NUEVO MODAL
  },
  data() {
    return {
      userName: "Cargando...",
      profileImageSrc: "",
      userProfileType: "",
      loggedInUserId: null, // <-- AÑADE ESTA VARIABLE para almacenar el ID del usuario logueado
      allProfiles: [],
      searchTerm: '',
      activeFilter: 'Todos',
      showMessageModal: false,
      messageModalTitle: '',
      messageModalMessage: '',
      // Variables para el nuevo modal de solicitud de contacto
      showVentanaSolicitud: false, // Controla la visibilidad de VentanaSolicitud
      selectedProfileId: null,     // ID del perfil al que se le enviará la solicitud
      selectedProfileName: ''      // Nombre del perfil al que se le enviará la solicitud
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
      // Opcional: Filtra tu propio perfil de la lista de visualización si no quieres verte a ti mismo
      return profilesToFilter.filter(profile => profile.id_usuario !== this.loggedInUserId);
    }
  },
  async created() {
    // Asegura que el ID del usuario logueado esté disponible antes de cargar todos los perfiles
    // Esto es importante si el filtrado de tu propio perfil se hace en el frontend
    await this.fetchLoggedInUserProfile();
    await this.fetchAllProfiles();
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
          this.loggedInUserId = profile.id_usuario; // <-- ¡GUARDA EL ID DEL USUARIO LOGUEADO AQUÍ!
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
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
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
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
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

    // --- NUEVOS MÉTODOS PARA EL MODAL DE SOLICITUD DE CONTACTO (VentanaSolicitud) ---
    openVentanaSolicitud(profile) { // Este método es llamado por TarjetasPerfiles
      this.selectedProfileId = profile.id_usuario; // El ID del perfil al que se le envía la solicitud
      this.selectedProfileName = profile.nombre_usuario; // El nombre del perfil
      this.showVentanaSolicitud = true; // Muestra el modal
    },

    async handleSendContactRequest(requestDetails) {
      // requestDetails contiene { id_receptor, contactDetails: { email, whatsapp, ... } }
      // El id_receptor ya está en requestDetails.id_receptor
      // El id_emisor es el loggedInUserId que almacenamos al inicio.
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
          id_emisor: this.loggedInUserId, // ID del usuario que está logueado
          id_receptor: requestDetails.id_receptor, // ID del perfil de la tarjeta
          ...requestDetails.contactDetails // Correo, WhatsApp, etc.
        }, {
          headers: {
            Authorization: `Bearer ${token}` // Envía el token para autenticar la solicitud
          }
        });

        if (response.status === 201) {
          this.showMessage('Solicitud Enviada', '¡Tu solicitud de contacto ha sido enviada con éxito!');
        } else {
          // Manejar otros códigos de estado si es necesario
          this.showErrorMessage('Error al Enviar', 'Hubo un problema al enviar la solicitud de contacto. Inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('Error al enviar solicitud de contacto:', error);
        if (error.response && error.response.status === 401) {
          this.showErrorMessage('Sesión Expirada', 'Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo.');
          this.$router.push({ name: 'Principal' });
        } else {
          this.showErrorMessage('Error de Conexión', 'No se pudo conectar con el servidor o hubo un error al enviar la solicitud.');
        }
      } finally {
        this.showVentanaSolicitud = false; // Cierra el modal después de la operación (éxito o error)
      }
    },

    // --- Lógica para el botón 'Ver Perfil' (Manejador del evento) ---
    handleViewProfile(profile) {
      console.log('Navegando a la PaginaPerfil para:', profile.nombre_usuario);
      // Aquí debes navegar a la PaginaPerfil, pasando el ID del usuario
      this.$router.push({ name: 'PaginaPerfil', params: { id: profile.id_usuario } });
    },

    // --- Lógica del Modal de Mensaje Genérico ---
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
    }
  }
};
</script>

<style>
/* Tus estilos CSS existentes para PaginaCentral */
/* Asegúrate de que los estilos para .message-modal-overlay y .message-modal-content estén aquí */
/* y que los estilos para el nuevo VentanaSolicitud.vue estén en su propio archivo */

.main-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.content-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 900px; /* Ajusta según el diseño deseado */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-image-section {
  margin-bottom: 20px;
}

.user-name-display-wrapper {
  text-align: center;
  margin-bottom: 20px;
}

.user-name-display {
  font-size: 2.5em;
  color: #333;
  margin-bottom: 5px;
}

.user-profile-type {
  font-size: 1.2em;
  color: #666;
}

.component-margin-bottom {
  margin-bottom: 25px;
  width: 100%; /* Asegura que estos componentes ocupen el ancho completo de la tarjeta de contenido */
  max-width: 600px; /* Ancho máximo para el centrado de los componentes */
}

.buttons-filter-margin-bottom {
  margin-bottom: 30px;
  width: 100%;
  max-width: 600px;
}

.section-title {
  font-size: 1.8em;
  color: #444;
  margin-bottom: 20px;
  width: 100%;
  text-align: center;
}

.no-profiles-message {
  text-align: center;
  color: #888;
  font-size: 1.1em;
  margin-top: 30px;
}

/* Estilos para el modal de mensaje (ya existentes) */
.message-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001; /* Asegura que esté por encima de otros elementos */
}

.message-modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.message-modal-title {
  font-size: 1.5em;
  margin-bottom: 15px;
  color: #333;
}

.message-modal-message {
  font-size: 1.1em;
  color: #666;
  margin-bottom: 25px;
}

.message-modal-button-close {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.message-modal-button-close:hover {
  background-color: #0056b3;
}
</style>