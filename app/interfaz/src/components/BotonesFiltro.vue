<template>

<div>

 <!--Boton para filtrar a todos los perfiles-->

    <div class="Todos">

        <div><button>Todos</button></div>

    </div>

    <!--Boton para filtrar a todos los emprendedores-->

    <div class="PerEmprendedores">

        <div><button>Emprendedor</button></div>

    </div>

    <!--Boton para filtrar a todos los diseñadores-->

    <div class="PerDiseñadores">

        <div><button>Diseñador</button></div>

    </div>

    <!--Boton para filtrar a todos los de marketing-->

    <div class="PerMarketing">

        <div><button>Marketing</button></div>

    </div>

</div>

</template>

<script>

export default{

    name: "BotonesFiltro"

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