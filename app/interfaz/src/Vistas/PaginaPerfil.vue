<template>
  <div>
    <!--Componentes de pagina de perfil-->
    
    <BarraPerfil/>
    <BotonesDesafios/>
    <ImagenPerfil/>
    <TipoPerfil/>
    <PortafolioPerfil/>
    

  </div>
</template>

<script>

/*Importacion de componentes de pagina de perfil*/
import BarraPerfil from '@/components/BarraPerfil.vue';
import ImagenPerfil from '@/components/ImagenPerfil.vue';
import TipoPerfil from '@/components/TipoPerfil.vue';
import PortafolioPerfil from '@/components/PortafolioPerfil.vue';
import BotonesDesafios from '@/components/BotonesDesafios.vue';

export default{

    name: "PaginaPerfil",

    components: {

        BarraPerfil,
        ImagenPerfil,
        TipoPerfil,
        PortafolioPerfil,
        BotonesDesafios
    
  }

}



</script>

<style></style>