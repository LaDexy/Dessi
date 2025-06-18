<template>
  <PruebaDos/>
</template>

<script>
import PruebaDos from './components/PruebaDos.vue';

export default {
  name: 'App', 
    components: {

    PruebaDos
    }
}
</script>

<style>
html,
body {
  display: flex;
  margin: 0px;
  background-color: hsl(0, 0%, 100%);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000000;
  margin-top: 10px;
}



</style>
