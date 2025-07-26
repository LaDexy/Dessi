<template>
  <div>

    <!--ESTA ES LA FUNCION DE LOS BOTONES QUE FUNCIONAN PARA FILTRAR LOS PERFILES SEGUN SU TIPO DE PERFIL-->
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
    emitFilter(filterType) {
      this.$emit('filter', filterType);
      console.log('Filtro de tipo de perfil emitido:', filterType);
    }
  }
}
</script>

<style scoped>
div {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  position: relative;
  z-index: 5;
  flex-wrap: wrap;
}

.Todos,
.PerEmprendedores,
.PerDiseñadores,
.PerMarketing {
  position: static;
  left: auto;
  top: auto;
  display: block;
}

.Todos button,
.PerEmprendedores button,
.PerDiseñadores button,
.PerMarketing button {
  background-color: #e4a0d5;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  border-radius: 20px;
  font-size: 1em;
  white-space: nowrap;
  transition: background-color 0.3s ease;
  min-width: 100px;
}

.Todos button:hover,
.PerEmprendedores button:hover,
.PerDiseñadores button:hover,
.PerMarketing button:hover {
  background-color: #d18cc4;
}

@media (max-width: 768px) {
  div {
    gap: 10px;
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

@media (max-width: 480px) {
  div {
    gap: 8px;
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