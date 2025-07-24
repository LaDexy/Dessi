<template>
  <div>
    <div class="Todos">
      <div><button @click="emitFilter('Todos')">Todos</button></div>
    </div>

    <div class="PerEmprendedores">
      <div><button @click="emitFilter('Emprendedor')">Emprendedor</button></div>
    </div>

    <div class="PerDiseñadores">
      <div><button @click="emitFilter('Diseñador')">Diseñador</button></div>
    </div>

    <div class="PerMarketing">
      <div><button @click="emitFilter('Marketing')">Marketing</button></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BotonesFiltro",
  methods: {
    /**
     * @description Emite el tipo de filtro seleccionado al componente padre.
     * @param {string} filterType - El tipo de perfil a filtrar ('Todos', 'Emprendedor', 'Diseñador', 'Marketing').
     */
    emitFilter(filterType) {
      this.$emit('filter', filterType);
      console.log('Filtro de tipo de perfil emitido:', filterType);
    }
  }
}
</script>

<style scoped>
/* ¡Importante! 'scoped' asegura que estos estilos solo afecten a este componente. */

/* Estiliza el div raíz del componente como un contenedor flexbox */
div {
  display: flex; /* Convierte el contenedor en un flex container */
  justify-content: center; /* Centra los botones horizontalmente */
  align-items: center; /* Alinea los botones verticalmente (si tuvieran diferentes alturas) */
  gap: 15px; /* Espacio entre los botones */
  margin-top: 20px; /* Margen superior para separarlos de elementos superiores (como el nombre de usuario o la imagen de perfil) */
  position: relative; /* Importante: si este componente va dentro de un padre con posicionamiento, este relative asegura que su margin-top sea correcto */
  z-index: 5; /* Asegura que los botones estén por encima de otros elementos de fondo */
  flex-wrap: wrap; /* Permite que los botones salten a la siguiente línea en pantallas pequeñas */
}

/* Estilos comunes para los contenedores individuales de cada botón */
.Todos,
.PerEmprendedores,
.PerDiseñadores,
.PerMarketing {
  /* Anulamos el posicionamiento absoluto que tenías antes */
  position: static; /* Esto los devuelve al flujo normal del flexbox */
  left: auto; /* Resetea la propiedad 'left' */
  top: auto; /* Resetea la propiedad 'top' */
  display: block; /* Como son ítems flex, se comportan como bloques dentro del flex */
}

/* Estilos comunes para todos los botones dentro de los filtros */
.Todos button,
.PerEmprendedores button,
.PerDiseñadores button,
.PerMarketing button {
  background-color: #e4a0d5; /* Tu color rosado/morado deseado */
  color: white;
  padding: 10px 15px; /* Relleno interno */
  border: none; /* Sin borde */
  cursor: pointer; /* Cursor de puntero al pasar por encima */
  border-radius: 20px; /* Bordes muy redondeados para crear la forma de pastilla */
  font-size: 1em; /* Tamaño de fuente estándar */
  white-space: nowrap; /* Evita que el texto del botón se rompa en varias líneas */
  transition: background-color 0.3s ease; /* Transición suave para el efecto hover */
  min-width: 100px; /* Ancho mínimo para que los botones sean consistentes */
}

/* Efecto hover para los botones */
.Todos button:hover,
.PerEmprendedores button:hover,
.PerDiseñadores button:hover,
.PerMarketing button:hover {
  background-color: #d18cc4; /* Un tono ligeramente más oscuro al pasar el ratón */
}

/* Media Queries para Responsividad */

/* Para pantallas medianas (ej. tablets, 768px y abajo) */
@media (max-width: 768px) {
  div { /* Apunta al div raíz */
    gap: 10px; /* Reduce el espacio entre botones */
    margin-top: 15px;
  }

  .Todos button,
  .PerEmprendedores button,
  .PerDiseñadores button,
  .PerMarketing button {
    padding: 8px 12px;
    font-size: 0.9em;
    min-width: 80px;
  }
}

/* Para pantallas pequeñas (ej. móviles, 480px y abajo) */
@media (max-width: 480px) {
  div { /* Apunta al div raíz */
    gap: 8px; /* Reduce aún más el espacio */
    margin-top: 10px;
  }

  .Todos button,
  .PerEmprendedores button,
  .PerDiseñadores button,
  .PerMarketing button {
    padding: 7px 10px;
    font-size: 0.85em;
    min-width: 70px;
  }
}
</style>