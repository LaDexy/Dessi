<template>
  <div>
    <ContenidoMenu :userRole="userProfileType" class="fixed-menu-button" />

    <BarraBusqueda @search="handleSearch" class="fixed-search-bar" />

    <ImagenPerfil
      ref="imagenPerfilComponent"
      :profileImageSrc="profileImageSrc"
      @imageSelected="handleImageSelected"
    />

    <IconoNotificaciones @click="goToNotificationsPage" />

    <BarraPerfil :userName="userName" />

    <div class="user-name-display-wrapper">
      <h1 class="user-name-display">{{ userName }}</h1>
      <p class="user-profile-type">{{ userProfileType }}</p>
    </div>

    <OpcionPerfil />

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
/* Contenedor principal de la página, sin transformaciones que afecten a 'fixed' */
/* Un nuevo contenedor para el contenido que SÍ se desplaza */
.content-area-scrollable {
  width: 100%;
  max-width: 1400px; /* O el ancho máximo que desees para tu contenido principal */
  padding: 100px 20px 40px 20px; /* Relleno superior para dejar espacio a los elementos fijos */
  box-sizing: border-box; /* Incluye padding en el ancho */
  /* Si tu página tiene una barra superior, ajusta este padding-top para que el contenido no quede debajo */
  margin-top: 0; /* Elimina el margin-top anterior si lo tenías */
}

/* Estilos para los elementos FIJOS */

/* Contenedor para el botón de menú */
.fixed-menu-button {
  position: fixed;
  top: 20px; /* Ajusta según tu diseño */
  left: 20px; /* Ajusta según tu diseño */
  z-index: 1050; /* Muy alto */
}

/* Contenedor para la barra de búsqueda */
.fixed-search-bar {
  position: fixed;
  top: 100px; /* Ajusta para que esté debajo del menú */
  left: 20px; /* Ajusta para alineación */
  z-index: 1040; /* Ligeramente menor que el menú */
}

/* Contenedor para la imagen de perfil */
.fixed-profile-image-wrapper {
  position: fixed;
  top: 20px; /* Ajusta para que esté arriba a la derecha */
  right: 20px; /* Ajusta para que esté a la derecha */
  z-index: 1030; /* Menor que los anteriores */
  width: 80px; /* Tamaño del contenedor */
  height: 80px;
  border-radius: 50%;
  overflow: hidden; /* Para que la imagen se recorte en círculo */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}
.fixed-profile-image-wrapper > .imagen-perfil {
  /* Si ImagenPerfil es la raíz, apuntamos a ella */
  width: 100%;
  height: 100%;
}
/* Estilo para la imagen dentro de ImagenPerfil si no la gestiona ya */
.fixed-profile-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* Contenedor para el icono de notificaciones */
.fixed-notifications-icon-wrapper {
  position: fixed;
  top: 20px; /* Ajusta para que esté cerca de la imagen de perfil o donde desees */
  right: 120px; /* Ajusta su posición. Puedes alinearlo con la imagen de perfil o la barra de perfil */
  z-index: 1035; /* Entre la imagen de perfil y la barra de búsqueda */
  /* Añade estilos si quieres un fondo o forma específica para el icono de notificación */
}

/* Aquí puedes mantener los estilos que ya tenías para el resto del contenido
   como TituloPerfiles, user-name-display-wrapper, etc.
   Solo asegúrate de que no haya un `.content-card` que tenga `transform` o similar.
*/
.TituloPerfiles {
  font-family: "Times New Roman", serif;
  font-size: 2.5em;
  color: #333;
  text-align: center;
  margin-top: 40px;
  margin-bottom: 30px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.08);
  padding: 0 15px;
}

@media (max-width: 768px) {
  .TituloPerfiles {
    font-size: 2em;
    margin-top: 30px;
    margin-bottom: 25px;
  }
  .fixed-menu-button {
    top: 15px;
    left: 15px;
  }
  .fixed-search-bar {
    top: 80px; /* Ajusta para móvil */
    left: 15px;
  }
  .fixed-profile-image-wrapper {
    top: 15px;
    right: 15px;
    width: 60px;
    height: 60px;
  }
  .fixed-notifications-icon-wrapper {
    top: 15px;
    right: 90px; /* Ajusta para móvil */
  }
  .content-area-scrollable {
    padding-top: 120px; /* Ajusta el padding para móvil */
  }
}

@media (max-width: 480px) {
  .TituloPerfiles {
    font-size: 1.6em;
    margin-top: 25px;
    margin-bottom: 20px;
    padding: 0 10px;
  }
  .fixed-menu-button {
    top: 10px;
    left: 10px;
  }
  .fixed-search-bar {
    top: 70px; /* Ajusta para móvil */
    left: 10px;
  }
  .fixed-profile-image-wrapper {
    top: 10px;
    right: 10px;
    width: 50px;
    height: 50px;
  }
  .fixed-notifications-icon-wrapper {
    top: 10px;
    right: 70px; /* Ajusta para móvil */
  }
  .content-area-scrollable {
    padding-top: 100px; /* Ajusta el padding para móvil muy pequeño */
  }
}

.user-name-display-wrapper {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 30px;
  padding: 0 20px;
}

.user-name-display {
  font-family: "Times New Roman", serif;
  font-size: 2.8em;
  color: #333;
  margin-bottom: 5px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.user-profile-type {
  font-family: "Times New Roman", serif;
  font-size: 1.3em;
  color: #6a1b9a;
  font-weight: 500;
  text-transform: capitalize;
}

@media (max-width: 768px) {
  .user-name-display {
    font-size: 2.2em;
  }
  .user-profile-type {
    font-size: 1.1em;
  }
  .user-name-display-wrapper {
    margin-top: 15px;
    margin-bottom: 25px;
  }
}

@media (max-width: 480px) {
  .user-name-display {
    font-size: 1.8em;
  }
  .user-profile-type {
    font-size: 1em;
  }
  .user-name-display-wrapper {
    margin-top: 10px;
    margin-bottom: 20px;
  }
}

/* Estilos para el mensaje "No se encontraron perfiles" */
.no-profiles-message {
  text-align: center;
  font-style: italic;
  color: #666;
  margin-top: 30px;
  font-size: 1.1em;
}

/* Estilos para los modales */
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
  z-index: 2000; /* Asegura que esté por encima de todo */
}

.message-modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-sizing: border-box;
}

.message-modal-title {
  font-size: 1.8em;
  color: #333;
  margin-bottom: 15px;
  font-family: "Times New Roman", serif;
}

.message-modal-message {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 25px;
  font-family: "Times New Roman", serif;
}

.message-modal-button-close {
  background-color: #6a1b9a;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
  font-family: "Times New Roman", serif;
}

.message-modal-button-close:hover {
  background-color: #4a106e;
}

/* Margenes para componentes específicos (mantener si son necesarios para el layout de PaginaCentral) */
.component-margin-bottom {
  margin-bottom: 20px; /* Margen común para varios componentes */
}

.buttons-filter-margin-bottom {
  margin-bottom: 30px; /* Margen específico para BotonesFiltro */
}
</style>
