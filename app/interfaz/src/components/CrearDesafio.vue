<template>
  <div class="todo-desafio-container">

    <!--ESTA ES LA PARTE DE LA VENTANA EMERGENTE PARA CREAR UN NUEVO DESAFIO-->
    <div class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-content">
        <span class="close-button" @click="cerrarModal">&times;</span>

        <h2 class="modal-heading">Crear Nuevo Desafío</h2>

        <form @submit.prevent="crearDesafio">
          <div class="form-group">
            <label for="nombre_desafio" class="form-label">Nombre del Desafío:</label>
            <input
              type="text"
              id="nombre_desafio"
              v-model="desafio.nombre_desafio"
              class="form-field"
              required
            />
          </div>

          <div class="form-group">
            <label for="descripcion_desafio" class="form-label">Descripción:</label>
            <textarea
              id="descripcion_desafio"
              v-model="desafio.descripcion_desafio"
              rows="4"
              class="form-field"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="beneficios" class="form-label">Beneficios:</label>
            <textarea
              id="beneficios"
              v-model="desafio.beneficios"
              rows="3"
              class="form-field"
              required
            ></textarea>
          </div>

          <div class="form-group-last">
            <label for="duracion_dias" class="form-label">Duración (días):</label>
            <input
              type="number"
              id="duracion_dias"
              v-model.number="desafio.duracion_dias"
              class="form-field"
              required
              min="1"
            />
          </div>

          <button
            type="submit"
            class="submit-button"
            :disabled="loading"
          >
            {{ loading ? 'Creando...' : 'Crear Desafío' }}
          </button>

          <p v-if="error" class="error-text">{{ error }}</p>
          <p v-if="success" class="success-text">{{ success }}</p>
        </form>

        <div v-if="showMessage" class="challenge-limit-message">
          <p v-if="desafiosRestantesGratuitos > 0">
            ¡Felicidades! Has creado tu desafío. Te quedan {{ desafiosRestantesGratuitos }} desafíos gratuitos antes de que se requiera un pago.
          </p>
          <p v-else-if="desafiosRestantesGratuitos === 0">
            Has utilizado todos tus desafíos gratuitos. El próximo desafío requerirá un pago.
          </p>
          <p v-else-if="desafiosRestantesGratuitos < 0">
            Has creado un desafío.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CrearDesafio',
  props: {
    userId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      desafio: {
        nombre_desafio: '',
        descripcion_desafio: '',
        beneficios: '',
        duracion_dias: null,
      },
      loading: false,
      error: null,
      success: null,
      showMessage: false,
      desafiosRestantesGratuitos: null,
    };
  },
  methods: {
    cerrarModal() {
      this.$emit('cerrar');
      this.showMessage = false;
      this.desafio = {
        nombre_desafio: '',
        descripcion_desafio: '',
        beneficios: '',
        duracion_dias: null,
      };
    },
    async crearDesafio() {
      this.loading = true;
      this.error = null;
      this.success = null;
      this.showMessage = false;

      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        this.error = 'No autenticado. Por favor, inicia sesión.';
        this.loading = false;
        return;
      }

      if (typeof this.desafio.duracion_dias !== 'number' || this.desafio.duracion_dias <= 0) {
        this.error = 'La duración del desafío debe ser un número positivo de días.';
        this.loading = false;
        return;
      }

      try {
        console.log('Enviando datos para crear desafío:', this.desafio);
        const response = await axios.post('http://localhost:4000/api/challenges', this.desafio, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 201) {
          this.success = response.data.message;
          console.log('Desafío creado exitosamente:', response.data);

          if (response.data.desafios_restantes_gratuitos !== undefined) {
            this.desafiosRestantesGratuitos = response.data.desafios_restantes_gratuitos;
            this.showMessage = true;
          } else {
            this.desafiosRestantesGratuitos = -1;
            this.showMessage = true;
          }

          this.$emit('challengeCreated');

          this.desafio = {
            nombre_desafio: '',
            descripcion_desafio: '',
            beneficios: '',
            duracion_dias: null,
          };

          setTimeout(() => {
            this.cerrarModal();
          }, 3000);
        } else {
          this.error = response.data.message || 'Error desconocido al crear el desafío.';
        }
      } catch (err) {
        console.error('Error al crear el desafío:', err);
        if (err.response) {
          this.error = err.response.data.message || 'Error al crear el desafío.';
          if (err.response.status === 403) {
            this.error = 'Tu sesión ha expirado o no tienes permiso para crear desafíos.';
          } else if (err.response.status === 409) {
            this.error = err.response.data.message;
          } else if (err.response.status === 402) {
            this.error = err.response.data.message;
          }
        } else if (err.request) {
          this.error = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.';
        } else {
          this.error = 'Ocurrió un error inesperado.';
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Contenedor principal del modal overlay */
.todo-desafio-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

/* Contenido principal del modal */
.modal-content {
  background-color: #ffffff;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
  max-width: 550px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: fadeInScale 0.3s ease-out forwards;
  font-family: 'Inter', sans-serif;
}

/* Animación de entrada para el modal */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Título del modal */
.modal-heading {
  font-size: 2.2em; /* Equivalent to text-2xl */
  font-weight: bold; /* Equivalent to font-bold */
  text-align: center; /* Equivalent to text-center */
  color: #333; /* Equivalent to text-gray-800 */
  margin-bottom: 30px; /* Equivalent to mb-6 */
}

/* Botón de cerrar el modal */
.close-button {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 2.2em;
  color: #a30000;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
}

.close-button:hover {
  color: #7a0000;
  transform: rotate(90deg);
}

/* Estilos generales para los grupos de formulario */
.form-group {
  margin-bottom: 20px; /* Equivalent to mb-4 */
}

/* Estilo para el último grupo de formulario para ajustar el margen */
.form-group-last {
  margin-bottom: 30px; /* Equivalent to mb-6 */
}

.form-group label,
.form-group-last label {
  display: block; /* Equivalent to block */
  color: #5e1c7d; /* Equivalent to text-gray-700 */
  font-size: 0.95em; /* Close to text-sm */
  font-weight: 600; /* Equivalent to font-semibold */
  margin-bottom: 8px; /* Equivalent to mb-2 */
}

/* Estilos para los inputs de texto y número y textareas */
.form-field {
  width: 100%; /* Equivalent to w-full */
  padding: 12px 15px; /* Equivalent to py-2 px-3 */
  border: 1px solid #e0e0e0; /* Equivalent to border */
  border-radius: 8px; /* Equivalent to rounded-md */
  font-size: 1em;
  color: #333; /* Equivalent to text-gray-700 */
  background-color: #fcfcfc;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* Equivalent to shadow-sm */
  -webkit-appearance: none; /* Equivalent to appearance-none */
  appearance: none; /* Equivalent to appearance-none */
  line-height: 1.25; /* Equivalent to leading-tight */
}

.form-field:focus {
  outline: none; /* Equivalent to focus:outline-none */
  border-color: #d9bad9; /* Equivalent to focus:border-transparent (or a specific color) */
  box-shadow: 0 0 0 3px hsla(300, 29%, 78%, 0.5); /* Equivalent to focus:ring-2 focus:ring-purple-500 */
}

/* Botón de crear desafío */
.submit-button {
  width: 100%; /* Equivalent to w-full */
  background-color: #5e1c7d; /* Equivalent to bg-purple-600 */
  color: white; /* Equivalent to text-white */
  padding: 14px 20px; /* Equivalent to py-2 px-4 */
  border: none;
  border-radius: 25px; /* Equivalent to rounded-md, but more rounded here */
  font-size: 1.15em;
  font-weight: bold; /* Equivalent to font-bold */
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease; /* Equivalent to transition duration-300 ease-in-out */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.submit-button:hover:not(:disabled) {
  background-color: #4a148c; /* Equivalent to hover:bg-purple-700 */
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.submit-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
  box-shadow: none;
}

/* Mensajes de error */
.error-text {
  color: #ef5350; /* Equivalent to text-red-500 */
  text-align: center; /* Equivalent to text-center */
  margin-top: 25px; /* Equivalent to mt-4 */
  background-color: #ffebee;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.95em;
  border: 1px solid #ef9a9a;
}

/* Mensajes de éxito */
.success-text {
  color: #8bc34a; /* Equivalent to text-green-500 */
  text-align: center; /* Equivalent to text-center */
  margin-top: 25px; /* Equivalent to mt-4 */
  background-color: #e8f5e9;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.95em;
  border: 1px solid #a5d6a7;
}

/* Mensaje de desafíos restantes */
.challenge-limit-message {
  background-color: #f2e6f2;
  color: #5e1c7d;
  padding: 18px;
  border-radius: 10px;
  margin-top: 30px;
  text-align: center;
  font-size: 1em;
  line-height: 1.5;
  border: 1px solid #d9bad9;
}
</style>