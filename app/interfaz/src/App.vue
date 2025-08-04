<template>
  <div id="app">
    <router-view></router-view>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <BotonSalida v-if="!isPaginaCentral" />
  </div>
</template>

<script>

import BotonSalida
 from './components/BotonSalida.vue';

 export default {
  name: 'App',
  components: {
    BotonSalida
  },
  computed: {
    isPaginaCentral() {
      
      return this.$route.name === 'PaginaCentral';
    },
  },
};

</script>

<style>

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}


body {
  font-family: 'Arial', sans-serif; 
  color: #333; 
}
</style>
