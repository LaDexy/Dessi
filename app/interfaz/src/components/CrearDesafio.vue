<template>
  <div class="TodoDesafio">
    <!-- Este es el modal overlay que cubre toda la pantalla -->
    <div class="modal-overlay" @click.self="cerrarModal">
      <!-- Este es el contenido principal del modal -->
      <div class="modal-content">
        <!-- Botón de cerrar el modal -->
        <span class="close-button" @click="cerrarModal">&times;</span>
        
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Crear Nuevo Desafío</h2>
        
        <form @submit.prevent="crearDesafio">
          <!-- Campo: Nombre del Desafío -->
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

          <!-- Campo: Descripción -->
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

          <!-- Campo: Beneficios -->
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

          <!-- Campo: Duración (días) -->
          <div class="mb-6">
            <label for="duracion_dias" class="block text-gray-700 text-sm font-semibold mb-2">Duración (días):</label>
            <input
              type="number"
              id="duracion_dias"
              v-model.number="desafio.duracion_dias" 
              class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              min="1"
            />
          </div>

          <!-- Botón de Crear Desafío -->
          <button
            type="submit"
            class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-300 ease-in-out"
            :disabled="loading"
          >
            {{ loading ? 'Creando...' : 'Crear Desafío' }}
          </button>

          <!-- Mensajes de error/éxito -->
          <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>
          <p v-if="success" class="text-green-500 text-center mt-4">{{ success }}</p>
        </form>

        <!-- Mensaje de desafíos gratuitos restantes -->
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
  name: 'CrearDesafio', // Nombre del componente
  props: {
    userId: { // Propiedad para el ID del usuario, aunque el token ya lo tiene
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
        duracion_dias: null, // Inicializado como null
      },
      loading: false, // Estado de carga para el botón
      error: null,    // Mensaje de error
      success: null,  // Mensaje de éxito
      showMessage: false, // Controla la visibilidad del mensaje de desafíos restantes
      desafiosRestantesGratuitos: null, // Almacena el número de desafíos restantes
    };
  },
  methods: {
    // Emite un evento para cerrar el modal
    cerrarModal() {
      this.$emit('cerrar');
      this.showMessage = false; // Ocultar mensaje al cerrar el modal
      // Limpiar el formulario al cerrar para que esté listo para la próxima vez
      this.desafio = {
        nombre_desafio: '',
        descripcion_desafio: '',
        beneficios: '',
        duracion_dias: null,
      };
    },
    // Lógica para crear el desafío
    async crearDesafio() {
      this.loading = true;
      this.error = null;
      this.success = null;
      this.showMessage = false; // Ocultar el mensaje anterior al intentar crear uno nuevo

      // Obtener el token de autenticación
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        this.error = 'No autenticado. Por favor, inicia sesión.';
        this.loading = false;
        // Opcional: Redirigir al login si no hay token
        // this.$router.push({ name: 'Principal' }); 
        return;
      }

      // Validar que la duración sea un número positivo
      if (typeof this.desafio.duracion_dias !== 'number' || this.desafio.duracion_dias <= 0) {
        this.error = 'La duración del desafío debe ser un número positivo de días.';
        this.loading = false;
        return;
      }

      try {
        console.log('Enviando datos para crear desafío:', this.desafio);
        // Realiza la solicitud POST al backend
        const response = await axios.post('http://localhost:4000/api/challenges', this.desafio, {
          headers: {
            Authorization: `Bearer ${token}`, // Envía el token en la cabecera
          },
        });

        // Si la solicitud es exitosa (código 201 Created)
        if (response.status === 201) {
          this.success = response.data.message;
          console.log('Desafío creado exitosamente:', response.data);
          
          // Actualizar y mostrar el mensaje de desafíos restantes
          // Solo mostrar si el backend devuelve este dato
          if (response.data.desafios_restantes_gratuitos !== undefined) {
            this.desafiosRestantesGratuitos = response.data.desafios_restantes_gratuitos;
            this.showMessage = true; // Mostrar el mensaje
          } else {
            // Si por alguna razón el backend no lo envía, puedes poner un valor por defecto o no mostrarlo
            this.desafiosRestantesGratuitos = -1; // Valor para "desafío creado, pero no hay info de restantes"
            this.showMessage = true;
          }

          // Emite un evento para que el componente padre sepa que un desafío fue creado
          this.$emit('challengeCreated'); 
          
          // Limpia el formulario inmediatamente, el mensaje se mostrará por el v-if
          this.desafio = {
            nombre_desafio: '',
            descripcion_desafio: '',
            beneficios: '',
            duracion_dias: null,
          };

          // Opcional: Cierra el modal después de un breve retraso para que el usuario vea el mensaje de éxito y el aviso
          setTimeout(() => {
            this.cerrarModal();
          }, 3000); // 3 segundos para que el usuario lea el mensaje
        } else {
          // Maneja otras respuestas exitosas pero inesperadas
          this.error = response.data.message || 'Error desconocido al crear el desafío.';
        }
      } catch (err) {
        console.error('Error al crear el desafío:', err);
        if (err.response) {
          // El servidor respondió con un estado de error
          this.error = err.response.data.message || 'Error al crear el desafío.';
          if (err.response.status === 403) {
            this.error = 'Tu sesión ha expirado o no tienes permiso para crear desafíos.';
            // Opcional: Redirigir al login
            // this.$router.push({ name: 'Principal' });
          } else if (err.response.status === 409) { // Conflicto: ya tiene un desafío activo
            this.error = err.response.data.message;
          } else if (err.response.status === 402) { // Pago requerido
            this.error = err.response.data.message;
          }
        } else if (err.request) {
          // La solicitud fue hecha pero no se recibió respuesta
          this.error = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.';
        } else {
          // Algo más causó el error
          this.error = 'Ocurrió un error inesperado.';
        }
      } finally {
        this.loading = false; // Siempre desactiva el estado de carga
      }
    },
  },
};
</script>

