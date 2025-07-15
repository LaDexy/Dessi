<template>
  <div>
    <!--Componentes de pagina de perfil-->
    
    <IconoEditar/>
    <BarraPerfil/>
    <ImagenPerfil/>
    <TipoPerfil/>
    <PortafolioPerfil/>

  </div>
</template>

<script>

/*Importacion de componentes de pagina de perfil*/
import BarraPerfil from '../components/BarraPerfil.vue';
import ImagenPerfil from '../components/ImagenPerfil.vue';
import TipoPerfil from '../components/TipoPerfil.vue';
import PortafolioPerfil from '../components/PortafolioPerfil.vue';
import IconoEditar from '@/components/IconoEditar.vue';

export default{

    name: "PaginaPerfilDM",

    data() {
    return {
      CrearDesafioNuevo: false,
      VerDesafiosCreados: false,
    };
  },

  methods: {
    MostrarRegistro(Todo) {
      if (Todo == 'DesafiosNuevos') {
        this.CrearDesafioNuevo = true
      }

      else{

         this.CrearDesafioNuevo = false
         

      }

      if (Todo == 'DesafiosCreados'){

          this.VerDesafiosCreados = true

      }

      else{

          this.VerDesafiosCreados = false

      }

    },
  },

    components: {

        BarraPerfil,
        ImagenPerfil,
        TipoPerfil,
        PortafolioPerfil,
        IconoEditar
        
    
  }

}



</script>

<style></style>