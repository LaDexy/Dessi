<template>
  <div class="crear-desafio-container p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="form-card bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Crear Nuevo Desafío</h2>
      <form @submit.prevent="crearDesafio">
        <div class="mb-4">
          <label for="nombre_desafio" class="block text-gray-700 text-sm font-semibold mb-2">Nombre del Desafío:</label>
          <input
            type="text"
            id="nombre_desafio"
            v-model="desafio.nombre_desafio"
            class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div class="mb-4">
          <label for="descripcion_desafio" class="block text-gray-700 text-sm font-semibold mb-2">Descripción:</label>
          <textarea
            id="descripcion_desafio"
            v-model="desafio.descripcion_desafio"
            rows="4"
            class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          ></textarea>
        </div>

        <div class="mb-4">
          <label for="beneficios" class="block text-gray-700 text-sm font-semibold mb-2">Beneficios:</label>
          <textarea
            id="beneficios"
            v-model="desafio.beneficios"
            rows="3"
            class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          ></textarea>
        </div>

        <div class="mb-6">
          <label for="duracion_dias" class="block text-gray-700 text-sm font-semibold mb-2">Duración (días):</label>
          <input
            type="number"
            id="duracion_dias"
            v-model.number="desafio.duracion_dias" <!-- IMPORTANTE: .number para asegurar que sea un número -->
            class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
            min="1"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-300 ease-in-out"
          :disabled="loading"
        >
          {{ loading ? 'Creando...' : 'Crear Desafío' }}
        </button>

        <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>
        <p v-if="success" class="text-green-500 text-center mt-4">{{ success }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CreaDesafio',
  data() {
    return {
      desafio: {
        nombre_desafio: '',
        descripcion_desafio: '',
        beneficios: '',
        duracion_dias: null, // Inicializar como null o 0 para un campo numérico
      },
      loading: false,
      error: null,
      success: null,
    };
  },
  methods: {
    async crearDesafio() {
      this.loading = true;
      this.error = null;
      this.success = null;

      // Obtener el token del localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        this.error = 'No autenticado. Por favor, inicia sesión.';
        this.loading = false;
        return;
      }

      // Validar que duracion_dias sea un número y mayor que 0
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
        this.success = response.data.message;
        console.log('Desafío creado exitosamente:', response.data);
        // Opcional: limpiar el formulario o redirigir
        this.desafio = {
          nombre_desafio: '',
          descripcion_desafio: '',
          beneficios: '',
          duracion_dias: null,
        };
      } catch (err) {
        console.error('Error al crear el desafío:', err);
        if (err.response) {
          // El servidor respondió con un estado de error (ej. 400, 403, 500)
          this.error = err.response.data.message || 'Error al crear el desafío.';
        } else if (err.request) {
          // La solicitud fue hecha pero no se recibió respuesta (ej. red caída)
          this.error = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.';
        } else {
          // Algo más causó el error
          this.error = 'Ocurrió un error inesperado.';
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style>
.TodoDesafio {
  position: absolute;
  left: 500px;
  top: 50px;
  padding: 40px;
  font-family: "Times New Roman", serif;
}

.wrapper {
  position: relative;
  width: 450px;
  height: 645px;
  background: white;
  border: 5px solid rgba(0, 0, 0, 0.5);
  border-radius: 100px;
  backdrop-filter: blur(20px);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  opacity: 0.9;
}

.wrapper .form-box {
  width: 100%;
  padding: 40px;
}

.wrapper .icon-close {
  position: absolute;
  top: 18px;
  right: 28px;
  width: 45px;
  height: 45px;
  font-size: 2em;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom-left-radius: 100px;
  cursor: pointer;
}

.form-box h2 {
  font-size: 3em;
  color: #000000;
  text-align: center;
}

.input-box {
  position: relative;
  width: 100%;
  height: 50px;
  border-bottom: 2px solid #000000;
  margin: 30px 0;
}

.input-box label {
  position: absolute;
  top: 50%;
  left: 5px;
  transform: translateY(-50%);
  font-size: 1.3em;
  color: #000000;
  font-weight: 500;
  pointer-events: none;
  transition: 0.5s;
}

.input-box input:focus ~ label,
.input-box input:valid ~ label {
  top: -5px;
}

.input-box input {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1.5em;
  color: #000000;
  font-weight: 600;
  padding: 0 35px 0 5px;
}

.remember-forgot {
  font-size: 1em;
  color: #000000;
  font-weight: 500;
  margin: -15px 0 15px;
  display: flex;
  justify-content: space-between;
}

.remember-forgot label input {
  accent-color: #861c78;
  margin-right: 3px;
}

.remember-forgot a {
  color: #7598b3;
  text-decoration: none;
}

.remember-forgot a:hover {
  text-decoration: underline;
}

.CrearDesafio {
  width: 100%;
  height: 45px;
  background: #440857;
  border: none;
  outline: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  color: #fff;
  font-weight: 500;
}

.duracion-input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  width: 100px;
  text-align: right;
}
</style>
