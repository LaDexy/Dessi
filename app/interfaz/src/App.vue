<template>
  <InicialPag/>
</template>

<script>
import InicialPag from './components/InicialPag.vue';

export default {
  name: 'App', 
    components: {
    InicialPag
    }
}
</script>

<style>
html,
body {
  display: flex;
  margin: 0px;
  background-color: #000000;
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
