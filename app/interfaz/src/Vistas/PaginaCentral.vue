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

      <OpcionPerfil class="component-margin-bottom" />
      <ContenidoMenu
        :userRole="userProfileType"
        class="component-margin-bottom"
      />

      <BarraBusqueda @search="handleSearch" class="component-margin-bottom" />

      <BotonesFiltro
        @filter="handleFilter"
        class="buttons-filter-margin-bottom"
      />

      <h2 class="TituloPerfiles">Perfiles de Usuarios</h2>

      <TarjetasPerfiles
        :profiles="filteredProfiles"
        @send-request="openVentanaSolicitud"
        @view-profile="handleViewProfile"
      />

      <p v-if="filteredProfiles.length === 0" class="no-profiles-message">
        No se encontraron perfiles que coincidan con su búsqueda o filtro.
      </p>
    </div>

    <div class="notifications-icon-wrapper-fixed">
      <IconoNotificaciones @click="goToNotificationsPage" />
    </div>

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
import axios from "axios";
import BarraPerfil from "../components/BarraPerfil.vue";
import OpcionPerfil from "../components/OpcionPerfil.vue";
import ContenidoMenu from "../components/ContenidoMenu.vue";
import ImagenPerfil from "../components/ImagenPerfil.vue";
import BarraBusqueda from "../components/BarraBusqueda.vue";
import BotonesFiltro from "../components/BotonesFiltro.vue";
import TarjetasPerfiles from "@/components/TarjetasPerfiles.vue";
import VentanaSolicitud from "@/components/VentanaSolicitud.vue";
import IconoNotificaciones from "@/components/IconoNotificaciones.vue"; // Importa IconoNotificaciones

