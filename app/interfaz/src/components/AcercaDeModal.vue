<template>
  <transition name="modal-fade">
    <div class="modal-overlay" v-if="show" @click.self="$emit('close')">
      <div class="modal-content">
        <button class="modal-close-button" @click="$emit('close')">&times;</button>
        
        <h3 class="modal-title">Acerca del gestor web</h3>
        
        <div class="modal-message">
          <p>
            Este es un gestor web que facilita la interacción entre emprendedores, diseñadores
            gráficos y expertos en marketing digital. Los usuarios pueden seleccionar su
            perfil según su ocupación y establecer colaboraciones estratégicas con otros
            profesionales, según sus necesidades.
          </p>
          <p>
            El proyecto se elaboró como requisito para optar por el título de Licenciatura en Computación.
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'AcercaDeModal',
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close']
};
</script>

<style scoped>

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  backdrop-filter: blur(4px);
}
.modal-content {
  background-color: white;
  padding: 2.5rem;
  border-radius: 1.25rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 90%;
  width: 500px;
  position: relative;
}
.modal-close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.875rem;
  cursor: pointer;
  color: #ef4444;
}
.modal-title {
  font-size: 1.875rem;
  font-weight: bold;
  color: hsl(300, 29%, 78%) ;
  margin-bottom: 1.5rem;
  text-align: center;
}
.modal-message {
  color: #333;
  line-height: 1.6;
  text-align: left;
}
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>