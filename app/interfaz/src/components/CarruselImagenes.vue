<template>
<div>

  <!--ESTA ES LA PARTE DE LAS 3 IMAGENES CENTRALES DE PAGINA PRINCIPAL-->
    <section>
        <img src="../assets/Slider1.jpg" alt="...">
        <img src="../assets/Slider2.jpg" alt="...">
        <img src="../assets/Slider3.jpg" alt="...">
    </section>
</div>
</template>

<script>
export default {
    name: "CarruselImagenes"
}
</script>

<style scoped>
section {
  display: flex;
  width: 100%;
  height: 380px;
  overflow: hidden;
  border-radius: 10px;
  margin: 20px 0;
}

section img {
  width: 0px;
  flex-grow: 1;
  object-fit: cover;
  opacity: 0.9;
  transition: all .5s ease;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

section img:hover {
  cursor: crosshair;
  width: 300px;
  opacity: 1;
  filter: contrast(120%);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3), 0 0 0 5px rgba(255, 255, 255, 0.5);
  transform: scale(1.01);
  z-index: 1;
}

@media (max-width: 768px) {
  section {
    height: 300px;
    border-radius: 5px;
    margin: 15px 0;
  }

  section img {
    border-radius: 5px;
  }
}

@media (max-width: 480px) {
  section {
    height: 220px;
    margin: 10px 0;
  }
}
</style>