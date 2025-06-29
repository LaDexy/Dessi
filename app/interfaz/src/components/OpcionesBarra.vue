<template>
    <div>   

        <div class="Menu">
        <!--Barra Opciones inferior-->
<button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom" aria-controls="offcanvasBottom">

 <!--Icono de Interrogacion-->
                <i class="fa-regular fa-circle-question fa-2xl" style="color: #ffffff;"></i>

</button>

       

<div class="offcanvas offcanvas-bottom" tabindex="-1" id="offcanvasBottom" aria-labelledby="offcanvasBottomLabel">
  <div class="offcanvas-header">

<!--Boton de Instructivo-->
    
    <p>
        <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
    Instructivo
        </a>
    </p>

    <div class="collapse" id="collapseExample">
        <div class="card card-body">
    Aca dira como se inicia sesion y se registra
        </div>
    </div>

    <p>
        <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample2" role="button" aria-expanded="false" aria-controls="collapseExample2">
    Acerca De
        </a>
    </p>

    <div class="collapse" id="collapseExample2">
        <div class="card card-body">
    Aca dira informacion sobre la app web
        </div>
    </div>
    

  </div>
</div>
</div>

    </div>
</template>

<script>

export default {

name: "OpcionesBarra"

}

</script>

<style>

/*Boton de Opciones inferior*/

.Menu{

  position: absolute;
  top: 944px;
  left: 10px;

}

</style>
