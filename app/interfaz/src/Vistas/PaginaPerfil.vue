<template>
  <div class="pagina-perfil-container">
    <!-- Contenedor para ImagenPerfil y IconoEditar -->
    <div class="profile-image-section">
      <ImagenPerfil
        ref="imagenPerfilComponent"
        :profileImageSrc="profileImageSrc"
        @imageSelected="handleImageSelected"
      />
      <!-- IconoEditar se posiciona absolutamente dentro de profile-image-section -->
      <IconoEditar @click="activateImageUpload" class="edit-icon-overlay" />
    </div>

    <!-- Este es el h1 que mostrará el nombre de usuario -->
    <div class="user-name-display-wrapper"> 
      <h1 class="user-name-display">{{ userName }}</h1>
    </div>

    <!-- Barra de perfil (rectángulo rosa) -->
    <BarraPerfil />

    <!-- Tipo de perfil y descripción -->
    <!-- Asegúrate de pasar la prop 'description' y escuchar el evento 'update-description' -->
    <TipoPerfil
      :profileType="userProfile"
      :description="userDescription"
      @update-description="handleDescriptionUpdate"
    />

    <!-- El resto de tus componentes -->
    <BotonesDesafios @MostrarRegistro="MostrarRegistro" />
    <PortafolioPerfil />

    <CrearDesafio
      v-if="CrearDesafioNuevo"
      :userId="userId"
      @cerrar="CrearDesafioNuevo = false"
      @challengeCreated="handleChallengeCreated"
    />
    <VerDesafio
      v-if="VerDesafiosCreados"
      :userId="userId"
      @cerrar="VerDesafiosCreados = false"
      ref="verDesafioComponent"
    />
  </div>
</template>

<script>
/* Importación de componentes de página de perfil */
import ImagenPerfil from "../components/ImagenPerfil.vue";
import IconoEditar from "@/components/IconoEditar.vue";
import CrearDesafio from "@/components/CrearDesafio.vue";
import VerDesafio from "@/components/VerDesafio.vue";
import BarraPerfil from "../components/BarraPerfil.vue";
import TipoPerfil from "../components/TipoPerfil.vue";
import PortafolioPerfil from "../components/PortafolioPerfil.vue";
import BotonesDesafios from "../components/BotonesDesafios.vue";
import axios from "axios";

