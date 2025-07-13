<template>

<div>

    <!--Menu desplegable para opciones de perfil-->

    <div class="MiPerfil">

        <button>Mi Perfil</button>

            <div class="content">

                <div><a>Editar perfil</a></div>
                <div @click="logout" class="logout-button"><a>Cerrar sesion</a></div>

            </div>
    </div>

</div>

</template>

<script>

export default{

    name: "OpcionPerfil"

}

</script>

<style>

/*Menu desplegable de Registro*/

.MiPerfil{

top: 190px;
left: 85%;
position: absolute;
display: inline-block;


}

.MiPerfil button{


background-color: antiquewhite;
color: white;
padding: 10px 15px;
border: none;
cursor: pointer;


}

.MiPerfil a{

display: block;
color: black;
text-decoration: none;
padding: 10px 15px;

}

.MiPerfil .content{

display: none;
position: absolute;
background-color: antiquewhite;
min-width: 150px;
box-shadow: 2px 2px 5px  hsla(0, 0%, 0%, 0.8) ;
}

.MiPerfil:hover .content{

display: block;

}

.MiPerfil:hover button{

background-color: hsl(0, 0%, 70%);

}


.MiPerfil a:hover{

background-color: hsl(0, 0%, 90%);

}

</style>