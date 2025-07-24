<template>
  <div class="pagina-desafios-container">
    <h2>Desafíos Activos Disponibles</h2>

    <div v-if="isLoading" class="loading-message">Cargando desafíos...</div>
    <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-else-if="desafios.length > 0" class="desafios-list">
      <div v-for="desafio in desafios" :key="desafio.id_desafio" class="desafio-card">
        <h3>{{ desafio.nombre_desafio }}</h3>
        <p class="descripcion">{{ desafio.descripcion_desafio }}</p>
        <p class="meta">Estado: {{ desafio.estado }}</p>
        <p class="meta" v-if="desafio.nombre_usuario_emprendedor">
          Creado por: {{ desafio.nombre_usuario_emprendedor }}
        </p>
        <button @click="viewChallengeDetails(desafio.id_desafio)" class="btn-detalles">
          Ver Detalles
        </button>
      </div>
    </div>
    <div v-else class="no-desafios-message">
      No hay desafíos activos de emprendedores en este momento.
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PaginaDesafios',
  data() {
    return {
      desafios: [],
      isLoading: false,
      errorMessage: ''
    };
  },
  async created() {
    // Al crear el componente, automáticamente carga los desafíos
    await this.fetchDesafios();
  },
  methods: {
    async fetchDesafios() {
      this.isLoading = true;
      this.errorMessage = ''; // Limpiar cualquier mensaje de error anterior
      this.desafios = []; // Limpia desafíos anteriores
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          this.errorMessage = 'No se encontró token de autenticación. Por favor, inicia sesión.';
          this.$router.push({ name: 'Principal' }); // Redirigir a login
          return;
        }

        const response = await axios.get('http://localhost:4000/api/desafios_activos_emprendedores', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          this.desafios = response.data;
          console.log('Desafíos activos cargados en PaginaDesafios:', this.desafios);
        } else {
          this.errorMessage = 'Error al cargar desafíos: ' + (response.data.message || 'Error desconocido.');
          console.error('Error al cargar desafíos:', response.status, response.data);
        }
      } catch (error) {
        console.error('Error en la solicitud para obtener desafíos:', error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.errorMessage = 'Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión.';
          this.$router.push({ name: 'Principal' }); // Redirigir a login
        } else {
          this.errorMessage = 'Error de conexión con el servidor o al obtener desafíos.';
        }
      } finally {
        this.isLoading = false;
      }
    },
    viewChallengeDetails(id) {
      // Este método navegará a la página de detalles del desafío (Paso 3)
      console.log('Navegando a los detalles del desafío:', id);
      this.$router.push({ name: 'PaginaDetalleDesafio', params: { id: id } });
    }
  }
};
</script>

<style scoped>
.pagina-desafios-container {
  padding: 20px;
  max-width: 900px;
  margin: 20px auto;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #333;
}

h2 {
  text-align: center;
  color: #0056b3;
  margin-bottom: 30px;
}

.loading-message, .error-message, .no-desafios-message {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
  color: #666;
}

.error-message {
  color: #d9534f;
  background-color: #f2dede;
  border: 1px solid #ebccd1;
  border-radius: 4px;
}

.desafios-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.desafio-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.desafio-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.desafio-card h3 {
  color: #007bff;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.3em;
}

.desafio-card .descripcion {
  font-size: 0.95em;
  line-height: 1.5;
  color: #555;
  flex-grow: 1; /* Permite que la descripción ocupe el espacio disponible */
}

.desafio-card .meta {
  font-size: 0.85em;
  color: #777;
  margin-top: 10px;
}

.btn-detalles {
  display: block;
  width: 100%;
  padding: 10px 15px;
  margin-top: 15px;
  background-color: #28a745; /* Green color for action */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  text-align: center;
  transition: background-color 0.2s ease;
}

.btn-detalles:hover {
  background-color: #218838;
}
</style>