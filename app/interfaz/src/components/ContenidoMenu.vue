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

          <!-- CAMBIO CLAVE AQUÍ: Desafios Activos ahora es un enlace de navegación -->
          <div class="Desafios" v-if="userRole === 'Diseñador' || userRole === 'Marketing'">
            <p>
              <a
                class="btn btn-primary"
                @click="goToPaginaDesafios"
                role="button"
                aria-expanded="false"
                aria-controls="desafiosCollapse"
              >
                Desafios Activos
              </a>
            </p>
            <!-- ELIMINADO: Ya no hay div.collapse con la lista de desafíos aquí -->
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

        </div>
      </div>
    </div>
  </div>
</template>

<script>
 // Se mantiene por si hay otros métodos que lo usen, aunque fetchDesafios se elimina

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
      // ELIMINADO: desafios: [],
      // ELIMINADO: isLoading: false,
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
    // NUEVO MÉTODO: Para navegar a la nueva página de desafíos
    goToPaginaDesafios() {
      this.$router.push({ name: "desafiosActivos" }).catch((err) => {
        if (err.name !== "NavigationDuplicated") {
          console.error("Error de navegación a PaginaDesafios:", err);
        }
      });
      console.log("Intentando navegar a PaginaDesafios...");
    },
   
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
