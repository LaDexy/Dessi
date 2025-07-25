<template>
    <div class="VerDesafios">
        <div class="modal-overlay" @click.self="cerrarModal">
            <div class="modal-content">
                <span class="close-button" @click="cerrarModal">&times;</span>
                <h2>Mis Desafíos Creados</h2>

                <div v-if="challenges.length === 0 && !isLoadingChallenges" class="no-challenges-message">
                    <p>¡Aún no has creado ningún desafío!</p>
                    <p>Presiona "Crear desafío" para empezar.</p>
                </div>

                <div v-else-if="isLoadingChallenges" class="loading-message">
                    <p>Cargando desafíos...</p>
                </div>

                <div v-else class="challenges-list">
                    <div v-for="challenge in challenges" :key="challenge.id_desafio" 
                         class="challenge-card"
                         @click="emitirVerDetalle(challenge.id_desafio)"> <h3>{{ challenge.nombre_desafio }}</h3>
                        <p><strong>Descripción:</strong> {{ challenge.descripcion_desafio }}</p>
                        <p v-if="challenge.beneficios"><strong>Beneficios:</strong> {{ challenge.beneficios }}</p>
                        <p><strong>Duración:</strong> {{ challenge.dias_duracion }} días</p>
                        <p><strong>Creado el:</strong> {{ formatDate(challenge.fecha_creacion) }}</p>
                        <p><strong>Fecha Fin:</strong> {{ formatDate(challenge.fecha_fin) }}</p>
                    </div>
                </div>
            </div>
        </div>
        </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "VerDesafios",
  // Elimina 'DetalleDesafioEmprendedor' de components si estaba aquí
  // components: { DetalleDesafioEmprendedor }, 
  props: {
    userId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      challenges: [],
      isLoadingChallenges: false,
      // Elimina estas propiedades si estaban aquí:
      // showDetalleDesafioModal: false, 
      // selectedChallengeId: null,      
    };
  },
  mounted() {
    this.loadChallenges();
  },
  methods: {
    cerrarModal() {
      this.$emit('cerrar');
    },
    // NUEVO MÉTODO: Emite el evento 'verDetalle'
    emitirVerDetalle(id) {
      this.$emit('verDetalle', id); // Emitir el ID del desafío al padre (PaginaPerfil)
    },
    async loadChallenges() {
      this.isLoadingChallenges = true;
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          alert("No estás autenticado. Por favor, inicia sesión.");
          this.$router.push({ name: 'Principal' });
          return;
        }

        console.log('Cargando desafíos para el usuario:', this.userId);
        const response = await axios.get('http://localhost:4000/api/challenges/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          this.challenges = response.data;
          console.log('Desafíos cargados:', this.challenges);
        } else {
          alert('Error al cargar los desafíos: ' + (response.data.message || 'Error desconocido.'));
        }
      } catch (error) {
        console.error('Error al cargar los desafíos:', error);
        alert('Error al cargar los desafíos. Por favor, inténtalo de nuevo.');
        if (error.response && error.response.status === 403) {
          alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
          this.$router.push({ name: "Principal" });
        }
      } finally {
        this.isLoadingChallenges = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  }
}
</script>

<style scoped>
/* Colores de referencia:
   - hsl(300, 29%, 78%) se traduce aproximadamente a #d9bad9 (Rosa-morado pastel)
   - #5e1c7d (Morado oscuro)
*/

/* El contenedor principal del componente, que actúa como el overlay del modal */
.VerDesafios {
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
}

/* Contenido principal del modal */
.modal-content {
  background-color: #ffffff; /* Fondo blanco puro para el contenido del modal */
  padding: 40px; /* Padding generoso */
  border-radius: 18px; /* Bordes más redondeados para un aspecto suave */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); /* Sombra profunda y suave */
  max-width: 700px; /* Ancho máximo para el modal */
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

/* Título del modal */
.modal-content h2 {
  font-size: 2.5em; /* Tamaño de fuente para el título */
  color: #5e1c7d; /* Morado oscuro para el título */
  text-align: center;
  margin-bottom: 35px; /* Espacio debajo del título */
  font-weight: bold;
}

/* Mensajes de estado (sin desafíos, cargando) */
.no-challenges-message, .loading-message {
  text-align: center;
  padding: 30px;
  font-size: 1.2em;
  color: #5e1c7d; /* Morado oscuro para el texto */
  background-color: #f2e6f2; /* Rosa-morado pastel muy suave */
  border-radius: 12px;
  margin-top: 20px;
  line-height: 1.6;
  border: 1px solid #d9bad9;
}

.loading-message {
  color: #5e1c7d;
  background-color: #f0f8ff; /* Un azul muy claro para carga */
  border: 1px solid #cceeff;
}

/* Lista de desafíos */
.challenges-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Cuadrícula responsiva, tarjetas más grandes */
  gap: 25px; /* Más espacio entre las tarjetas */
  padding-top: 10px;
}

/* Tarjeta de desafío individual */
.challenge-card {
  background-color: #ffffff; /* Fondo blanco para las tarjetas */
  border: 1px solid #e0e0e0; /* Borde suave */
  border-radius: 15px; /* Bordes redondeados */
  padding: 25px; /* Más padding */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); /* Sombra pronunciada pero suave */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  display: flex; /* Para organizar el contenido internamente */
  flex-direction: column;
  justify-content: space-between; /* Distribuye el espacio entre los elementos */
  min-height: 220px; /* Altura mínima para las tarjetas */
}

.challenge-card:hover {
  transform: translateY(-5px); /* Efecto de levantamiento al pasar el ratón */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.challenge-card h3 {
  font-size: 1.6em; /* Título del desafío más grande */
  color: #5e1c7d; /* Morado oscuro para el título */
  margin-bottom: 15px;
  font-weight: bold;
  line-height: 1.3;
}

.challenge-card p {
  font-size: 0.95em; /* Tamaño de fuente para los detalles */
  color: #555; /* Gris oscuro para el texto */
  margin-bottom: 8px; /* Espacio entre párrafos */
  line-height: 1.5;
}

.challenge-card p strong {
  color: #5e1c7d; /* Morado oscuro para las etiquetas en negrita */
  margin-right: 5px;
}

/* Ajustes para la descripción y beneficios para que no sean demasiado largos */
.challenge-card p:nth-of-type(2), /* Descripción */
.challenge-card p:nth-of-type(3) /* Beneficios */ {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limita a 2 líneas */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 10px; /* Más espacio */
}
</style>