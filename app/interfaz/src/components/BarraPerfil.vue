<template>
  <div>

    <!--Rectangulo de arriba de barra de perfil-->
    <div class="Barra">
      <div class="rectangulo"></div>
    </div>

    <!--Texto de nombre de perfil-->
    <div>
      <h1 class="Encabezado">Aca ira el nombre de perfil</h1>
    </div>
  </div>
</template>

<script>
export default {
  name: "BarraPerfil",
};
</script>

<style>
/*Texto de donde ira el nombre del usuario*/

.Encabezado {
  position: absolute;
  color: white;
  top: 190px;
  left: 525px;
}

/*Rectangulo de barra superior*/

.Barra {
    position: absolute;
  width: 1525px;
  height: 230px;
  background-color: hsl(300, 29%, 78%);
}


</style>
