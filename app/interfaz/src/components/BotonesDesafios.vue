<template>

<div>

  <!--Menu desplegable para opciones de desafios-->

    <div class="MisDesafios">

        <button>Mis desafios</button>

            <div class="content">

                <div @click="$emit('MostrarRegistro', 'DesafiosNuevos')"><a><i class="fa-solid fa-crown" style="color: #d6bb5f;"></i>Crear desafio</a></div>
                <div @click="$emit('MostrarRegistro', 'DesafiosCreados')"><a>Ver mis desafio</a></div>

            </div>
    </div>

</div>

</template>

<script>

export default{

    name: "BotonesDesafios"

}

</script>

<style>

/*Menu desplegable de desafios*/

.MisDesafios{

left: 85%;
position: relative;
display: inline-block;


}

.MisDesafios button{


background-color: antiquewhite;
color: white;
padding: 10px 15px;
border: none;
cursor: pointer;


}

.MisDesafios a{

display: block;
color: black;
text-decoration: none;
padding: 10px 15px;

}

.MisDesafios .content{

display: none;
position: absolute;
background-color: antiquewhite;
min-width: 150px;
box-shadow: 2px 2px 5px  hsla(0, 0%, 0%, 0.8) ;
}

.MisDesafios:hover .content{

display: block;

}

.MisDesafios:hover button{

background-color: hsl(0, 0%, 70%);

}


.MisDesafios a:hover{

background-color: hsl(0, 0%, 90%);

}

</style>