<style scoped>
/* Colores de referencia:
   - hsl(300, 29%, 78%) se traduce aproximadamente a #d9bad9 (Rosa-morado pastel)
   - #5e1c7d (Morado oscuro)
*/

/* El contenedor principal del componente, que ahora actúa como el overlay del modal */
.TodoDesafio {
  position: fixed; /* Fijo en la ventana de visualización */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* Fondo oscuro semitransparente */
  display: flex; /* Usa flexbox para centrar el contenido del modal */
  justify-content: center; /* Centra horizontalmente */
  align-items: center; /* Centra verticalmente */
  z-index: 1000; /* Asegura que el modal esté por encima de otros elementos */
  backdrop-filter: blur(5px); /* Un ligero desenfoque del fondo */
  /* La animación de entrada se aplicará al modal-content */
}

/* Contenido principal del modal (equivalente a .wrapper y .form-box combinados de tu guía) */
.modal-content {
  background-color: #ffffff; /* Fondo blanco puro para el contenido del modal */
  padding: 40px; /* Padding generoso */
  border-radius: 15px; /* Bordes redondeados para un aspecto suave */
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25); /* Sombra profunda y suave */
  max-width: 550px; /* Ancho máximo para el modal, ajustado para formularios */
  width: 90%; /* Ancho responsivo */
  max-height: 90vh; /* Altura máxima del modal, 90% del viewport height */
  overflow-y: auto; /* Permite scroll vertical si el contenido excede la altura máxima */
  position: relative; /* Necesario para posicionar el botón de cierre */
  animation: fadeInScale 0.3s ease-out forwards; /* Animación de entrada */
  font-family: 'Inter', sans-serif; /* Usando una fuente moderna y limpia */
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

/* Botón de cerrar el modal */
.close-button {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 2.2em; /* Icono de cierre más grande */
  color: #a30000; /* Un rojo oscuro para el botón de cerrar */
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
}

.close-button:hover {
  color: #7a0000; /* Rojo más oscuro al pasar el ratón */
  transform: rotate(90deg); /* Gira al pasar el ratón */
}

