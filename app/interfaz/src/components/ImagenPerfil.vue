<template>
    <div>

 <!--Foto de perfil-->

    <div class="Perfil">

     
      <div class="circulo">

         <div class="cards">
          <div class="card">
            <div class="content">
              <div class="img">
                <img src="../assets/Usuario.png" alt="">
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

    name: "ImagenPerfil"

}

</script>

<style>

/*Circulo de referencia para foto de perfil*/

.Perfil .circulo .cards .card .img{

    position: absolute;
  width: 100px;
  height: 100px;
  background-color: rgb(199, 127, 199);
  border-radius: 50%;
  left: 700px;
  top: 50px;

}

</style>
