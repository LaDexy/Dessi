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

<style scoped>
/* Estilos generales para el contenedor del botón de la barra lateral */
.Lateral {
  position: fixed; /* Mantenemos el posicionamiento absoluto si es lo que deseas para el botón */

  z-index: 1050; /* Asegura que el botón esté por encima de otros elementos */
 
}

/* Estilo para el botón de despliegue del menú (el que tiene las rayas) */
.Lateral .btn.btn-primary {
  background-color: transparent !important; /* Hacemos el botón de Bootstrap transparente */
  border-color: transparent !important; /* Quitamos el borde de Bootstrap */
  padding: 0 !important; /* Quitamos el padding del botón de Bootstrap */
  box-shadow: none !important; /* Quitamos la sombra del botón de Bootstrap */
  transition: none !important; /* Quitamos transiciones de Bootstrap */
}

.Lateral .btn.btn-primary:hover {
  background-color: transparent !important;
  border-color: transparent !important;
  transform: none !important;
  box-shadow: none !important;
}

/* Estilos para el div.Rayas que es el "cuadrado de fondo" */
.Rayas {
  display: flex; /* Para centrar el ícono dentro de este div */
  justify-content: center;
  align-items: center;
  width: 50px; /* Ancho del cuadrado */
  height: 50px; /* Alto del cuadrado */
  background-color: hsl(300, 29%, 78%); /* Tu color rosado/morado */
  border-radius: 12px; /* ¡Más redondeado! Ajusta este valor (ej. 15px, 20px) para más o menos redondeo */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Sombra suave */
  transition: all 0.3s ease; /* Transición para el hover */
  cursor: pointer; /* Indica que es clickeable */
}

.Rayas:hover {
  background-color: #5e1c7d; /* Tono más oscuro al pasar el ratón */
  transform: translateY(-1px); /* Ligero levantamiento */
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2); /* Sombra más pronunciada */
}

/* Asegura que el ícono de las rayas sea blanco */
.Lateral .Rayas .fa-bars {
  color: #ffffff !important;
}

/* Estilos para el panel del Offcanvas (la barra lateral que se despliega) */
.offcanvas {
  background-color: #fcf8fc !important; /* Fondo muy claro, casi blanco con un toque de rosado */
  box-shadow: -8px 0 20px rgba(0, 0, 0, 0.2); /* Sombra más fuerte para la barra lateral */
  width: 280px !important; /* Ancho personalizado para la barra lateral */
  max-width: 80%; /* Asegura que no sea demasiado ancha en pantallas muy pequeñas */
  font-family: "Times New Roman", serif; /* Fuente consistente */
}

/* Estilos para el encabezado del Offcanvas (donde va el título y botón de cerrar) */
.offcanvas-header {
  border-bottom: 1px solid #eee !important; /* Línea separadora sutil */
  background-color: #f0f0f0 !important; /* Fondo ligeramente diferente para el encabezado */
  color: #333 !important;
  border-radius: 20%;
}

.offcanvas-header .offcanvas-title {
  font-weight: bold;
  font-size: 1.5em;
  color: #444;
}

/* Estilos para el botón de cerrar del Offcanvas */
.offcanvas-header .btn-close {
  color: #555 !important; /* Color del ícono de cerrar */
  font-size: 1.1em !important;
  transition: transform 0.2s ease;
}
.offcanvas-header .btn-close:hover {
  transform: rotate(90deg); /* Pequeña animación al cerrar */
}


/* Estilos para el cuerpo del Offcanvas (donde van los enlaces del menú) */
.offcanvas-body {
  padding: 1.5rem 1rem !important; /* Aumenta el padding para más espacio */
  display: flex; /* Usamos flexbox para los elementos del menú */
  flex-direction: column; /* Apila los elementos verticalmente */
  gap: 10px; /* Espacio entre los elementos del menú */
}

/* Estilos para los enlaces de navegación dentro del Offcanvas */
/* Sobrescribimos las clases de Bootstrap btn btn-primary para que parezcan enlaces */
.offcanvas a.btn.btn-primary {
  display: block !important; /* Para que ocupen todo el ancho disponible */
  width: auto !important; /* Evita anchos fijos de Bootstrap */
  background-color: transparent !important; /* Elimina el fondo de botón */
  border: none !important; /* Elimina el borde de botón */
  color: #4a4a4a !important; /* Color de texto oscuro para los enlaces */
  text-align: left !important; /* Alinea el texto a la izquierda */
  padding: 12px 15px !important; /* Padding para los ítems del menú */
  font-size: 1.1em; /* Tamaño de fuente para los ítems del menú */
  font-weight: 500; /* Peso de fuente intermedio */
  border-radius: 8px; /* Ligeros bordes redondeados para el efecto hover */
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
  text-decoration: none !important; /* Asegura que no haya subrayado por defecto */
}

.offcanvas a.btn.btn-primary:hover,
.offcanvas a.btn.btn-primary:focus {
  background-color: #f5e7f7 !important; /* Fondo rosa claro al pasar el ratón/enfocar */
  color: #6a1b9a !important; /* Color morado al pasar el ratón/enfocar */
  text-decoration: none !important; /* Elimina el subrayado en hover/focus */
  box-shadow: none !important; /* Elimina cualquier sombra de botón */
  transform: translateX(5px); /* Pequeño desplazamiento a la derecha */
}

/* Estilos para el contenido de los convenios que se colapsa */
.offcanvas .card.card-body {
  background-color: #f0f0f0 !important; /* Fondo gris claro para el contenido colapsable */
  border: 1px solid #ddd !important; /* Borde sutil */
  border-radius: 8px !important; /* Bordes redondeados */
  margin-top: 10px; /* Espacio desde el enlace 'Mis convenios' */
  padding: 15px !important;
  color: #555;
  font-size: 0.95em;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05); /* Sombra interna sutil */
}

/* Media Queries para responsividad */
@media (max-width: 576px) {
  .offcanvas {
    width: 250px !important; /* Reduce el ancho en móviles */
  }
  .offcanvas a.btn.btn-primary {
    font-size: 1em; /* Reduce el tamaño de fuente de los ítems del menú */
    padding: 10px 12px !important;
  }
  .Lateral {
    top: 15px; /* Ajusta la posición del botón de menú en móviles */
    left: 15px;
  }
}
</style>