export default {
  name: "PaginaCentral",
  components: {
    BarraPerfil,
    OpcionPerfil,
    ContenidoMenu,
    ImagenPerfil,
    BarraBusqueda,
    BotonesFiltro,
    TarjetasPerfiles,
    VentanaSolicitud,
    IconoNotificaciones, // Registra IconoNotificaciones
  },
  data() {
    return {
      userName: "Cargando...",
      profileImageSrc: "",
      userProfileType: "",
      loggedInUserId: null,
      allProfiles: [],
      searchTerm: "",
      activeFilter: "Todos",
      showMessageModal: false,
      messageModalTitle: "",
      messageModalMessage: "",
      showVentanaSolicitud: false,
      selectedProfileId: null,
      selectedProfileName: "",
      // showChatbotModal: false, // ELIMINADO: Ya no usaremos este modal aquí
      // receivedRequests: [], // ELIMINADO: Las solicitudes se gestionarán en la página de notificaciones
      // hasNewRequests: false, // ELIMINADO: La cuenta de notificaciones la manejará IconoNotificaciones
    };
  },
  computed: {
    filteredProfiles() {
      let profilesToFilter = this.allProfiles;

      if (this.searchTerm) {
        const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
        profilesToFilter = profilesToFilter.filter((profile) => {
          return profile.nombre_usuario
            .toLowerCase()
            .includes(lowerCaseSearchTerm);
        });
      }

      if (this.activeFilter !== "Todos") {
        profilesToFilter = profilesToFilter.filter((profile) => {
          return profile.tipo_perfil === this.activeFilter;
        });
      }
      return profilesToFilter.filter(
        (profile) => profile.id_usuario !== this.loggedInUserId
      );
    },
  },
  async created() {
    await this.fetchLoggedInUserProfile();
    await this.fetchAllProfiles();
    // await this.fetchReceivedRequests(); // ELIMINADO: Ya no se carga aquí
  },
  methods: {
    async fetchLoggedInUserProfile() {
      try {
        const token =
          localStorage.getItem("userToken") ||
          sessionStorage.getItem("userToken");
        if (!token) {
          console.warn(
            "No hay token de autenticación. Redirigiendo a la página principal."
          );
          this.$router.push({ name: "Principal" });
          return;
        }

        const response = await axios.get(
          "http://localhost:4000/api/profile/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          const profile = response.data;
          this.userName = profile.nombre_usuario;
          this.profileImageSrc = profile.foto_perfil_url || "";
          this.userProfileType = profile.tipo_perfil;
          this.loggedInUserId = profile.id_usuario;
          console.log("Datos de usuario logueado cargados en PaginaCentral:", {
            userName: this.userName,
            profileImageSrc: this.profileImageSrc,
            userProfileType: this.userProfileType,
            loggedInUserId: this.loggedInUserId,
          });
        } else {
          console.error(
            "Error al cargar el perfil del usuario logueado:",
            response.status,
            response.data
          );
          this.showErrorMessage(
            "Error de Carga",
            "No se pudo cargar tu información de perfil."
          );
        }
      } catch (error) {
        console.error(
          "Error en la solicitud para obtener el perfil del usuario logueado:",
          error
        );
        if (
          axios.isAxiosError(error) &&
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          this.showErrorMessage(
            "Sesión Expirada",
            "Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo."
          );
          this.$router.push({ name: "Principal" });
        } else {
          this.showErrorMessage(
            "Error de Conexión",
            "No se pudo conectar con el servidor para cargar tu perfil."
          );
        }
      }
    },

    async fetchAllProfiles() {
      try {
        const token =
          localStorage.getItem("userToken") ||
          sessionStorage.getItem("userToken");
        if (!token) {
          console.warn(
            "No se encontró token de autenticación para cargar perfiles de otros usuarios."
          );
          return;
        }

        const response = await axios.get("http://localhost:4000/api/profiles", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.allProfiles = response.data;
        console.log("Perfiles de otros usuarios cargados:", this.allProfiles);
      } catch (error) {
        console.error("Error al obtener todos los perfiles:", error);
        if (
          axios.isAxiosError(error) &&
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          this.showErrorMessage(
            "Sesión Expirada",
            "Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo."
          );
          this.$router.push({ name: "Principal" });
        } else {
          this.showErrorMessage(
            "Error al Cargar Perfiles",
            "No se pudieron cargar los perfiles de otros usuarios. Inténtalo de nuevo más tarde."
          );
        }
      }
    },

    handleSearch(term) {
      this.searchTerm = term;
      console.log("Término de búsqueda recibido en PaginaCentral:", term);
    },

    handleFilter(filterType) {
      this.activeFilter = filterType;
      console.log(
        "Filtro de tipo de perfil recibido en PaginaCentral:",
        filterType
      );
    },

    handleImageSelected(imageFile) {
      console.log("Imagen seleccionada en PaginaCentral:", imageFile.name);
      this.showMessage(
        "Imagen Seleccionada",
        `Se ha seleccionado la imagen: ${imageFile.name}. La gestión de la imagen de perfil se realiza en la página de tu perfil.`
      );
    },

    openVentanaSolicitud(profile) {
      this.selectedProfileId = profile.id_usuario;
      this.selectedProfileName = profile.nombre_usuario;
      this.showVentanaSolicitud = true;
    },

    async handleSendContactRequest(requestDetails) {
      console.log("Datos recibidos de VentanaSolicitud:", requestDetails);

      if (!this.loggedInUserId) {
        this.showErrorMessage(
          "Error de Autenticación",
          "No se pudo identificar tu ID de usuario. Por favor, intenta iniciar sesión de nuevo."
        );
        this.showVentanaSolicitud = false;
        return;
      }

      try {
        const token =
          localStorage.getItem("userToken") ||
          sessionStorage.getItem("userToken");
        if (!token) {
          throw new Error("No se encontró token de autenticación.");
        }

        const response = await axios.post(
          "http://localhost:4000/api/solicitudes-contacto",
          {
            id_emisor: this.loggedInUserId,
            id_receptor: requestDetails.id_receptor,
            ...requestDetails.contactDetails,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 201) {
          this.showMessage(
            "Solicitud Enviada",
            "¡Tu solicitud de contacto ha sido enviada con éxito!"
          );
          // Opcional: Podrías aquí refrescar las notificaciones del IconoNotificaciones
          // this.$refs.iconoNotificaciones.fetchNotificationsCount();
        } else {
          this.showErrorMessage(
            "Error al Enviar",
            "Hubo un problema al enviar la solicitud de contacto. Inténtalo de nuevo."
          );
        }
      } catch (error) {
        console.error("Error al enviar solicitud de contacto:", error);
        if (
          axios.isAxiosError(error) &&
          error.response &&
          error.response.status === 401
        ) {
          this.showErrorMessage(
            "Sesión Expirada",
            "Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo."
          );
          this.$router.push({ name: "Principal" });
        } else if (
          axios.isAxiosError(error) &&
          error.response &&
          error.response.status === 409
        ) {
          this.showErrorMessage(
            "Solicitud Duplicada",
            "Ya existe una solicitud pendiente para este usuario."
          );
        } else {
          this.showErrorMessage(
            "Error de Conexión",
            "No se pudo conectar con el servidor o hubo un error al enviar la solicitud."
          );
        }
      } finally {
        this.showVentanaSolicitud = false;
      }
    },

    handleViewProfile(profile) {
      console.log("Navegando a la PaginaPerfil para:", profile.nombre_usuario);
      this.$router.push({
        name: "PaginaPerfil",
        params: { id: profile.id_usuario },
      });
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
    // NUEVO MÉTODO: Navegar a la página de notificaciones
    goToNotificationsPage() {
      this.$router.push({ name: "Notificaciones" });
    },
    // ELIMINADO: Ya no necesitamos estos métodos de gestión de solicitudes en PaginaCentral
    // toggleChatbotModal() { /* ... */ },
    // fetchReceivedRequests() { /* ... */ },
    // acceptRequest() { /* ... */ },
    // rejectRequest() { /* ... */ },
    // handleReceivedRequestNotification() { /* ... */ },
  },
};
</script>

<style scoped>

/* Estilos para el título "Perfiles de Usuarios" */
.TituloPerfiles {
  font-family: "Times New Roman", serif; /* Mantener la fuente consistente con otros elementos */
  font-size: 2.5em; /* Un tamaño de fuente considerable para el título */
  color: #333; /* Un color oscuro suave para la legibilidad */
  text-align: center; /* Centrar el texto horizontalmente */
  margin-top: 40px; /* Un buen espacio superior para separarlo de los botones de filtro */
  margin-bottom: 30px; /* Espacio inferior para separarlo del contenido siguiente */
  font-weight: bold; /* Hacer el texto en negrita */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.08); /* Una sombra muy sutil para darle profundidad */
  padding: 0 15px; /* Pequeño padding horizontal para evitar que el texto se pegue a los bordes en pantallas pequeñas */
}

/* Media Queries para Responsividad */

/* Para pantallas medianas (ej. tablets, 768px y abajo) */
@media (max-width: 768px) {
  .TituloPerfiles {
    font-size: 2em; /* Reduce el tamaño del título */
    margin-top: 30px;
    margin-bottom: 25px;
  }
}

/* Para pantallas pequeñas (ej. móviles, 480px y abajo) */
@media (max-width: 480px) {
  .TituloPerfiles {
    font-size: 1.6em; /* Más reducción para móviles */
    margin-top: 25px;
    margin-bottom: 20px;
    padding: 0 10px;
  }
}

/* Estilos para el contenedor del nombre de usuario y tipo de perfil */
.user-name-display-wrapper {
  text-align: center; /* Centra el texto horizontalmente */
  margin-top: 20px; /* Espacio superior para separarlo de elementos anteriores, ajusta según necesites */
  margin-bottom: 30px; /* Espacio inferior para separarlo de elementos siguientes */
  padding: 0 20px; /* Padding horizontal para que no se pegue a los bordes en móviles */
}

/* Estilos para el nombre de usuario (h1) */
.user-name-display {
  font-family: "Times New Roman", serif; /* Mantener la fuente consistente */
  font-size: 2.8em; /* Un tamaño de fuente grande para el nombre */
  color: #333; /* Un color oscuro pero no negro puro */
  margin-bottom: 5px; /* Espacio pequeño entre el nombre y el tipo de perfil */
  font-weight: bold; /* Nombre en negrita */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1); /* Sombra suave para un poco de profundidad */
}

/* Estilos para el tipo de perfil (p) */
.user-profile-type {
  font-family: "Times New Roman", serif; /* Mantener la fuente consistente */
  font-size: 1.3em; /* Tamaño de fuente para el tipo de perfil */
  color: #6a1b9a; /* Un tono morado/rosado más oscuro para el tipo de perfil */
  font-weight: 500; /* Un poco más de peso */
  text-transform: capitalize; /* Capitaliza la primera letra (ej. "emprendedor" -> "Emprendedor") */
}

/* Media Queries para Responsividad */

/* Para pantallas medianas (ej. tablets, 768px y abajo) */
@media (max-width: 768px) {
  .user-name-display {
    font-size: 2.2em; /* Reduce el tamaño del nombre */
  }

  .user-profile-type {
    font-size: 1.1em; /* Reduce el tamaño del tipo de perfil */
  }
  .user-name-display-wrapper {
    margin-top: 15px;
    margin-bottom: 25px;
  }
}

/* Para pantallas pequeñas (ej. móviles, 480px y abajo) */
@media (max-width: 480px) {
  .user-name-display {
    font-size: 1.8em; /* Más reducción para móviles */
  }

  .user-profile-type {
    font-size: 1em; /* Más reducción para móviles */
  }
  .user-name-display-wrapper {
    margin-top: 10px;
    margin-bottom: 20px;
  }
}


</style>
