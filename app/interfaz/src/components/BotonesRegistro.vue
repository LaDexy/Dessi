<template>

<div>

<!--Boton para iniciar sesion-->

    <div class="Inicio">

        <button>Iniciar Sesion</button>

    </div>

<!--Menu desplegable para registro de perfil-->

    <div class="dropdown">

        <button>Registrarse</button>

            <div class="content">

                <div @click="MostrarRegistroEmpre = true; perfil='Emprendedor'">Emprendedor</div>
                <div @click="MostrarRegistroDise = true; perfil='Diseñador'">Diseñador</div>
                <div @click="MostrarRegistroMar = true; perfil='Marketing'">Marketing</div>

            </div>
    </div>


</div>

</template>

<script>

export default {

    name: "BotonesRegistro"

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

/*Menu desplegable de Registro*/

.dropdown{

left: 40%;
position: relative;
display: inline-block;
top: 10px;

}

.dropdown button{


background-color: antiquewhite;
color: white;
padding: 10px 15px;
border: none;
cursor: pointer;


}

.dropdown a{

display: block;
color: black;
text-decoration: none;
padding: 10px 15px;

}

.dropdown .content{

display: none;
position: absolute;
background-color: antiquewhite;
min-width: 100px;
box-shadow: 2px 2px 5px  hsla(0, 0%, 0%, 0.8) ;
}

.dropdown:hover .content{

display: block;

}

.dropdown:hover button{

background-color: hsl(0, 0%, 70%);

}


.dropdown a:hover{

background-color: hsl(0, 0%, 90%);

}

</style>
