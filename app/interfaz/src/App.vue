<template>
  <div id="app">
    <router-view></router-view>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </div>
</template>

<script>
export default {
  name: 'App',
  // No necesitas importar tus páginas aquí, el router las manejará.
};
</script>

<style>
/* Restablecimiento global para eliminar márgenes y paddings por defecto */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%; /* Asegura que el body ocupe toda la altura también */
  overflow-x: hidden; /* Evita barras de desplazamiento horizontales si algo se desborda accidentalmente */
}

/* Opcional: Un estilo de fuente base para toda la aplicación */
body {
  font-family: 'Arial', sans-serif; /* O la fuente que prefieras */
  color: #333; /* Color de texto por defecto */
}
</style>
