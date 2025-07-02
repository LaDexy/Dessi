<template>
  <div>
    <!--Componentes de pagina central-->

   <BarraPerfil/>
    <OpcionPerfil/>
    <ContenidoMenu/>
    <BarraBusqueda/>
    <BotonesFiltro/>
    <ImagenPerfil/>

  </div>
</template>

<script>

/*Importacion de componentes de pagina central*/

import BarraPerfil from './components/BarraPerfil.vue';
import OpcionPerfil from './components/OpcionPerfil.vue';
import ContenidoMenu from './components/ContenidoMenu.vue';
import BarraBusqueda from './components/BarraBusqueda.vue';
import BotonesFiltro from './components/BotonesFiltro.vue';
import ImagenPerfil from './components/ImagenPerfil.vue';

export default{

    name: "PaginaCentral",

    components: {

    BarraPerfil,
    OpcionPerfil,
    ContenidoMenu,
    BarraBusqueda,
    BotonesFiltro,
    TarjetasPerfiles,
    ImagenPerfil
  }

}



</script>

<style></style>