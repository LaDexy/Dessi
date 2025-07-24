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

    <BotonesDesafios
      v-if="userProfile === 'Emprendedor'"
      @MostrarRegistro="MostrarRegistro"
    />

    <div class="portfolio-section-wrapper">
      <IconoCamara
        @imageSelected="handlePortfolioImageSelected"
        class="portfolio-camera-icon"
      />
      <IconoPortafolio
        :userProfile="userProfile"
        @documentSelected="handlePortfolioDocumentSelected"
      />
      <PortafolioPerfil :projects="userProjects" :documents="userDocuments" />
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
      @verDetalle="handleVerDetalleDesafio" ref="verDesafioComponent"
    />

    <ParticipantesDesafios
      v-if="showDetalleDesafioModal"
      :idDesafio="selectedChallengeId"
      @cerrarDetalle="showDetalleDesafioModal = false"
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
import IconoCamara from "@/components/IconoCamara.vue";
import IconoPortafolio from "@/components/IconoPortafolio.vue";
import ParticipantesDesafios from "@/components/ParticipantesDesafios.vue"; // Importado el nuevo nombre
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
      userProjects: [],
      userDocuments: [],
      CrearDesafioNuevo: false,
      VerDesafiosCreados: false,
      showDetalleDesafioModal: false, // Controla si ParticipantesDesafios está visible
      selectedChallengeId: null,      // Almacena el ID del desafío seleccionado
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
    IconoCamara,
    IconoPortafolio,
    ParticipantesDesafios, // Registrado con el nuevo nombre
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
          
          this.userProjects = profile.proyectos || []; 
          this.userDocuments = profile.documentos || []; 

          console.log("URL de imagen de perfil obtenida del backend:", this.profileImageSrc);
          console.log("Datos de perfil cargados desde el backend:", {
            userName: this.userName,
            profileImageSrc: this.profileImageSrc,
            userId: this.userId,
            userProfile: this.userProfile,
            userDescription: this.userDescription,
            userProjects: this.userProjects,
            userDocuments: this.userDocuments
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
      console.log("Archivo recibido en PaginaPerfil para subir la foto de perfil:", file.name);
      const formData = new FormData();
      formData.append("profileImage", file);

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
    async handlePortfolioImageSelected(file) {
      console.log("Archivo recibido en PaginaPerfil para subir al portafolio (IMAGEN):", file.name);
      const formData = new FormData();
      formData.append("portfolioImages", file); 
      
      try {
        const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken");
        if (!token) {
          alert("No estás autenticado. Por favor, inicia sesión.");
          this.$router.push({ name: "Principal" });
          return;
        }

        const response = await axios.post(
          "http://localhost:4000/api/upload-portafolio-images", 
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
    async handlePortfolioDocumentSelected(file) {
      console.log("Archivo recibido en PaginaPerfil para subir al portafolio (DOCUMENTO):", file.name);
      const formData = new FormData();
      formData.append("portfolioDocument", file); 

      try {
        const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken");
        if (!token) {
          alert("No estás autenticado. Por favor, inicia sesión.");
          this.$router.push({ name: "Principal" });
          return;
        }

        const response = await axios.post(
          "http://localhost:4000/api/upload-portafolio-document", 
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          alert("Documento de portafolio subido exitosamente!");
          await this.loadUserProfileData(); 
        } else {
          alert("Error al subir el documento: " + (response.data.message || "Error desconocido."));
          console.error("Error en la respuesta del backend al subir documento:", response.data);
        }
      } catch (error) {
        console.error("Error al subir el documento del portafolio:", error);
        alert("Error al subir el documento. Por favor, inténtalo de nuevo.");
        if (error.response) {
          console.error("Respuesta de error:", error.response.status, error.response.data);
          if (error.response.status === 403) {
            alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
            this.$router.push({ name: "Principal" });
          }
        }
      }
    },
    handleDescriptionUpdate(newDescription) {
      console.log("Recibido evento update-description en PaginaPerfil. Nueva descripción:", newDescription);
      try {
        const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken");
        if (!token) {
          alert("No estás autenticado. Por favor, inicia sesión.");
          this.$router.push({ name: "Principal" });
          return;
        }

        axios.patch(
          "http://localhost:4000/api/profile/description",
          { description: newDescription },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(response => {
            if (response.status === 200) {
              this.userDescription = newDescription;
              alert("Descripción actualizada exitosamente!");
              console.log("Descripción de perfil actualizada a:", newDescription);
            } else {
              alert("Error al actualizar la descripción: " + (response.data.message || "Error desconocido."));
              console.error("Error en la respuesta del backend:", response.data);
            }
        })
        .catch(error => {
            console.error("Error al actualizar la descripción:", error);
            alert("Error al actualizar la descripción. Por favor, inténtalo de nuevo.");
            if (error.response) {
              console.error("Respuesta de error:", error.response.status, error.response.data);
              if (error.response.status === 403) {
                alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
                this.$router.push({ name: "Principal" });
              }
            }
        });
      } catch (error) {
          console.error("Error inesperado al actualizar la descripción:", error);
          alert("Error inesperado al actualizar la descripción.");
      }
    },
    MostrarRegistro(Todo) {
      // Cierra todos los modales relacionados con desafíos antes de abrir el nuevo
      this.CrearDesafioNuevo = false;
      this.VerDesafiosCreados = false;
      this.showDetalleDesafioModal = false; // Asegura que el modal de detalle esté cerrado

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
    },
    // MÉTODO AGREGADO: Maneja el evento 'verDetalle' emitido por VerDesafios
    handleVerDetalleDesafio(id) {
        this.selectedChallengeId = id;        // Guarda el ID del desafío
        this.showDetalleDesafioModal = true;  // Abre el modal de detalle
        this.VerDesafiosCreados = false;      // Cierra el modal de lista
    }
  },
};
</script>

<style scoped>
/* Scoped styles are generally better for components to prevent style bleeding */
.pagina-perfil-container {
    position: relative; /* Para posicionar los modales si son 'absolute' */
    /* Asegúrate de que el contenedor principal de tu página tenga suficiente z-index
       o que los modales tengan un z-index alto para aparecer encima. */
}

/* Estilos existentes para los elementos de PaginaPerfil */
.user-name-display-wrapper {
  position: absolute;
  top: 180px; /* Ajusta según tu diseño */
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  text-align: center;
}

.user-name-display {
  color: #333; /* O el color que uses para el nombre de usuario */
  font-size: 2.5em; /* Ajusta el tamaño de fuente */
  margin: 0;
}

</style>
