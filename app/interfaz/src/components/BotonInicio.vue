<template>
    
    <div>

        <!--Boton para iniciar sesion-->

    <div class="Inicio">

        <div @click="$emit('MostrarSesion', 'Sesion')"><button>Iniciar Sesion</button></div>

    </div>

    </div>

</template>

<script>

export default{

    name: "BotonInicio"

}

</script>

<style>

/*Boton de Inicio de Sesion*/
.Inicio{

left: 35%;
position: relative;
display: inline-block;
top: 10px;

}

.Inicio button{

background-color: antiquewhite;
color: white;
padding: 10px 15px;
border: none;
cursor: pointer;

}

</style>
