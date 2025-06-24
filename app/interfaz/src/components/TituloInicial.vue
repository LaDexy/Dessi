<template>
    
<div>
<!--Rectangulo de arriba de titulo-->

    <div class="rectangulo"></div>

<!--Texto de Encabezado-->
    <div>
        <h1 class="Titulo">TAKE TO STEP</h1>
    </div>

</div>

</template>

<script>

export default {
    name: "TituloInicial"
  
}

</script>

<style>

/*Texto de Titulo*/

.Titulo{

  position: absolute;
  color: white;
  text-align: left;
  top: 10px;

}

/*Rectangulo de titulo*/

.rectangulo{

position: absolute;
width: 1520px;
height: 60px;
background-color: hsl(300, 29%, 78%);

}

</style>