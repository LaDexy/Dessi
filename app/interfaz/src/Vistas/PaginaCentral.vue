<template>
  <div class="main-wrapper">
    <div class="content-card">
      <!-- Barra de Perfil (ahora recibe userName) -->
      <BarraPerfil :userName="userName" />

      <div class="profile-image-section">
        <!-- Imagen de Perfil (ahora recibe profileImageSrc y emite imageSelected) -->
        <ImagenPerfil
          ref="imagenPerfilComponent"
          :profileImageSrc="profileImageSrc"
          @imageSelected="handleImageSelected"
        />
      </div>

      <!-- Este es el h1 que mostrará el nombre de usuario -->
      <div class="user-name-display-wrapper">
        <h1 class="user-name-display">{{ userName }}</h1>
        <p class="user-profile-type">{{ userProfileType }}</p>
      </div>

      <!-- OpcionPerfil ya no necesita la prop 'logout', maneja su propia lógica -->
      <OpcionPerfil class="component-margin-bottom"/>
      <ContenidoMenu class="component-margin-bottom"/>
      <BarraBusqueda class="component-margin-bottom"/>
      <BotonesFiltro class="buttons-filter-margin-bottom"/>

      <!-- Sección de Perfiles de Otros Usuarios -->
      <h2 class="section-title">Perfiles de Usuarios</h2>
      <div v-if="profiles.length > 0" class="profiles-grid">
        <div v-for="profile in profiles" :key="profile.id_usuario" class="profile-card">
          <div class="profile-card-header">
            <img v-if="profile.foto_perfil_url" :src="profile.foto_perfil_url" alt="Foto de Perfil" class="profile-card-image">
            <svg v-else class="profile-card-placeholder-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div class="profile-card-overlay"></div>
          </div>
          <div class="profile-card-content">
            <h3 class="profile-card-title">{{ profile.nombre_usuario }}</h3>
            <p class="profile-card-subtitle">{{ profile.profesion_display }}</p>
            <p v-if="profile.localidad" class="profile-card-location">
              <svg class="location-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
              {{ profile.localidad }}
            </p>
            <p class="profile-card-description">{{ profile.descripcion_perfil }}</p>
            <button @click="viewProfileDetails(profile)" class="profile-card-button">
              Ver Perfil
            </button>
          </div>
        </div>
      </div>
      <p v-else class="no-profiles-message">No hay otros perfiles disponibles para mostrar en este momento.</p>
    </div>

    <!-- Modal de Mensaje (para errores o éxitos) -->
    <div v-if="showMessageModal" class="message-modal-overlay">
      <div class="message-modal-content">
        <h3 class="message-modal-title">{{ messageModalTitle }}</h3>
        <p class="message-modal-message">{{ messageModalMessage }}</p>
        <div class="message-modal-actions">
          <button @click="closeMessageModal" class="message-modal-button-close">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
// Importamos los componentes hijos de PaginaCentral
import BarraPerfil from "../components/BarraPerfil.vue";
import OpcionPerfil from "../components/OpcionPerfil.vue";
import ContenidoMenu from "../components/ContenidoMenu.vue";
import ImagenPerfil from "../components/ImagenPerfil.vue";
import BarraBusqueda from "../components/BarraBusqueda.vue";
import BotonesFiltro from "../components/BotonesFiltro.vue";
// TarjetasPerfiles ya no se usa directamente en este componente, su lógica está integrada.
// import TarjetasPerfiles from "../components/TarjetasPerfiles.vue"; // Esta línea fue eliminada.

