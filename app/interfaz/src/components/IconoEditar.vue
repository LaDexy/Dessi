<template>
  <!--ESTA ES LA PARTE DEL ICONO QUE PERMITE EDITAR LA FOTO DE PERFIL DEL USUARIO-->
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
.Lapiz {
  position: relative;
  top: 10%;
  left: 55%;
  display: flex;
}

.edit-icon-button {
  position: absolute;
  background-color: #ffffff;
  color: hsl(300, 29%, 78%);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 10;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.edit-icon-button:hover {
  background-color: #763879;
  transform: scale(1.05);
}

.edit-icon-button i {
  font-size: 0.9em;
}
</style>