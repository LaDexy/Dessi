<template>
  <div id="app">
    <h1>Hola Mundox</h1>
  <emprendedor/>
  </div>
</template>

<script>
import { createApp } from "vue";
import App from './App.vue'

createApp(App).mount('#app');
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
