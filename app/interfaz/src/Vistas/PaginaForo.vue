<template>
  <div>

     <!--RENDERIZAR PARA ADAPTACION A NAVEGADOR-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <ContenidoMenu/>
    <ForoUsuarios/>
  

  </div>
</template>

<script>


import ForoUsuarios from '@/components/ForoUsuarios.vue';
import ContenidoMenu from '@/components/ContenidoMenu.vue';

export default{

    name: "PaginaForo",

    components: {

        ForoUsuarios,
        ContenidoMenu,      
    
  }

}



</script>

<style></style>