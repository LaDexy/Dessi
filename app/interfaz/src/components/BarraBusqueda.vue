<template>
  <div>
    <div class="IconoBuscar">
      <div class="buscar">
        <input
          type="text"
          placeholder="Buscar"
          required
          v-model="searchTerm"
          @input="emitSearch"
          @keyup.enter="emitSearch"
        />

        <div class="Busqueda" @click="emitSearch">
          <i class="fa-solid fa-magnifying-glass icon"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BarraBusqueda",
  data() {
    return {
      searchTerm: "", // Nuevo: Almacena el término de búsqueda
    };
  },
  methods: {
    /**
     * @description Emite el término de búsqueda actual al componente padre.
     */
    emitSearch() {
      // Usamos trim() para eliminar espacios en blanco al inicio y al final
      this.$emit("search", this.searchTerm.trim());
      console.log(
        "Término de búsqueda emitido desde BarraBusqueda:",
        this.searchTerm.trim()
      );
    },
  },
};
</script>

<style scope>
/*Barra de busqueda*/

.IconoBuscar {

position: relative;

}

.buscar {
   /* ¡Cambiado de 'relative' a 'fixed' para que no se mueva con el scroll! */

  z-index: 1040; /* Asegura que esté por encima del contenido y debajo del menú */

  display: flex; /* Para alinear el input y el botón visualmente */
  align-items: center; /* Centrar verticalmente el input y el botón */
  padding: 5px; /* Pequeño padding alrededor del input y el botón */

  /* Eliminamos los márgenes que eran para posicionamiento relativo */
  margin-left: 0;
  margin-top: 0;
}

.buscar input {
  width: 0px;
  height: 40px;
  padding: 0 20px;
  font-size: 18px;
  color: #000;
  outline: none;
  border: 1px solid silver;
  border-radius: 30px;
  transition: all 0.6s ease;
}

.Busqueda {
  position: absolute;
  top: 0;
  right: 0;
  width: 55px;
  height: 55x;
  line-height: 55px;
  background: #e4a0d5;
  text-align: center;
  color: white;
  font-size: 20px;
  border-radius: 50%;
  cursor: pointer;
}

.buscar:hover input {
  width: 240px;
}

.buscar input:focus {
  width: 240px;
}
</style>
