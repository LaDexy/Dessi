<template>
  <div class="modal-overlay" @click.self="$emit('cerrar')">
    <div class="modal-content">
      <span class="close-button" @click="$emit('cerrar')">&times;</span>
      <div v-if="isLoading" class="loading-message">
        <p>Seleccionando ganador...</p>
      </div>
      <div v-else class="content-wrapper">
        <h2 class="modal-title">Seleccionar Ganador</h2>
        <p class="modal-subtitle">Estás a punto de seleccionar a un ganador para el desafío: <strong>"{{ nombreDesafio }}"</strong>.</p>
        <p class="modal-description">Ingresa los datos de contacto para que el ganador pueda comunicarse contigo.</p>
        
        <form @submit.prevent="seleccionarGanador">
          <div class="form-group">
            <label for="instagram">Instagram:</label>
            <input type="text" id="instagram" v-model="redes_sociales.instagram" placeholder="@tu_usuario_de_instagram" class="form-input">
          </div>
          <div class="form-group">
            <label for="linkedin">LinkedIn (URL):</label>
            <input type="url" id="linkedin" v-model="redes_sociales.linkedin" placeholder="https://linkedin.com/in/tuperfil" class="form-input">
          </div>
          <div class="form-group">
            <label for="whatsapp">WhatsApp:</label>
            <input type="tel" id="whatsapp" v-model="redes_sociales.whatsapp" placeholder="+584123456789" class="form-input">
          </div>
          
          <button type="submit" class="submit-button">Confirmar Ganador</button>
        </form>
        
        <div v-if="successMessage" class="success-message">
          <p>{{ successMessage }}</p>
        </div>
        <div v-if="errorMessage" class="error-message">
          <p>{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "ModalSeleccionarGanador",
  props: {
    idDesafio: {
      type: [Number, String],
      required: true
    },
    idPropuestaGanadora: {
      type: [Number, String],
      required: true
    },
    nombreDesafio: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      redes_sociales: {
        instagram: '',
        linkedin: '',
        whatsapp: ''
      },
      isLoading: false,
      successMessage: '',
      errorMessage: ''
    };
  },
  methods: {
    async seleccionarGanador() {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';

     
      const hasContactInfo = Object.values(this.redes_sociales).some(value => value.trim() !== '');
      if (!hasContactInfo) {
        this.errorMessage = 'Debes proporcionar al menos un medio de contacto para el ganador.';
        this.isLoading = false;
        return;
      }

      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          throw new Error('No hay token de autenticación.');
        }

        const dataToSend = {
          id_propuesta_ganadora: this.idPropuestaGanadora,
          redes_sociales_emprendedor: this.redes_sociales
        };

        const response = await axios.put(`http://localhost:4000/api/desafios/${this.idDesafio}/seleccionar-ganador`, dataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200) {
          this.successMessage = '¡Ganador seleccionado con éxito!';
          console.log(response.data.message);
          
          this.$emit('ganadorSeleccionado');
          
          setTimeout(() => {
            this.$emit('cerrar');
          }, 2000);
        } else {
          throw new Error(response.data.message || 'Error desconocido al seleccionar al ganador.');
        }

      } catch (error) {
        console.error('Error al seleccionar el ganador:', error);
        this.errorMessage = error.response?.data?.message || 'Error de conexión. Inténtalo de nuevo.';
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background-color: #ffffff;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  max-width: 550px;
  width: 90%;
  position: relative;
  animation: slideInFromTop 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  font-family: 'Inter', sans-serif;
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.close-button {
  position: absolute;
  top: 15px;
  right: 25px;
  font-size: 2.5rem;
  color: #ef4444;
  cursor: pointer;
  line-height: 1;
  transition: transform 0.2s ease, color 0.2s ease;
}

.close-button:hover {
  color: #dc2626;
  transform: rotate(90deg);
}

.modal-title {
  font-size: 2.2em;
  color: #5e1c7d;
  font-weight: 800;
  text-align: center;
  margin-bottom: 10px;
}

.modal-subtitle {
  font-size: 1.1em;
  color: #444;
  text-align: center;
  margin-bottom: 25px;
  line-height: 1.5;
}

.modal-description {
  font-size: 1em;
  color: #666;
  text-align: center;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.9em;
  color: #333;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1em;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #5e1c7d;
  box-shadow: 0 0 0 3px rgba(94, 28, 125, 0.2);
}

.submit-button {
  width: 100%;
  padding: 15px;
  background-color: #5e1c7d;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.15s ease;
  margin-top: 15px;
  box-shadow: 0 4px 15px rgba(94, 28, 125, 0.3);
}

.submit-button:hover {
  background-color: #4a1763;
  transform: translateY(-2px);
}

.loading-message {
  text-align: center;
  font-size: 1.2em;
  color: #5e1c7d;
  font-weight: 500;
  padding: 30px;
}

.success-message {
  text-align: center;
  margin-top: 20px;
  padding: 15px;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 10px;
  font-weight: 500;
}

.error-message {
  text-align: center;
  margin-top: 20px;
  padding: 15px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 10px;
  font-weight: 500;
}
</style>