<template>
  <div class="home-button-container">
    <router-link :to="{ name: 'Central' }" class="btn btn-home-circle" aria-label="Ir a Inicio">
      <i class="fa-solid fa-house-chimney fa-lg" style="color: #B197FC;"></i>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'BotonSalida',
};
</script>

<style scoped>
.home-button-container {
  position: fixed;
  bottom: 20px; 
  left: 20px; 

  z-index: 1000;
}
.btn-home-circle {
  width: 45px;
  height: 45px;
  border-radius: 50%; 
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  color: #B197FC;
  font-size: 1.25rem;
  text-decoration: none;
  border: none;
}
.btn-home-circle:hover {
  background-color: #e9ecef;
}
</style>