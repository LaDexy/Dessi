<template>

<div>

    <div class="Album">
    <div class="Portafolio"><img src="../assets/Portafolio.png" alt=""></div>
    <div class="Portafolio"><img src="../assets/Portafolio.png" alt=""></div>
    <div class="Portafolio"><img src="../assets/Portafolio.png" alt=""></div>
    <div class="Portafolio"><img src="../assets/Portafolio.png" alt=""></div>
    <div class="Portafolio"><img src="../assets/Portafolio.png" alt=""></div>
    <div class="Portafolio"><img src="../assets/Portafolio.png" alt=""></div>
    <div class="Portafolio"><img src="../assets/Portafolio.png" alt=""></div>
    <div class="Portafolio"><img src="../assets/Portafolio.png" alt=""></div>
    <div class="Portafolio"><img src="../assets/Portafolio.png" alt=""></div>
    <div class="Portafolio"><img src="../assets/Portafolio.png" alt=""></div>
    </div>

</div>

</template>

<script>

export default{

    name: "PortafolioPerfil"

}

</script>

<style>

.Album {

display: flex;
  flex-wrap: wrap;
  justify-content: center; 
  gap: 20px; 
  padding: 20px; 
  margin-top: 150px;


}

.Portafolio{

position: relative;
max-width: 100%;
border-radius: 8px;
margin: 1rem;
box-shadow: 0 0 12px #d7d7d7;

}

.Portafolio img{

border-radius: 8px 8px 0 0;
max-height: 200px;
height: 200px;
width: 100%;

}

</style>