<template>
  <div class="main-wrapper">
    <div class="content-card">
      <!-- Barra de Perfil (ahora recibe userName) -->
      <BarraPerfil :userName="userName" />

      <ValorAcumulado/>

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
      <ContenidoMenu :userRole="userProfileType" class="component-margin-bottom"/>
      
      <!-- Barra de Búsqueda: Escucha el evento 'search' -->
      <BarraBusqueda @search="handleSearch" class="component-margin-bottom"/>
      
      <!-- Botones de Filtro: Escucha el evento 'filter' -->
      <BotonesFiltro @filter="handleFilter" class="buttons-filter-margin-bottom"/>

      <!-- Sección de Perfiles de Otros Usuarios -->
      <h2 class="section-title">Perfiles de Usuarios</h2>
      <!-- CAMBIADO: Ahora itera sobre filteredProfiles en lugar de profiles -->
      <div v-if="filteredProfiles.length > 0" class="profiles-grid">
        <div v-for="profile in filteredProfiles" :key="profile.id_usuario" class="profile-card">
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
            <p class="profile-card-description">{{ profile.descripcion_perfil }}</p>
            <div class="VerPerfilUsuario">
            <button @click="viewProfileDetails(profile)" class="profile-card-button">
              Ver Perfil
            </button>
            </div>
            <div class="SolicitudUsuario">
            <button @click="viewProfileDetails(profile)" class="profile-card-button">
              Solicitud
            </button>
            </div>
          </div>
        </div>
      </div>
      <!-- CAMBIADO: Mensaje si no hay perfiles filtrados -->
      <p v-else class="no-profiles-message">No se encontraron perfiles que coincidan con su búsqueda o filtro.</p>
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
import ValorAcumulado from '@/components/ValorAcumulado.vue'; // Asegúrate de que esta ruta sea correcta

export default {
  name: 'PaginaCentral',
  components: {
    BarraPerfil,
    OpcionPerfil,
    ContenidoMenu,
    ImagenPerfil,
    BarraBusqueda,
    BotonesFiltro,
    ValorAcumulado // Asegúrate de registrar BotonesFiltro
  },
  data() {
    return {
      userName: "Cargando...", // Nombre de usuario
      profileImageSrc: "", // URL de la imagen de perfil
      userProfileType: "", // Tipo de perfil del usuario logueado
      allProfiles: [],   // Almacena todos los perfiles sin filtrar
      searchTerm: '',    // Almacena el término de búsqueda actual
      activeFilter: 'Todos', // NUEVO: Almacena el filtro de tipo de perfil activo
      // Estados para el modal de mensaje
      showMessageModal: false,
      messageModalTitle: '',
      messageModalMessage: ''
    };
  },
  computed: {
    /**
     * @description Propiedad computada que filtra los perfiles basados en el término de búsqueda
     * y el tipo de perfil seleccionado.
     * @returns {Array} Array de perfiles filtrados.
     */
    filteredProfiles() {
      let profilesToFilter = this.allProfiles;

      // 1. Aplicar filtro por término de búsqueda (si existe)
      if (this.searchTerm) {
        const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
        profilesToFilter = profilesToFilter.filter(profile => {
          return profile.nombre_usuario.toLowerCase().includes(lowerCaseSearchTerm);
        });
      }

      // 2. Aplicar filtro por tipo de perfil (si no es 'Todos')
      if (this.activeFilter !== 'Todos') {
        profilesToFilter = profilesToFilter.filter(profile => {
          return profile.tipo_perfil === this.activeFilter;
        });
      }

      return profilesToFilter;
    }
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

    /**
     * @description Maneja el evento 'search' emitido por BarraBusqueda.
     * Actualiza el término de búsqueda y, gracias a la propiedad computada,
     * los perfiles mostrados se actualizarán automáticamente.
     * @param {string} term - El término de búsqueda.
     */
    handleSearch(term) {
      this.searchTerm = term;
      console.log('Término de búsqueda recibido en PaginaCentral:', term);
    },

    /**
     * @description Maneja el evento 'filter' emitido por BotonesFiltro.
     * Actualiza el filtro de tipo de perfil activo.
     * @param {string} filterType - El tipo de perfil a filtrar.
     */
    handleFilter(filterType) {
      this.activeFilter = filterType;
      console.log('Filtro de tipo de perfil recibido en PaginaCentral:', filterType);
      // Opcional: Si quieres limpiar el término de búsqueda al aplicar un filtro, descomenta la siguiente línea:
      // this.searchTerm = '';
    },

    /**
     * @description Maneja el evento cuando se selecciona una imagen en el componente ImagenPerfil.
     * En PaginaCentral, esto podría ser un placeholder o una acción de registro.
     * @param {File} imageFile - El archivo de imagen seleccionado.
     */
    handleImageSelected(imageFile) {
      console.log("Imagen seleccionada en PaginaCentral:", imageFile.name);
      this.showMessage('Imagen Seleccionada', `Se ha seleccionado la imagen: ${imageFile.name}. La gestión de la imagen de perfil se realiza en la página de tu perfil.`);
    },

    /**
     * @description Muestra los detalles de un perfil (funcionalidad pendiente).
     * @param {Object} profile - El objeto de perfil a mostrar.
     */
    viewProfileDetails(profile) {
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
