<template>
  <div>
    <BarraPerfil :userName="userName" />
    <ImagenPerfil :profileImageSrc="userImage" />
    <OpcionPerfil :logout="logout" /> <ContenidoMenu />
    <BarraBusqueda />
    <BotonesFiltro />
    <TarjetasPerfiles :profiles="profiles" /> </div>
</template>

<script>
// Importamos los componentes hijos de PaginaCentral
import BarraPerfil from "../components/BarraPerfil.vue";
import OpcionPerfil from "../components/OpcionPerfil.vue";
import ContenidoMenu from "../components/ContenidoMenu.vue";
import ImagenPerfil from "../components/ImagenPerfil.vue";
import BarraBusqueda from "../components/BarraBusqueda.vue";
import BotonesFiltro from "../components/BotonesFiltro.vue";
import TarjetasPerfiles from "../components/TarjetasPerfiles.vue";
import axios from 'axios'; // Necesitamos axios para futuras llamadas a la API

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
  },
  data() {
    return {
      userName: 'Cargando nombre...', // Valor inicial
      userProfile: '',
      userId: null,
      userImage: '', // Para la URL de la imagen de perfil
      profiles: [], // Array para almacenar los perfiles de otros usuarios
    };
  },
  mounted() {
    // Cuando el componente se monta, intentamos cargar los datos del usuario
    this.loadUserData();
    // También cargamos los perfiles de otros usuarios
    this.fetchProfiles();
  },
  methods: {
    loadUserData() {
      // Recuperar los datos del usuario de localStorage o sessionStorage
      this.userName = localStorage.getItem('userName') || sessionStorage.getItem('userName') || 'Usuario Desconocido';
      this.userProfile = localStorage.getItem('userProfile') || sessionStorage.getItem('userProfile') || '';
      this.userId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || null;
      // Aquí podrías cargar la URL de la imagen de perfil si la guardaste
      this.userImage = localStorage.getItem('userImage') || sessionStorage.getItem('userImage') || '';

      console.log('Datos del usuario cargados en PaginaCentral:', {
        userName: this.userName,
        userProfile: this.userProfile,
        userId: this.userId,
        userImage: this.userImage
      });
    },
    async fetchProfiles() {
      // Simulación de carga de perfiles (reemplaza con tu API real)
      // En un escenario real, harías una llamada a tu backend para obtener los perfiles
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          console.warn('No hay token de autenticación para obtener perfiles.');
          // Podrías redirigir al login si no hay token
          return;
        }

        // Ejemplo de llamada a la API (ajusta la URL a tu endpoint real)
        const response = await axios.get('http://localhost:4000/api/profiles', {
          headers: {
            Authorization: `Bearer ${token}` // Envía el token en la cabecera
          }
        });
        
        if (response.status === 200) {
          this.profiles = response.data; // Asigna los perfiles recibidos
          console.log('Perfiles cargados:', this.profiles);
        } else {
          console.error('Error al cargar perfiles:', response.status, response.data);
          this.profiles = []; // Limpia los perfiles en caso de error
        }
      } catch (error) {
        console.error('Error en la solicitud de perfiles:', error);
        this.profiles = [];
        if (error.response && error.response.status === 401) {
          alert('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
          this.logout(); // Forzar logout si el token no es válido
        }
      }
    },
    logout() {
      // Limpiar todos los datos de la sesión
      localStorage.removeItem('userToken');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userImage'); // Si guardaste la imagen

      sessionStorage.removeItem('userToken');
      sessionStorage.removeItem('userProfile');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('userImage');

      alert('¡Has cerrado sesión exitosamente!');
      console.log('Sesión cerrada. Emitiendo logoutExitoso a PaginaPrincipal.');
      // Emitir un evento para que PaginaPrincipal.vue sepa que la sesión se cerró
      this.$emit('logoutExitoso');
    },
  },
};
</script>

<style></style>