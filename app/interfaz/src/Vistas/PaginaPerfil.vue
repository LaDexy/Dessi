<template>
  <div class="pagina-perfil-container">
    <div class="profile-image-section">
      <ImagenPerfil
        ref="imagenPerfilComponent"
        :profileImageSrc="profileImageSrc"
        @imageSelected="handleImageSelected"
      />
      <IconoEditar @click="activateImageUpload" class="edit-icon-overlay" />
    </div>

    <div class="user-name-display-wrapper"> 
      <h1 class="user-name-display">{{ userName }}</h1>
    </div>

    <BarraPerfil />

    <TipoPerfil
      :profileType="userProfile"
      :description="userDescription"
      @update-description="handleDescriptionUpdate"
    />

    <BotonesDesafios @MostrarRegistro="MostrarRegistro" />
    
    <div class="portfolio-section-wrapper">
      <IconoCamara @imageSelected="handlePortfolioImageSelected" class="portfolio-camera-icon" />
      <PortafolioPerfil :projects="userProjects" />
    </div>

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
import IconoCamara from "@/components/IconoCamara.vue"; // ¡Importa el nuevo componente!
import axios from "axios";

export default {
  name: "PaginaPerfil",
  data() {
    return {
      userName: "",
      profileImageSrc: "",
      userId: null,
      userProfile: "",
      userDescription: "",
      userProjects: [], // ¡NUEVO! Para almacenar los proyectos/imágenes del portafolio
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
    IconoCamara, // ¡Añádelo a la lista de componentes!
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
          this.userDescription = profile.descripcion_perfil || "Aca va una breve descripcion";
          this.userProjects = profile.proyectos || []; // ¡Asigna los proyectos cargados!
          
          console.log("URL de imagen de perfil obtenida del backend:", this.profileImageSrc);
          console.log("Datos de perfil cargados desde el backend:", {
            userName: this.userName,
            profileImageSrc: this.profileImageSrc,
            userId: this.userId,
            userProfile: this.userProfile,
            userDescription: this.userDescription,
            userProjects: this.userProjects // ¡Verifica este log para el portafolio!
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
    async handleDescriptionUpdate(newDescription) {
      console.log("Recibido evento update-description en PaginaPerfil. Nueva descripción:", newDescription);
      try {
        const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken");
        if (!token) {
          alert("No estás autenticado. Por favor, inicia sesión.");
          this.$router.push({ name: "Principal" });
          return;
        }

        const response = await axios.patch(
          "http://localhost:4000/api/profile/description",
          { description: newDescription },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          this.userDescription = newDescription;
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
          if (error.response.status === 403) {
            alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
            this.$router.push({ name: "Principal" });
          }
        }
      }
    },
    /**
     * @brief Maneja la subida de una nueva imagen al portafolio.
     * @param {File} file - El archivo de imagen seleccionado por el usuario.
     */
    async handlePortfolioImageSelected(file) {
      console.log("Archivo recibido en PaginaPerfil para subir al portafolio:", file.name);
      const formData = new FormData();
      formData.append("portfolioImage", file); // El nombre 'portfolioImage' debe coincidir con el campo de Multer en el backend
      
      try {
        const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken");
        if (!token) {
          alert("No estás autenticado. Por favor, inicia sesión.");
          this.$router.push({ name: "Principal" });
          return;
        }

        const response = await axios.post(
          "http://localhost:4000/api/portfolio/upload-image", // ¡Nueva ruta en el backend!
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          alert("Imagen de portafolio subida exitosamente!");
          // Vuelve a cargar los datos del perfil para que la nueva imagen aparezca en el portafolio
          await this.loadUserProfileData(); 
        } else {
          alert("Error al subir la imagen del portafolio: " + (response.data.message || "Error desconocido."));
          console.error("Error en la respuesta del backend al subir imagen del portafolio:", response.data);
        }
      } catch (error) {
        console.error("Error al subir la imagen del portafolio:", error);
        alert("Error al subir la imagen del portafolio. Por favor, inténtalo de nuevo.");
        if (error.response) {
          console.error("Respuesta de error:", error.response.status, error.response.data);
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
