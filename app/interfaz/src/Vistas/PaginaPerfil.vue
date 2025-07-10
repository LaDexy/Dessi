<template>
  <div>
    <!--Componentes de pagina de perfil-->
    
    <BarraPerfil/>
    <BotonesDesafios @MostrarRegistro="MostrarRegistro"/>
    <ImagenPerfil/>
    <TipoPerfil/>
    <PortafolioPerfil/>
   <CrearDesafio  
   v-if="CrearDesafioNuevo"
      @cerrar="CrearDesafioNuevo = false"
      @MostrarRegistro="MostrarRegistro"/>
    <VerDesafio
     v-if="VerDesafiosCreados"
      @cerrar="VerDesafiosCreados = false"
      @MostrarRegistro="MostrarRegistro"/>

  </div>
</template>

<script>

/*Importacion de componentes de pagina de perfil*/
import BarraPerfil from '../components/BarraPerfil.vue';
import ImagenPerfil from '../components/ImagenPerfil.vue';
import TipoPerfil from '../components/TipoPerfil.vue';
import PortafolioPerfil from '../components/PortafolioPerfil.vue';
import BotonesDesafios from '../components/BotonesDesafios.vue';
import CrearDesafio from '@/components/CrearDesafio.vue';
import VerDesafio from '@/components/VerDesafio.vue';

export default{

    name: "PaginaPerfil",

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
        BotonesDesafios,
        CrearDesafio,
        VerDesafio
        
    
  }

}



</script>

<style></style>