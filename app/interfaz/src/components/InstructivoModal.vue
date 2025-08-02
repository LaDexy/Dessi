<template>
  <transition name="modal-fade">
    <div class="modal-overlay" v-if="show" @click.self="$emit('close')">
      <div class="modal-content">
        <button class="modal-close-button" @click="$emit('close')">&times;</button>
        
        <h3 class="modal-title">Guía de Uso</h3>
        
        <div class="modal-message">
          <p>Para aprovechar al máximo nuestra plataforma, sigue estos sencillos pasos:</p>
          
          <h4>1. Registro e Inicio de Sesión</h4>
          <ul>
            <li>**Regístrate** seleccionando el perfil que mejor te represente: Emprendedor, Diseñador Gráfico o Experto en Marketing Digital.</li>
            <li>Crea una contraseña segura y utiliza tu correo electrónico para iniciar sesión.</li>
          </ul>

          <h4>2. Explora y Conéctate</h4>
          <ul>
            <li>Una vez que inicies sesión, podrás **buscar perfiles** de otros profesionales.</li>
            <li>Mira sus trabajos y proyectos en sus portafolios. Si te interesa, envía una **solicitud para un convenio**.</li>
            <li>Participa en **foros de discusión** para interactuar con otros usuarios y compartir ideas.</li>
          </ul>

          <h4>3. Para Emprendedores</h4>
          <ul>
            <li>Si eres un emprendedor, puedes **crear desafíos** para recibir propuestas de diseñadores o expertos en marketing.</li>
            <li>Elige la mejor propuesta y **bonifica al ganador** por su trabajo.</li>
          </ul>
        </div>
        
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'InstructivoModal',
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
  width: 600px;
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
.modal-message h4 {
  font-weight: bold;
  color: hsl(300, 29%, 78%) ; 
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>