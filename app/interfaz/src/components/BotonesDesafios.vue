<template>

<div>

   <!--Menu desplegable para crear y ver tus desafios-->

    <div class="BotonesDesafios">

        <button>Desafios</button>

            <div class="contentDesafios">

                <div ><a>Crear desafio</a></div>
                <div><a>Ver mis desafios</a></div>
                
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

/*Menu desplegable de Registro*/

.BotonesDesafios{

left: 10%;
position: absolute;
display: inline-block;
top: 190px;

}

.BotonesDesafios button{


background-color: antiquewhite;
color: white;
padding: 10px 15px;
border: none;
cursor: pointer;


}

.BotonesDesafios a{

display: block;
color: black;
text-decoration: none;
padding: 10px 20px;

}

.BotonesDesafios .contentDesafios{

display: none;
position: absolute;
background-color: antiquewhite;
min-width: 100px;
box-shadow: 2px 2px 5px  hsla(0, 0%, 0%, 0.8) ;
}

.BotonesDesafios:hover .contentDesafios{

display: block;

}

.BotonesDesafios:hover button{

background-color: hsl(0, 0%, 70%);

}


.BotonesDesafios a:hover{

background-color: hsl(0, 0%, 90%);

}

</style>