<template>
  <div>
    <!--Boton para filtrar a todos los perfiles-->
    <div class="Todos">
      <!-- AÑADIDO: @click para emitir el filtro 'Todos' -->
      <div><button @click="emitFilter('Todos')">Todos</button></div>
    </div>

    <!--Boton para filtrar a todos los emprendedores-->
    <div class="PerEmprendedores">
      <!-- AÑADIDO: @click para emitir el filtro 'Emprendedor' -->
      <div><button @click="emitFilter('Emprendedor')">Emprendedor</button></div>
    </div>

    <!--Boton para filtrar a todos los diseñadores-->
    <div class="PerDiseñadores">
      <!-- AÑADIDO: @click para emitir el filtro 'Diseñador' -->
      <div><button @click="emitFilter('Diseñador')">Diseñador</button></div>
    </div>

    <!--Boton para filtrar a todos los de marketing-->
    <div class="PerMarketing">
      <!-- AÑADIDO: @click para emitir el filtro 'Marketing' -->
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

<style>

/*Boton de filtrar todos los perfiles*/
.PerEmprendedores{

left: 40%;
position: absolute;
display: inline-block;
top: 250px;


}

.PerEmprendedores button{

background-color: #e4a0d5;
color: white;
padding: 10px 15px;
border: none;
cursor: pointer;
border-radius: 20px;

}

/*Boton de filtrar todos los emprendedores*/
.Todos{

left: 35%;
position: absolute;
display: inline-block;
top: 250px;


}

.Todos button{

background-color:#e4a0d5;;
color: white;
padding: 10px 15px;
border: none;
cursor: pointer;
border-radius: 20px;

}

/*Boton de filtrar todos los diseñadores*/
.PerDiseñadores{

left: 48.5%;
position: absolute;
display: inline-block;
top: 250px;


}

.PerDiseñadores button{

background-color: #e4a0d5;;
color: white;
padding: 10px 15px;
border: none;
cursor: pointer;
border-radius: 20px;

}

/*Boton de filtrar todos los de marketing*/
.PerMarketing{

left: 55.5%;
position: absolute;
display: inline-block;
top: 250px;


}

.PerMarketing button{

background-color: #e4a0d5;
color: white;
padding: 10px 15px;
border: none;
cursor: pointer;
border-radius: 20px;

}


</style>