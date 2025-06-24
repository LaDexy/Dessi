<template>
  <div>
    <TituloInicial/>
    <BotonesRegistro/>
    <TextoMotivador/>
    <CarruselImagenes/>
    <LogrosUsuarios/>
   <ImagenCentral/>
    <BarraOpciones/>
    <PatenteAdmin/>
    <PruebaRegistro/>
    <RegistroDisenador/>
    <RegistroMarketing/>
  </div>
</template>

<script>

import BarraOpciones from './components/BarraOpciones.vue';
import BotonesRegistro from './components/BotonesRegistro.vue';
import CarruselImagenes from './components/CarruselImagenes.vue';
import ImagenCentral from './components/ImagenCentral.vue';
import LogrosUsuarios from './components/LogrosUsuarios.vue';
import PatenteAdmin from './components/PatenteAdmin.vue';
import TextoMotivador from './components/TextoMotivador.vue';
import TituloInicial from './components/TituloInicial.vue';
import PruebaRegistro from './components/TituloInicial.vue';
import RegistroDisenador from './components/TituloInicial.vue';
import RegistroMarketing from './components/TituloInicial.vue';

export default {
  name: 'App', 
    components: {  
    PatenteAdmin,
    BarraOpciones,
    BotonesRegistro,
    CarruselImagenes,
    ImagenCentral,
    LogrosUsuarios,
    TextoMotivador,
    TituloInicial,
    PruebaRegistro,
    RegistroDisenador,
    RegistroMarketing

    },

    
    
}
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
