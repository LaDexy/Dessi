<template>
  <div>

     <!--RENDERIZAR PARA ADAPTACION A NAVEGADOR-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <ForoUsuarios/>
  

  </div>
</template>

<script>


import ForoUsuarios from '@/components/ForoUsuarios.vue';
export default{

    name: "PaginaForo",

    components: {

        ForoUsuarios,
      
    
  }

}



</script>

<style></style>