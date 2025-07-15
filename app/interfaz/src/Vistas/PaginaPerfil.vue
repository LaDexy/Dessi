<template>
  <div>
    <!--Componentes de pagina de perfil-->

    <!-- IconoEditar ahora escucha el click y activa el selector de ImagenPerfil -->
    <IconoEditar @click="activateImageUpload" />

    <!-- ImagenPerfil ahora tiene una ref y escucha el evento imageSelected -->
    <ImagenPerfil
      ref="imagenPerfilComponent"
      :profileImageSrc="profileImageSrc"
      @imageSelected="handleImageSelected"
    />

    <BarraPerfil :userName="userName" />
    <!-- Asegúrate de pasar userName si lo necesitas aquí -->
    <BotonesDesafios @MostrarRegistro="MostrarRegistro" />
    <TipoPerfil />
    <PortafolioPerfil />

    <CrearDesafio
      v-if="CrearDesafioNuevo"
      @cerrar="CrearDesafioNuevo = false"
      @MostrarRegistro="MostrarRegistro"
    />
    <VerDesafio
      v-if="VerDesafiosCreados"
      @cerrar="VerDesafiosCreados = false"
      @MostrarRegistro="MostrarRegistro"
    />
  </div>
</template>

<script>
/*Importacion de componentes de pagina de perfil*/
import BarraPerfil from "../components/BarraPerfil.vue";
import ImagenPerfil from "../components/ImagenPerfil.vue";
import TipoPerfil from "../components/TipoPerfil.vue";
import PortafolioPerfil from "../components/PortafolioPerfil.vue";
import BotonesDesafios from "../components/BotonesDesafios.vue";
import CrearDesafio from "@/components/CrearDesafio.vue";
import VerDesafio from "@/components/VerDesafio.vue";
import IconoEditar from "@/components/IconoEditar.vue"; // Asegúrate de que esta ruta sea correcta
import axios from "axios"; // Necesitamos axios para subir la imagen

export default {
  name: "PaginaPerfil",
  data() {
    return {
      CrearDesafioNuevo: false,
      VerDesafiosCreados: false,
      profileImageSrc: "", // ¡NUEVO! Para la URL de la imagen de perfil
      userName: "", // Para pasar a BarraPerfil, si es necesario
      userId: null, // Para saber qué usuario está logueado
    };
  },
  components: {
    BarraPerfil,
    ImagenPerfil,
    TipoPerfil,
    PortafolioPerfil,
    BotonesDesafios,
    CrearDesafio,
    VerDesafio,
    IconoEditar,
  },
  mounted() {
    // Al montar, carga la URL de la imagen de perfil del usuario logueado
    this.loadUserProfileData();
  },
  methods: {
    loadUserProfileData() {
      // Recupera el userId y userName (si los necesitas para BarraPerfil)
      this.userId =
        localStorage.getItem("userId") || sessionStorage.getItem("userId");
      this.userName =
        localStorage.getItem("userName") || sessionStorage.getItem("userName");

      // Aquí harías una llamada a tu backend para obtener la URL de la foto de perfil
      // Por ahora, simularemos que la obtienes o la cargas de algún lugar
      // En el futuro, harías un axios.get('/api/profile/me') y obtendrías profile_image_url
      const storedImage =
        localStorage.getItem("userImage") ||
        sessionStorage.getItem("userImage");
      if (storedImage) {
        this.profileImageSrc = storedImage;
      } else {
        // Si no hay imagen guardada, usa la por defecto
        this.profileImageSrc = require("../assets/Usuario.png");
      }
      console.log(
        "Datos de perfil cargados en PaginaPerfil. Imagen:",
        this.profileImageSrc
      );
    },
    MostrarRegistro(Todo) {
      this.CrearDesafioNuevo = false;
      this.VerDesafiosCreados = false;

      if (Todo == "DesafiosNuevos") {
        this.CrearDesafioNuevo = true;
      } else if (Todo == "DesafiosCreados") {
        this.VerDesafiosCreados = true;
      }
    },
    // Método llamado cuando se hace clic en IconoEditar
    activateImageUpload() {
      // Llama al método openFileInput del componente ImagenPerfil
      this.$refs.imagenPerfilComponent.openFileInput();
      console.log(
        "IconoEditar clicado. Activando selector de archivos en ImagenPerfil."
      );
    },
    // Método llamado cuando ImagenPerfil emite 'imageSelected'
    async handleImageSelected(file) {
      console.log("Archivo recibido en PaginaPerfil:", file.name);
      // Aquí es donde envías el archivo al backend
      const formData = new FormData();
      formData.append("profileImage", file);
      formData.append("userId", this.userId); // Envía el ID del usuario para saber a quién actualizar

      try {
        const token =
          localStorage.getItem("userToken") ||
          sessionStorage.getItem("userToken");
        if (!token) {
          alert("No estás autenticado. Por favor, inicia sesión.");
          this.$router.push({ name: "Principal" }); // Redirige al login
          return;
        }

        // ¡IMPORTANTE! Asegúrate de que tu backend tenga este endpoint
        const response = await axios.post(
          "http://localhost:4000/api/upload-profile-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data", // Crucial para subir archivos
              Authorization: `Bearer ${token}`, // Envía el token para autenticación
            },
          }
        );

        if (response.status === 200) {
          const newImageUrl = response.data.imageUrl;
          this.profileImageSrc = newImageUrl; // Actualiza la imagen mostrada
          // Guarda la nueva URL en localStorage/sessionStorage para persistencia
          localStorage.setItem("userImage", newImageUrl);
          sessionStorage.setItem("userImage", newImageUrl);
          alert("Foto de perfil actualizada exitosamente!");
          console.log("Foto de perfil actualizada a:", newImageUrl);
        } else {
          alert(
            "Error al subir la imagen: " +
              (response.data.message || "Error desconocido.")
          );
          console.error("Error en la respuesta del backend:", response.data);
        }
      } catch (error) {
        console.error("Error al subir la imagen:", error);
        alert("Error al subir la imagen. Por favor, inténtalo de nuevo.");
        if (error.response) {
          console.error(
            "Respuesta de error:",
            error.response.status,
            error.response.data
          );
        }
      }
    },
  },
};
</script>

<style></style>
