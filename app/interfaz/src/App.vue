<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  // No necesitas importar tus páginas aquí, el router las manejará.
};
</script>

<style>
html,
body {
  display: flex;
  margin: 0px;
  background-color: hsla(0, 0%, 100%, 0.979);
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
