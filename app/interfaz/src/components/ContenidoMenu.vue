<template>
  <div>
    <div class="Lateral">
      <div class="offcanvas-header">
        <button
          class="btn btn-primary"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasRight"
          aria-controls="offcanvasRight"
        >
          <div class="Rayas">
            <i class="fa-solid fa-bars fa-lg" style="color: #ffffff"></i>
          </div>
        </button>

        <div
          class="offcanvas offcanvas-end"
          tabindex="-1"
          id="offcanvasRight"
          aria-labelledby="offcanvasRightLabel"
        >
          <div class="InicioVolver">
            <p>
              <a
                class="btn btn-primary"
                role="button"
                aria-expanded="false"
                aria-controls="collapseExample"
              >
                Inicio
              </a>
            </p>
          </div>

          <div class="Foro">
            <p>
              <a
                class="btn btn-primary"
                @click="goToForo"
                role="button"
                aria-expanded="false"
                aria-controls="collapseExample"
              >
                Foro
              </a>
            </p>
          </div>

          <div class="Desafios" v-if="userRole === 'Diseñador' || userRole === 'Marketing'">
            <p>
              <a
                class="btn btn-primary"
                data-bs-toggle="collapse"
                href="#desafiosCollapse"
                role="button"
                aria-expanded="false"
                aria-controls="desafiosCollapse"
                @click="fetchDesafios" >
                Desafios Activos
              </a>
            </p>

            <div class="collapse" id="desafiosCollapse">
              <div class="card card-body">
                <div v-if="isLoading">Cargando desafíos...</div>
                <div v-else-if="desafios.length > 0">
                  <div v-for="desafio in desafios" :key="desafio.id_desafio" class="desafio-item">
                    <h4>{{ desafio.nombre_desafio }}</h4>
                    <p>{{ desafio.descripcion_desafio }}</p>
                    <p>Estado: {{ desafio.estado }}</p>
                    <p v-if="desafio.nombre_usuario_emprendedor">Creado por: {{ desafio.nombre_usuario_emprendedor }}</p>
                  </div>
                </div>
                <p v-else>No hay desafíos activos de emprendedores en este momento.</p>
              </div>
            </div>
          </div>

          <div class="Convenio">
            <p>
              <a
                class="btn btn-primary"
                data-bs-toggle="collapse"
                href="#collapseExample3"
                role="button"
                aria-expanded="false"
                aria-controls="collapseExample"
              >
                Mis convenios
              </a>
            </p>

            <div class="collapse" id="collapseExample3">
              <div class="card card-body">Aca saldran los convenios</div>
            </div>
          </div>

          <div class="Favorito">
            <p>
              <a
                class="btn btn-primary"
                data-bs-toggle="collapse"
                href="#collapseExample4"
                role="button"
                aria-expanded="false"
                aria-controls="collapseExample"
              >
                Mis favoritos
              </a>
            </p>

            <div class="collapse" id="collapseExample4">
              <div class="card card-body">
                Aca saldran los perfiles favoritos
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "ContenidoMenu",
  props: {
    userRole: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      desafios: [],
      isLoading: false, // Nuevo estado de carga para el fetch
    };
  },
  methods: {
    goToForo() {
      this.$router.push({ name: "Foro" }).catch((err) => {
        if (err.name !== "NavigationDuplicated") {
          console.error("Error de navegación al Foro:", err);
        }
      });
      console.log("Intentando navegar a PaginaForo...");
    },
    async fetchDesafios() {
      this.isLoading = true; // Inicia la carga
      this.desafios = []; // Limpia desafíos anteriores
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          console.warn('No se encontró token de autenticación. No se pueden obtener los desafíos.');
          // Opcional: Podrías emitir un evento para que PaginaCentral.vue maneje esto
          return;
        }

        // Esta es la URL al endpoint que te proporcioné para obtener todos los desafíos activos
        const response = await axios.get('http://localhost:4000/api/desafios_activos_emprendedores', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          this.desafios = response.data;
          console.log('Desafíos activos cargados para Diseñador/Marketing:', this.desafios);
        } else {
          console.error('Error al cargar desafíos:', response.status, response.data);
          // Opcional: mostrar un mensaje de error en la UI
        }
      } catch (error) {
        console.error('Error en la solicitud para obtener desafíos:', error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.error('Error de autenticación/autorización al obtener desafíos. Redirigiendo a la página principal.');
            this.$router.push({ name: 'Principal' }); // Redirigir a login
        } else {
            console.error('Error de red o del servidor al obtener desafíos.');
        }
      } finally {
        this.isLoading = false; // Finaliza la carga
      }
    }
  },
};
</script>

<style>
/*Barra lateral*/

.Lateral {
  position: absolute;
  top: 200px;
  left: 50px;
}

.Si {
  position: absolute;
  top: 500px;
  left: 10px;
}
</style>
