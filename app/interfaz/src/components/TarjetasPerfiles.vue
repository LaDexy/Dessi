<template>
  <div>
    <div class="Carta">
    <div class="container">
      <div class="main-card">
        <div class="cards">
          <div class="card">
            <div class="content">
              <div class="img">
                <img src="../assets/Perfil.png" alt="">
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TarjetasPerfiles",
};
</script>

<style>

/*Configuracion de cartas*/

.cards .card .content .img{

position: absolute;
height: 130px;
width: 130px;
left: 670px;
top: 400px;

}

.card .content .img img{

height: 100%;
width: 100%;
object-fit: cover;
border-radius: 50%;

}

</style>
