<template>
  <div>
    <TituloInicial />
    <BotonesRegistro @MostrarRegistro="MostrarRegistro"/>
    <TextoMotivador />
    <CarruselImagenes />
    <LogrosUsuarios />
    <ImagenCentral />
    <BarraOpciones />
    <PatenteAdmin />
    <RegistroEmprendedor v-if="MostrarRegistroEmpre" @cerrar="MostrarRegistroEmpre=false"  @MostrarRegistro="MostrarRegistro"/>
    <RegistroDisenador v-if="MostrarRegistroDise" @cerrar="MostrarRegistroDise=false" @MostrarRegistro="MostrarRegistro"/>
    <RegistroMarketing v-if="MostrarRegistroMar" @cerrar="MostrarRegistroMar=false" @MostrarRegistro="MostrarRegistro"/>
    <InicioSesion v-if="MostrarInicioSes" @cerrar="MostrarInicioSes=false"/>
    <CrearContrasena v-if="MostrarClave" @cerrar="MostrarClave=false"/>

  </div>
</template>

<script>
import BarraOpciones from "./components/BarraOpciones.vue";
import BotonesRegistro from "./components/BotonesRegistro.vue";
import CarruselImagenes from "./components/CarruselImagenes.vue";
import ImagenCentral from "./components/ImagenCentral.vue";
import LogrosUsuarios from "./components/LogrosUsuarios.vue";
import PatenteAdmin from "./components/PatenteAdmin.vue";
import TextoMotivador from "./components/TextoMotivador.vue";
import TituloInicial from "./components/TituloInicial.vue";
import RegistroDisenador from "./components/RegistroDisenador.vue";
import RegistroMarketing from "./components/RegistroMarketing.vue";
import RegistroEmprendedor from "./components/RegistroEmprendedor.vue";
import InicioSesion from "./components/InicioSesion.vue";
import CrearContrasena from "./components/CrearContrasena.vue";

export default {
  name: "App",

  data() {
    return {
      MostrarRegistroEmpre: false,
      MostrarRegistroDise: false,
      MostrarRegistroMar: false,
      MostrarInicioSes: false,
      MostrarClave: false,
    };
  },

  methods: {
    MostrarRegistro(Tipo) {
      if (Tipo == 'Emprendedor') {
        this.MostrarRegistroEmpre = true
          this.MostrarRegistroDise = false
          this.MostrarRegistroMar = false
          this.MostrarInicioSes = false
          this.MostrarClave = false
      }

      else if (Tipo == 'Diseñador'){

         this.MostrarRegistroEmpre = false
          this.MostrarRegistroDise = true
          this.MostrarRegistroMar = false
          this.MostrarInicioSes = false
          this.MostrarClave = false

      }

      else if (Tipo == 'Clave'){

        this.MostrarRegistroEmpre = false
          this.MostrarRegistroDise = false
          this.MostrarRegistroMar = false
          this.MostrarInicioSes = false
          this.MostrarClave = true

      }

      else if (Tipo == 'Iniciar'){

        this.MostrarRegistroEmpre = false
          this.MostrarRegistroDise = false
          this.MostrarRegistroMar = false
          this.MostrarInicioSes = true
          this.MostrarClave = false

      }

      else{

         this.MostrarRegistroEmpre = false
          this.MostrarRegistroDise = false
          this.MostrarRegistroMar = true
          this.MostrarInicioSes = false
          this.MostrarClave = false

      }

      

    },

  },

  components: {
    PatenteAdmin,
    BarraOpciones,
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
    CrearContrasena
  },
};
</script>

<style>
html,
body {
  display: flex;
  margin: 0px;
  background-color: hsla(0, 34%, 64%, 0.979);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000000;
  margin-top: 10px;
}
</style>
