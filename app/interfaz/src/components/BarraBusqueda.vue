<template>

<div>

    <!--Barra de busqueda de perfiles de usuario-->

<div class="buscar">
	<input type="text" placeholder="Buscar" required>

<!--Boton con icono de busqueda-->

<div class="Busqueda">
	<i class="fa-solid fa-magnifying-glass icon"></i>
</div>

</div>





</div>

</template>

<script>

export default{

    name: "BarraBusqueda"

}

</script>

<style>

/*Barra de busqueda*/

.buscar{

position: absolute;
padding: 5px;
top: 260px;
left: 630px;

}

.buscar input{

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

.Busqueda{

position: absolute;
top: 0;
right: 0;
width: 55px;
height: 55x;
line-height: 55px;
background: #440080;
text-align: center;
color: white;
font-size: 20px;
border-radius: 50%;
cursor: pointer;

}

.buscar:hover input{

width: 240px;

}

.buscar input:focus{

width: 240px;

}

</style>