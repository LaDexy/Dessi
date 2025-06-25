<template>
    
    <div>

        <!--Boton para iniciar sesion-->

    <div class="Inicio">

        <div @click="$emit('MostrarInicio', 'Iniciar')"><button>Iniciar Sesion</button></div>

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

left: 30%;
position: relative;
display: inline-block;

}

.Inicio button{

background-color: antiquewhite;
color: white;
padding: 10px 15px;
border: none;
cursor: pointer;

}

</style>
