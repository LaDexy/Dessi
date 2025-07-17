<template>
  <div>
    <BarraPerfil :userName="userName" />
    <div class="profile-image-section">
      <ImagenPerfil
        ref="imagenPerfilComponent"
        :profileImageSrc="profileImageSrc"
        @imageSelected="handleImageSelected"
      />
    <!-- Este es el h1 que mostrará el nombre de usuario -->
    <div class="user-name-display-wrapper">
      <h1 class="user-name-display">{{ userName }}</h1>
    </div>
    <!-- OpcionPerfil ya no necesita la prop 'logout', maneja su propia lógica -->
    <OpcionPerfil />
    <ContenidoMenu />
    <BarraBusqueda />
    <BotonesFiltro />
    <TarjetasPerfiles :profiles="profiles" />
  </div>
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
import axios from "axios"; // Necesitamos axios para futuras llamadas a la API

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
      userName: "Cargando nombre...", // Valor inicial
      userProfile: "",
      userId: null,
      userImage: "", // Para la URL de la imagen de perfil
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
      this.userName =
        localStorage.getItem("userName") ||
        sessionStorage.getItem("userName") ||
        "Usuario Desconocido";
      this.userProfile =
        localStorage.getItem("userProfile") ||
        sessionStorage.getItem("userProfile") ||
        "";
      this.userId =
        localStorage.getItem("userId") ||
        sessionStorage.getItem("userId") ||
        null;
      // Aquí podrías cargar la URL de la imagen de perfil si la guardaste
      this.userImage =
        localStorage.getItem("userImage") ||
        sessionStorage.getItem("userImage") ||
        "";

      console.log("Datos del usuario cargados en PaginaCentral:", {
        userName: this.userName,
        userProfile: this.userProfile,
        userId: this.userId,
        userImage: this.userImage,
      });
    },
    async fetchProfiles() {
      try {
        const token =
          localStorage.getItem("userToken") ||
          sessionStorage.getItem("userToken");
        if (!token) {
          console.warn("No hay token de autenticación para obtener perfiles.");
          // **CAMBIO CLAVE AQUÍ:** Redirige usando el nombre de la ruta 'Principal'
          this.$router.push({ name: "Principal" });
          return;
        }

        const response = await axios.get("http://localhost:4000/api/profiles", {
          headers: {
            Authorization: `Bearer ${token}`, // Envía el token en la cabecera
          },
        });

        if (response.status === 200) {
          this.profiles = response.data; // Asigna los perfiles recibidos
          console.log("Perfiles cargados:", this.profiles);
        } else {
          console.error(
            "Error al cargar perfiles:",
            response.status,
            response.data
          );
          this.profiles = []; // Limpia los perfiles en caso de error
        }
      } catch (error) {
        console.error("Error en la solicitud de perfiles:", error);
        this.profiles = [];
        if (error.response && error.response.status === 401) {
          console.log(
            "Token expirado o no autorizado en fetchProfiles. Redirigiendo a PaginaPrincipal."
          );
          // **CAMBIO CLAVE AQUÍ:** Redirige usando el nombre de la ruta 'Principal'
          this.$router.push({ name: "Principal" });
        }
      }
    },
    // El método logout ya no es necesario aquí, ya que OpcionPerfil lo maneja internamente.
    // logout() {
    //   // ... (código anterior de logout si lo tuvieras aquí)
    // }
  },
};
</script>

<style></style>
