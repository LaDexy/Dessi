<template>
  <div>
    <!-- MODIFICACION: Usamos v-if para mostrar solo si el perfil es Diseñador o Marketing -->
    <div class="Portafolio" v-if="userProfile === 'Diseñador' || userProfile === 'Marketing'">
      <i class="fa-solid fa-folder fa-2xl"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: "IconoPortafolio",
  props: {
    userProfile: {
      type: String,
      required: true
    }
  }
};
</script>

<style>

.Portafolio{

    position: absolute;
    top: 587px;
    left: 370px;

}

</style>