<template>
    
<div>

<!--Barra lateral derecha que se desliza-->
    <div class="Opciones">
        <div class="offcanvas-header">
            <button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">

  <!--Icono de Interrogacion-->
                <i class="fa-regular fa-circle-question fa-2xl" style="color: #ffffff;"></i>

            </button>

    <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">

<!--Boton de Instructivo-->
    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>

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
    Aca dia informacion sobre la app web
        </div>
    </div>
    
        </div>
    </div>
</div>

</div>

</template>

<script>

export default{

    name: "BarraOpciones"

}

</script>

<style>

/*Boton de Opciones*/

.Opciones{

  position: absolute;
  top: 944px;
  left: 10px;

}

</style>