export default {
  name: "PaginaPerfil",
  data() {
    return {
      userName: "",
      profileImageSrc: "",
      userId: null,
      userProfile: "",
      userDescription: "", // Aquí se almacenará la descripción del usuario
      CrearDesafioNuevo: false,
      VerDesafiosCreados: false,
    };
  },
  components: {
    ImagenPerfil,
    IconoEditar,
    CrearDesafio,
    VerDesafio,
    BarraPerfil,
    TipoPerfil,
    PortafolioPerfil,
    BotonesDesafios,
  },
  mounted() {
    this.loadUserProfileData();
  },
  methods: {
    async loadUserProfileData() {
      try {
        const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken");
        if (!token) {
          alert("No estás autenticado. Por favor, inicia sesión.");
          this.$router.push({ name: "Principal" });
          return;
        }

        const response = await axios.get("http://localhost:4000/api/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          const profile = response.data;
          this.userId = profile.id_usuario;
          this.userName = profile.nombre_usuario;
          this.profileImageSrc = profile.foto_perfil_url || require("../assets/Usuario.png");
          this.userProfile = profile.tipo_perfil;
          // Asigna la descripción obtenida del backend, si no existe, usa un valor por defecto
          this.userDescription = profile.descripcion_perfil || "Aca va una breve descripcion"; 
          
          console.log("URL de imagen de perfil obtenida del backend:", this.profileImageSrc);
          console.log("Datos de perfil cargados desde el backend:", {
            userName: this.userName,
            profileImageSrc: this.profileImageSrc,
            userId: this.userId,
            userProfile: this.userProfile,
            userDescription: this.userDescription // ¡Verifica este log!
          });
        } else {
          alert("Error al cargar el perfil: " + (response.data.message || "Error desconocido."));
        }
      } catch (error) {
        console.error("Error al obtener datos del perfil:", error);
        alert("Error al cargar los datos del perfil. Por favor, inténtalo de nuevo.");
        if (error.response && error.response.status === 403) {
          alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
          this.$router.push({ name: "Principal" });
        }
      }
    },
    activateImageUpload() {
      this.$refs.imagenPerfilComponent.openFileInput();
      console.log("IconoEditar clicado. Activando selector de archivos en ImagenPerfil.");
    },
    async handleImageSelected(file) {
      console.log("Archivo recibido en PaginaPerfil para subir:", file.name);
      const formData = new FormData();
      formData.append("profileImage", file);
      formData.append("userId", this.userId);

      try {
        const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken");
        if (!token) {
          alert("No estás autenticado. Por favor, inicia sesión.");
          this.$router.push({ name: "Principal" });
          return;
        }

        const response = await axios.post(
          "http://localhost:4000/api/upload-profile-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          const newImageUrl = response.data.imageUrl;
          this.profileImageSrc = newImageUrl;
          alert("Foto de perfil actualizada exitosamente!");
          console.log("Foto de perfil actualizada a:", newImageUrl);
        } else {
          alert("Error al subir la imagen: " + (response.data.message || "Error desconocido."));
          console.error("Error en la respuesta del backend al subir imagen:", response.data);
        }
      } catch (error) {
        console.error("Error al subir la imagen:", error);
        alert("Error al subir la imagen. Por favor, inténtalo de nuevo.");
        if (error.response) {
          console.error("Respuesta de error:", error.response.status, error.response.data);
        }
      }
    },
    /**
     * @brief Maneja la actualización de la descripción del perfil.
     * @param {string} newDescription - La nueva descripción enviada desde TipoPerfil.
     */
    async handleDescriptionUpdate(newDescription) {
      console.log("Recibido evento update-description en PaginaPerfil. Nueva descripción:", newDescription); // ¡Verifica este log!
      try {
        const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken");
        if (!token) {
          alert("No estás autenticado. Por favor, inicia sesión.");
          this.$router.push({ name: "Principal" });
          return;
        }

        // Realiza la solicitud PATCH al backend para actualizar la descripción
        const response = await axios.patch(
          "http://localhost:4000/api/profile/description", // Endpoint para actualizar la descripción
          { description: newDescription }, // Envía la nueva descripción en el cuerpo de la solicitud
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          this.userDescription = newDescription; // ¡CRUCIAL! Actualiza la descripción en el estado local de PaginaPerfil
          alert("Descripción actualizada exitosamente!");
          console.log("Descripción de perfil actualizada a:", newDescription);
        } else {
          alert("Error al actualizar la descripción: " + (response.data.message || "Error desconocido."));
          console.error("Error en la respuesta del backend:", response.data);
        }
      } catch (error) {
        console.error("Error al actualizar la descripción:", error);
        alert("Error al actualizar la descripción. Por favor, inténtalo de nuevo.");
        if (error.response) {
          console.error("Respuesta de error:", error.response.status, error.response.data);
          // Si el token es inválido o expirado, redirigir al login
          if (error.response.status === 403) {
            alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
            this.$router.push({ name: "Principal" });
          }
        }
      }
    },
    MostrarRegistro(Todo) {
      this.CrearDesafioNuevo = false;
      this.VerDesafiosCreados = false;

      if (Todo === "DesafiosNuevos") {
        this.CrearDesafioNuevo = true;
      } else if (Todo === "DesafiosCreados") {
        this.VerDesafiosCreados = true;
        this.$nextTick(() => {
          if (this.$refs.verDesafioComponent) {
            this.$refs.verDesafioComponent.loadChallenges();
          }
        });
      }
    },
    handleChallengeCreated() {
        console.log('Un nuevo desafío ha sido creado. Intentando recargar la lista de desafíos si está visible.');
        this.$nextTick(() => {
            if (this.$refs.verDesafioComponent && this.VerDesafiosCreados) {
                this.$refs.verDesafioComponent.loadChallenges();
            }
        });
    }
  },
};
</script>

<style>
.NombreUsuario {
  position: absolute;
  z-index: 2;
  top: 180px;
}
</style>
