<template>
  <!-- Este div es el contenedor del icono del lápiz -->
  <!-- Al hacer clic, emitirá un evento 'click' al componente padre -->
  <div class="edit-icon-button" @click="$emit('click')">
    <i class="fa-solid fa-pencil"></i>
  </div>
</template>

<script>
export default {
  name: 'IconoEditar',
  emits: ['click'] // Declara que este componente puede emitir un evento 'click'
};
</script>

<style scoped>
/* Estilos para el icono del lápiz */
.edit-icon-button {
  /* Posición absoluta: esto permite que el componente padre lo posicione */
  /* Los valores 'bottom' y 'right' serán definidos por el padre */
  position: absolute; 
  
  background-color: #0a0f18; /* Color de fondo del lápiz */
  color: white; /* Color del icono */
  border-radius: 50%; /* Forma circular */
  width: 30px; /* Tamaño del círculo del lápiz */
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 10; /* Asegura que esté por encima de otros elementos */
  transition: background-color 0.2s ease; /* Transición suave al pasar el ratón */
}

.edit-icon-button:hover {
  background-color: #2c3e50; /* Color más oscuro al pasar el ratón */
}

.edit-icon-button i {
  font-size: 0.9em; /* Tamaño del icono del lápiz */
}
</style>
