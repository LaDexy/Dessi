<template>
  <div class="chat-icon" @click="$emit('click')">
   <i class="fa-solid fa-comments" style="color: #B197FC;"></i>
    <span v-if="hasNewRequests" class="notification-badge"></span>
  </div>
</template>

<script>

export default {
  name: 'IconoChat',
  components: {
   
  },
  props: {
    hasNewRequests: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style>
.chat-icon {
  width: 60px;
  height: 60px;
  background-color: #a4b8dd; /* Color azul claro */
  border-radius: 50%; /* Forma circular */
  display: flex;
  justify-content: center;
  align-items: center;
  color: white; /* Color del icono */
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease-in-out;
  position: relative; /* Necesario para posicionar el badge */
}

.chat-icon:hover {
  transform: scale(1.1);
}

.notification-badge {
  position: absolute;
  top: 5px; /* Ajusta la posición vertical */
  right: 5px; /* Ajusta la posición horizontal */
  width: 15px;
  height: 15px;
  background-color: #ff4d4f; /* Rojo para la notificación */
  border-radius: 50%;
  border: 2px solid white; /* Borde blanco para mayor visibilidad */
}
</style>