/* Título del formulario dentro del modal */
.modal-content h2 {
  font-size: 2.2em; /* Tamaño de fuente para el título */
  color: #5e1c7d; /* Morado oscuro para el título */
  text-align: center;
  margin-bottom: 30px; /* Espacio debajo del título */
  font-weight: bold;
}

/* Estilos para los contenedores de campo (mb-4, mb-6) */
.mb-4 {
  margin-bottom: 20px; /* Espacio consistente entre campos */
}

.mb-6 {
  margin-bottom: 30px; /* Más espacio para el último campo antes del botón */
}

/* Estilos para las etiquetas de los campos */
label {
  display: block;
  color: #5e1c7d; /* Morado oscuro para las etiquetas */
  font-size: 0.95em; /* Tamaño de fuente ligeramente ajustado */
  font-weight: 600; /* Seminegrita */
  margin-bottom: 8px; /* Espacio debajo de la etiqueta */
}

/* Estilos para los inputs y textareas */
input[type="text"],
input[type="number"],
textarea {
  width: 100%;
  padding: 12px 15px; /* Más padding para mejor tacto */
  border: 1px solid #e0e0e0; /* Borde muy suave */
  border-radius: 8px; /* Bordes redondeados */
  font-size: 1em;
  color: #333;
  background-color: #fcfcfc; /* Fondo casi blanco para los campos */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box; /* Asegura que el padding no aumente el ancho total */
}

input[type="text"]:focus,
input[type="number"]:focus,
textarea:focus {
  outline: none;
  border-color: #d9bad9; /* Borde pastel al enfocar */
  box-shadow: 0 0 0 3px hsla(300, 29%, 78%, 0.5); /* Sombra de enfoque pastel */
}

/* Botón de Crear Desafío */
button[type="submit"] {
  width: 100%;
  background-color: #5e1c7d; /* Morado oscuro para el botón principal */
  color: white;
  padding: 14px 20px; /* Más padding para un botón más robusto */
  border: none;
  border-radius: 25px; /* Bordes muy redondeados (pastilla) */
  font-size: 1.15em; /* Texto del botón más grande */
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15); /* Sombra para el botón */
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #4a148c; /* Morado más oscuro al pasar el ratón */
  transform: translateY(-3px); /* Efecto de levantamiento más pronunciado */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

button[type="submit"]:disabled {
  background-color: #a0a0a0; /* Gris para estado deshabilitado */
  cursor: not-allowed;
  box-shadow: none;
}

/* Mensajes de error/éxito */
p.text-red-500 {
  color: #ef5350; /* Rojo suave para errores */
  background-color: #ffebee; /* Fondo muy claro para errores */
  padding: 12px;
  border-radius: 8px;
  margin-top: 25px; /* Más espacio */
  font-size: 0.95em;
  border: 1px solid #ef9a9a;
  text-align: center; /* Centrar el texto */
}

p.text-green-500 {
  color: #8bc34a; /* Verde suave para éxito */
  background-color: #e8f5e9; /* Fondo muy claro para éxito */
  padding: 12px;
  border-radius: 8px;
  margin-top: 25px; /* Más espacio */
  font-size: 0.95em;
  border: 1px solid #a5d6a7;
  text-align: center; /* Centrar el texto */
}

/* Mensaje de desafíos restantes */
.challenge-limit-message {
  background-color: #f2e6f2; /* Rosa-morado pastel muy suave */
  color: #5e1c7d; /* Morado oscuro para el texto */
  padding: 18px; /* Más padding */
  border-radius: 10px;
  margin-top: 30px; /* Más espacio superior */
  text-align: center;
  font-size: 1em; /* Un poco más grande */
  line-height: 1.5;
  border: 1px solid #d9bad9;
}

/* Las clases de Tailwind como text-2xl, font-bold, text-center, text-gray-800, etc.
   en el template serán sobrescritas por estas reglas CSS más específicas.
   Si deseas eliminar completamente Tailwind, deberías quitar esas clases del template. */
</style>