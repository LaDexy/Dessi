<template>
  <div>
    <div v-if="!isLoggedIn">
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
      /> <CrearContrasena v-if="MostrarClave" @cerrar="MostrarClave = false" />
    </div>

    <div v-else>
      <PaginaCentral @logoutExitoso="handleLogoutSuccess" />
    </div>
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
// IMPORTANTE: Importamos PaginaCentral
import PaginaCentral from "./PaginaCentral.vue"; // Asegúrate que la ruta sea correcta

export default {
  name: "PaginaPrincipal",
  data() {
    return {
      MostrarRegistroEmpre: false,
      MostrarRegistroDise: false,
      MostrarRegistroMar: false,
      MostrarInicioSes: false,
      MostrarClave: false,
      isLoggedIn: false, // ¡NUEVO! Controla si el usuario ha iniciado sesión
    };
  },
  // NUEVO: Método para verificar la sesión al cargar la página
  mounted() {
    // Comprueba si hay un token de usuario en localStorage o sessionStorage
    if (localStorage.getItem('userToken') || sessionStorage.getItem('userToken')) {
      this.isLoggedIn = true; // Si hay un token, el usuario está logueado
      console.log('Sesión detectada al cargar PaginaPrincipal.');
    } else {
      console.log('No hay sesión detectada al cargar PaginaPrincipal.');
    }
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
    // NUEVO: Método llamado cuando InicioSesion emite 'loginExitoso'
    handleLoginSuccess() {
      this.isLoggedIn = true; // Establece el estado a logueado
      this.MostrarInicioSes = false; // Oculta el modal de inicio de sesión
      console.log('Login exitoso. Mostrando PaginaCentral.');
    },
    // NUEVO: Método llamado cuando PaginaCentral emite 'logoutExitoso'
    handleLogoutSuccess() {
      this.isLoggedIn = false; // Establece el estado a no logueado
      console.log('Logout exitoso. Volviendo a la página principal.');
    }
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
    PaginaCentral, // ¡NUEVO! Declaramos PaginaCentral como un componente
  },
};
</script>

<style>

</style>
