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
      
      <TarjetasPerfiles :profiles="filteredProfiles" />

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
// ELIMINADO: Ya no necesitamos importar ValorAcumulado aquí
// import ValorAcumulado from '@/components/ValorAcumulado.vue'; 

// Importamos TarjetasPerfiles.vue (que ya contiene la lógica de v-for y ValorAcumulado)
import TarjetasPerfiles from '@/components/TarjetasPerfiles.vue';


export default {
  name: 'PaginaCentral',
  components: {
    BarraPerfil,
    OpcionPerfil,
    ContenidoMenu,
    ImagenPerfil,
    BarraBusqueda,
    BotonesFiltro,
    // ELIMINADO: Ya no necesitamos registrar ValorAcumulado aquí
    // ValorAcumulado, 
    TarjetasPerfiles // Registramos TarjetasPerfiles
  },
  data() {
    return {
      userName: "Cargando...",
      profileImageSrc: "",
      userProfileType: "",
      allProfiles: [],
      searchTerm: '',
      activeFilter: 'Todos',
      showMessageModal: false,
      messageModalTitle: '',
      messageModalMessage: ''
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

      return profilesToFilter;
    }
  },
  async created() {
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

    // Este método es para los botones "Ver Perfil" y "Solicitud" dentro de la tarjeta
    // Es importante que estos botones NO hagan la navegación aquí directamente,
    // sino que el evento sea capturado en TarjetasPerfiles si fuera necesario.
    // O si TarjetasPerfiles no emite el evento, entonces se puede mantener aquí
    // si el componente Tarjeta individual tuviera su propia lógica de navegación.
    // Dado que PaginaCentral ya maneja filteredProfiles, esta función es para los botones de las tarjetas
    viewProfileDetails(profile) {
      console.log('Ver detalles del perfil:', profile);
      this.showMessage('Funcionalidad Pendiente', `Aquí se mostrarían los detalles completos de ${profile.nombre_usuario}.`);
      // this.$router.push({ name: 'PerfilDetalle', params: { id: profile.id_usuario } });
    },

    // --- Lógica del Modal de Mensaje ---
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

<style scoped>
/* Copia aquí los estilos relacionados con .profiles-grid, .section-title, .no-profiles-message */
/* Y cualquier otro estilo que afecte el layout general de PaginaCentral que no esté en los componentes hijos */

.profiles-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* Centra las tarjetas en la cuadrícula */
  gap: 20px; /* Espacio entre las tarjetas */
  margin-top: 20px;
}

.section-title {
  text-align: center;
  margin-top: 40px;
  margin-bottom: 20px;
  font-size: 2em;
  color: #6c5ce7;
}

.no-profiles-message {
  text-align: center;
  color: #888;
  font-style: italic;
  margin-top: 30px;
}

/* Mantén tus estilos existentes para main-wrapper, content-card, etc. */
.main-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.content-card {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.user-name-display-wrapper {
  text-align: center;
}

.user-name-display {
  font-size: 2.2em;
  color: #333;
  margin-bottom: 5px;
}

.user-profile-type {
  font-size: 1.1em;
  color: #777;
}

.component-margin-bottom {
  margin-bottom: 20px;
}

.buttons-filter-margin-bottom {
  margin-bottom: 30px;
}

.profile-image-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

/* Estilos para el modal */
.message-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.message-modal-content {
  background-color: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  text-align: center;
  width: 90%;
  max-width: 400px;
}

.message-modal-title {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 15px;
}

.message-modal-message {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 25px;
}

.message-modal-button-close {
  background-color: #6c5ce7;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.message-modal-button-close:hover {
  background-color: #5a4bbf;
}
</style>