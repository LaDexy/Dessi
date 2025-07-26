<template>

  <!--ESTA E SLA PARTE DE PRESENTACION DE LAS TARJETAS DE LOS PERFILES EN PAGINA CENTRAL-->
  <div class="TarjetasPerfiles">
    <div class="TarjetasPerfiles-container">
      <div class="TarjetasPerfiles-grid">
        <TarjetasIndividuales
          v-for="profile in profiles"
          :key="profile.id_usuario"
          :profile="profile"
          @send-request="$emit('send-request', profile)"
          @view-profile="$emit('view-profile', profile)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TarjetasIndividuales from './TarjetasIndividuales.vue';

export default {
  name: "TarjetasPerfiles",
  components: {
    TarjetasIndividuales
  },
  props: {
    profiles: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
};
</script>

<style scoped>
.TarjetasPerfiles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  margin-top: 100px;
}

.TarjetasPerfiles-container {
  width: 100%;
  max-width: 1200px;
}

.TarjetasPerfiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
</style>