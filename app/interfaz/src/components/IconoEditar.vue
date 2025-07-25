<template>
  <!-- Este div es el contenedor del icono del lápiz -->
 <div class="Lapiz">
  <div class="edit-icon-button" @click="$emit('click')">
    <i class="fa-solid fa-pencil"></i>
  </div>
  </div>
</template>

<script>
export default {
  name: 'IconoEditar',
  emits: ['click'] 
};
</script>

<style scoped>

.Lapiz{

position: relative;
top: 10%;
left: 55%;

}

.edit-icon-button {
  position: absolute;
  background-color: #ffffff; /* Rosa pastel de fondo */
  color:  hsl(300, 29%, 78%); /* Color vino oscuro para el icono para que contraste */
  border-radius: 50%; /* Forma circular */
  width: 30px; /* Tamaño del círculo del lápiz */
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Sombra más suave */
  z-index: 10;
  transition: background-color 0.2s ease, transform 0.2s ease; /* Añadida transición para el transform */
}

.edit-icon-button:hover {
  background-color: #763879; /* Rosa pastel un poco más oscuro al pasar el ratón */
  transform: scale(1.05); /* Ligeramente más grande al pasar el ratón para un efecto interactivo */
}

.edit-icon-button i {
  font-size: 0.9em; /* Tamaño del icono del lápiz */
}
</style>