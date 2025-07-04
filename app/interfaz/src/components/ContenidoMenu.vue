<template>

<div>

<!--Barra lateral de menu-->

<div class="Lateral">
<div class="offcanvas-header">
            <button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">

  <!--Icono de Menu-->
                    <div class="Rayas">
                <i class="fa-solid fa-bars fa-lg" style="color: #ffffff;"></i>
                        </div>
            </button>

    <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">

   

   <!--Boton de solicitudes-->
    
    <div class="Solicitudes">
    <p>
        <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
    Mis solicitudes
        </a>
    </p>

    <div class="collapse" id="collapseExample">
        <div class="card card-body">
    Aca saldran las solicitudes para convenio
        </div>
    </div> 
    </div>

    <!--Boton de foro-->

    <div class="Foro">
    <p>
        <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample2" role="button" aria-expanded="false" aria-controls="collapseExample">
    Foro
        </a>
    </p>

    <div class="collapse" id="collapseExample2">
        <div class="card card-body">
    Aca saldran los foros abiertos
        </div>
    </div> 
    </div>

    <!--Boton de convenios-->

    <div class="Convenio">
    <p>
        <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample3" role="button" aria-expanded="false" aria-controls="collapseExample">
    Mis convenios
        </a>
    </p>

    <div class="collapse" id="collapseExample3">
        <div class="card card-body">
    Aca saldran los convenios
        </div>
    </div> 
    </div>

    <!--Boton de perfiles favoritos-->

    <div class="Favorito">
    <p>
        <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample4" role="button" aria-expanded="false" aria-controls="collapseExample">
    Mis favoritos
        </a>
    </p>

    <div class="collapse" id="collapseExample4">
        <div class="card card-body">
    Aca saldran los perfiles favoritos
        </div>
    </div> 
    </div>

  </div>

</div>
</div>



</div>

</template>

<script>

export default{

    name: "ContenidoMenu"

}

</script>

<style>

/*Barra lateral*/

.Lateral{

position: absolute;
top: 200px;
left: 50px;
;

}

.Si{

  position: absolute;
  top: 500px;
  left: 10px;
 

}

</style>