<template>
  <div>
    <!--Componentes de pagina de perfil-->

    <ForoUsuarios/>
    <IconoReaccion/>

  </div>
</template>

<script>

/*Importacion de componentes de pagina de perfil*/
import ForoUsuarios from '@/components/ForoUsuarios.vue';
import IconoReaccion from '@/components/IconoReaccion.vue';

export default{

    name: "PaginaForo",

    components: {

        ForoUsuarios,
        IconoReaccion
    
  }

}



</script>

<style></style>