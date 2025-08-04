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
                @click="goToPaginaCentral"
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
                @click="goToPaginaDesafios"
                role="button"
                aria-expanded="false"
                aria-controls="desafiosCollapse"
              >
                Desafios Activos
              </a>
            </p>
          </div>

          <div class="Convenio">
            <p>
              <a
                class="btn btn-primary"
                @click="openConveniosModal"
                role="button"
                aria-expanded="false"
                aria-controls="MisConveniosModal"
              >
                Mis convenios
              </a>
            </p>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
    };
  },
  methods: {
 
    openConveniosModal() {
    
      
      this.$emit('show-mis-convenios-modal');
      console.log('Emitiendo evento para mostrar el modal de convenios.');
    },
    
    goToPaginaCentral() {
      this.$router.push({ name: 'Central' }).catch((err) => {
        if (err.name !== 'NavigationDuplicated') {
          console.error('Error de navegación a PaginaCentral:', err);
        }
      });
      console.log('Intentando navegar a PaginaCentral...');
    },
    goToForo() {
      this.$router.push({ name: "Foro" }).catch((err) => {
        if (err.name !== "NavigationDuplicated") {
          console.error("Error de navegación al Foro:", err);
        }
      });
      console.log("Intentando navegar a PaginaForo...");
    },
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

<style scoped>

.Lateral {
  position: fixed;
  z-index: 1050;
}
.Lateral .btn.btn-primary {
  background-color: transparent !important;
  border-color: transparent !important;
  padding: 0 !important;
  box-shadow: none !important;
  transition: none !important;
}
.Lateral .btn.btn-primary:hover {
  background-color: transparent !important;
  border-color: transparent !important;
  transform: none !important;
  box-shadow: none !important;
}
.Rayas {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  background-color: hsl(300, 29%, 78%);
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
}
.Rayas:hover {
  background-color: #5e1c7d;
  transform: translateY(-1px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
}
.Lateral .Rayas .fa-bars {
  color: #ffffff !important;
}
.offcanvas {
  background-color: #fcf8fc !important;
  box-shadow: -8px 0 20px rgba(0, 0, 0, 0.2);
  width: 280px !important;
  max-width: 80%;
  font-family: "Times New Roman", serif;
}
.offcanvas-header {
  border-bottom: 1px solid #eee !important;
  background-color: #f0f0f0 !important;
  color: #333 !important;
  border-radius: 20%;
}
.offcanvas-header .offcanvas-title {
  font-weight: bold;
  font-size: 1.5em;
  color: #444;
}
.offcanvas-header .btn-close {
  color: #555 !important;
  font-size: 1.1em !important;
  transition: transform 0.2s ease;
}
.offcanvas-header .btn-close:hover {
  transform: rotate(90deg);
}
.offcanvas-body {
  padding: 1.5rem 1rem !important;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.offcanvas a.btn.btn-primary {
  display: block !important;
  width: auto !important;
  background-color: transparent !important;
  border: none !important;
  color: #4a4a4a !important;
  text-align: left !important;
  padding: 12px 15px !important;
  font-size: 1.1em;
  font-weight: 500;
  border-radius: 8px;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
  text-decoration: none !important;
}
.offcanvas a.btn.btn-primary:hover,
.offcanvas a.btn.btn-primary:focus {
  background-color: #f5e7f7 !important;
  color: #6a1b9a !important;
  text-decoration: none !important;
  box-shadow: none !important;
  transform: translateX(5px);
}
.offcanvas .card.card-body {
  background-color: #f0f0f0 !important;
  border: 1px solid #ddd !important;
  border-radius: 8px !important;
  margin-top: 10px;
  padding: 15px !important;
  color: #555;
  font-size: 0.95em;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}
@media (max-width: 576px) {
  .offcanvas {
    width: 250px !important;
  }
  .offcanvas a.btn.btn-primary {
    font-size: 1em;
    padding: 10px 12px !important;
  }
  .Lateral {
    top: 15px;
    left: 15px;
  }
}
</style>