export default {
  name: 'PaginaCentral',
  components: {
    BarraPerfil,
    OpcionPerfil,
    ContenidoMenu,
    ImagenPerfil,
    BarraBusqueda,
    BotonesFiltro,
    // TarjetasPerfiles, // Esta línea fue eliminada.
  },
  data() {
    return {
      userName: "Cargando...", // Nombre de usuario
      profileImageSrc: "", // URL de la imagen de perfil
      userProfileType: "", // Tipo de perfil del usuario logueado
      profiles: [], // Almacena los perfiles de otros usuarios
      // Estados para el modal de mensaje
      showMessageModal: false,
      messageModalTitle: '',
      messageModalMessage: ''
    };
  },
  async created() {
    // Al cargar el componente, obtenemos los datos del perfil del usuario logueado
    await this.fetchLoggedInUserProfile();
    // Y luego los perfiles de otros usuarios
    await this.fetchAllProfiles();
  },
  methods: {
    /**
     * @description Obtiene los datos del perfil del usuario logueado desde el backend.
     * Esto incluye el nombre, tipo de perfil y la URL de la foto de perfil.
     */
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
          this.profileImageSrc = profile.foto_perfil_url || ''; // Asigna la URL de la imagen o string vacío
          this.userProfileType = profile.tipo_perfil; // Asigna el tipo de perfil
          console.log('Datos de usuario logueado cargados en PaginaCentral:', {
            userName: this.userName,
            profileImageSrc: this.profileImageSrc,
            userProfileType: this.userProfileType
          });
        } else {
          console.error('Error al cargar el perfil del usuario logueado:', response.status, response.data);
          this.showErrorMessage('Error de Carga', 'No se pudo cargar tu información de perfil.');
        }
      } catch (error) {
        console.error('Error en la solicitud para obtener el perfil del usuario logueado:', error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.showErrorMessage('Sesión Expirada', 'Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo.');
          this.$router.push({ name: 'Principal' }); // Redirigir a login
        } else {
          this.showErrorMessage('Error de Conexión', 'No se pudo conectar con el servidor para cargar tu perfil.');
        }
      }
    },

    /**
     * @description Obtiene todos los perfiles de otros usuarios desde el backend.
     */
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
        this.profiles = response.data;
        console.log('Perfiles de otros usuarios cargados:', this.profiles);
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

    /**
     * @description Maneja el evento cuando se selecciona una imagen en el componente ImagenPerfil.
     * En PaginaCentral, esto podría ser un placeholder o una acción de registro.
     * @param {File} imageFile - El archivo de imagen seleccionado.
     */
    handleImageSelected(imageFile) {
      console.log("Imagen seleccionada en PaginaCentral:", imageFile.name);
      // Aquí podrías añadir lógica si PaginaCentral necesita hacer algo con la imagen seleccionada,
      // como previsualizarla temporalmente o iniciar una subida.
      // Sin embargo, la lógica principal de subida y guardado de la imagen de perfil
      // debería residir en PaginaPerfil, que es donde se edita el perfil.
      this.showMessage('Imagen Seleccionada', `Se ha seleccionado la imagen: ${imageFile.name}. La gestión de la imagen de perfil se realiza en la página de tu perfil.`);
    },

    /**
     * @description Muestra los detalles de un perfil (funcionalidad pendiente).
     * @param {Object} profile - El objeto de perfil a mostrar.
     */
    viewProfileDetails(profile) {
      // Implementa la lógica para ver los detalles de un perfil.
      // Podrías redirigir a una ruta de perfil público o abrir un modal.
      console.log('Ver detalles del perfil:', profile);
      this.showMessage('Funcionalidad Pendiente', `Aquí se mostrarían los detalles completos de ${profile.nombre_usuario}.`);
    },

    // --- Lógica del Modal de Mensaje ---
    /**
     * @description Muestra un modal de mensaje de éxito o información.
     * @param {string} title - El título del modal.
     * @param {string} message - El mensaje a mostrar.
     */
    showMessage(title, message) {
      this.messageModalTitle = title;
      this.messageModalMessage = message;
      this.showMessageModal = true;
    },
    /**
     * @description Muestra un modal de mensaje de error.
     * @param {string} title - El título del modal.
     * @param {string} message - El mensaje de error a mostrar.
     */
    showErrorMessage(title, message) {
      this.messageModalTitle = title;
      this.messageModalMessage = message;
      this.showMessageModal = true;
    },
    /**
     * @description Cierra el modal de mensaje.
     */
    closeMessageModal() {
      this.showMessageModal = false;
      this.messageModalTitle = '';
      this.messageModalMessage = '';
    }
  }
};
</script>

<style></style>
