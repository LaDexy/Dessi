<template>
  <div>
    <!-- Este componente ahora solo muestra el contenido de la página de inicio -->
    <TituloInicial />
    <BotonesRegistro @MostrarRegistro="MostrarRegistro" />
    <TextoMotivador />
    <CarruselImagenes />
    <LogrosUsuarios />
    <ImagenCentral />
    <OpcionesBarra />
    <PatenteAdmin />

    <RegistroEmprendedor
      v-if="MostrarRegistroEmpre"
      @cerrar="MostrarRegistroEmpre = false"
      @MostrarRegistro="MostrarRegistro"
    />
    <RegistroDisenador
      v-if="MostrarRegistroDise"
      @cerrar="MostrarRegistroDise = false"
      @MostrarRegistro="MostrarRegistro"
    />
    <RegistroMarketing
      v-if="MostrarRegistroMar"
      @cerrar="MostrarRegistroMar = false"
      @MostrarRegistro="MostrarRegistro"
    />
    <InicioSesion
      v-if="MostrarInicioSes"
      @cerrar="MostrarInicioSes = false"
      @loginExitoso="handleLoginSuccess"
    />
    <CrearContrasena v-if="MostrarClave" @cerrar="MostrarClave = false" />
  </div>
</template>

<script>
/* Importacion de componentes de pagina principal */
import OpcionesBarra from "../components/OpcionesBarra.vue";
import BotonesRegistro from "../components/BotonesRegistro.vue";
import CarruselImagenes from "../components/CarruselImagenes.vue";
import ImagenCentral from "../components/ImagenCentral.vue";
import LogrosUsuarios from "../components/LogrosUsuarios.vue";
import PatenteAdmin from "../components/PatenteAdmin.vue";
import TextoMotivador from "../components/TextoMotivador.vue";
import TituloInicial from "../components/TituloInicial.vue";
import RegistroDisenador from "../components/RegistroDisenador.vue";
import RegistroMarketing from "../components/RegistroMarketing.vue";
import RegistroEmprendedor from "../components/RegistroEmprendedor.vue";
import InicioSesion from "../components/InicioSesion.vue";
import CrearContrasena from "../components/CrearContrasena.vue";

export default {
  name: "PaginaPrincipal",
  data() {
    return {
      MostrarRegistroEmpre: false,
      MostrarRegistroDise: false,
      MostrarRegistroMar: false,
      MostrarInicioSes: false,
      MostrarClave: false,
      // isLoggedIn ya no es necesario aquí, el router lo manejará
    };
  },
  methods: {
    MostrarRegistro(Tipo) {
      this.MostrarRegistroEmpre = false;
      this.MostrarRegistroDise = false;
      this.MostrarRegistroMar = false;
      this.MostrarInicioSes = false;
      this.MostrarClave = false;

      if (Tipo == 'Emprendedor') {
        this.MostrarRegistroEmpre = true;
      } else if (Tipo == 'Diseñador') {
        this.MostrarRegistroDise = true;
      } else if (Tipo == 'Clave') {
        this.MostrarClave = true;
      } else if (Tipo == 'Iniciar') {
        this.MostrarInicioSes = true;
      } else { // Asume que es 'Marketing' o cualquier otro caso por defecto
        this.MostrarRegistroMar = true;
      }
    },
    // Cuando el login es exitoso, navegamos a la ruta 'Central'
    handleLoginSuccess() {
      console.log('Login exitoso. Navegando a /central.');
      this.$router.push({ name: 'Central' }); // Redirige a la ruta de PaginaCentral
    },
  },
  components: {
    PatenteAdmin,
    OpcionesBarra,
    BotonesRegistro,
    CarruselImagenes,
    ImagenCentral,
    LogrosUsuarios,
    TextoMotivador,
    TituloInicial,
    RegistroEmprendedor,
    RegistroDisenador,
    RegistroMarketing,
    InicioSesion,
    CrearContrasena,
    // PaginaCentral ya no se importa ni se renderiza aquí
  },
};
</script>

<style>
/* Puedes añadir estilos globales aquí si es necesario */
</style>
