<template>
  <div>

    <!--ESTA ES LA PARTE DE TEXTO INCIIAL EN PAGINA PRINCIPAL-->
    <div class="cuadrado">
      <div class="cuadradito">
        <h3>Transforma tu idea en impacto visual. Tu socio creativo está aquí</h3>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TextoMotivador"
}
</script>

<style scoped>
.cuadrado {
  width: 100%;
  padding: 40px 20px;
  background-color: #ffffff;
  border: 1px solid #ffffff;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
}

.cuadradito {
  text-align: center;
  color: #000000;
  max-width: 800px;
  margin: 0 auto;
}

.cuadradito h3 {
  font-size: 2.2rem;
  line-height: 1.4;
  margin: 0;
  font-weight: normal;
  color: #333;
}

@media (max-width: 768px) {
  .cuadrado {
    padding: 30px 15px;
    min-height: 120px;
  }

  .cuadradito h3 {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .cuadrado {
    padding: 20px 10px;
    min-height: 100px;
  }

  .cuadradito h3 {
    font-size: 1.4rem;
    line-height: 1.3;
  }
}
</style>