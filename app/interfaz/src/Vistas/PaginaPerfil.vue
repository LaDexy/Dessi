<template>
  <div>
    <!--Componentes de pagina de perfil-->
    
    <BarraPerfil/>
    <ImagenPerfil/>
    <TipoPerfil/>

  </div>
</template>

<script>

/*Importacion de componentes de pagina de perfil*/
import BarraPerfil from '@/components/BarraPerfil.vue';
import ImagenPerfil from '@/components/ImagenPerfil.vue';
import TipoPerfil from '@/components/TipoPerfil.vue';

export default{

    name: "PaginaPerfil",

    components: {

        BarraPerfil,
        ImagenPerfil,
        TipoPerfil
    
  }

}



</script>

<style></style>