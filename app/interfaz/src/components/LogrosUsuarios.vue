<template>

  <!--ESTA ES LA PARTE DE LOS TEXTOS DE LOGROS DE PAGINA PRINCIPAL-->
  <section class="logros-section">
    <div class="logros-title-container">
      <h1>Logros</h1>
    </div>

    <div class="logros-text-container">
      <div class="emprendedor-text">
        <h4>Mayor visibilidad y alcance de tu marca</h4>
      </div>

      <div class="disenador-text">
        <h4>Tu marca cobrará vida con un diseño impactante</h4>
      </div>

      <div class="marketing-text">
        <h4>Aumentaremos tu visibilidad y reconocimiento de marca</h4>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "LogrosUsuarios"
}
</script>

<style scoped>
.logros-section {
  width: 100%;
  padding: 40px 20px;
  box-sizing: border-box;
  text-align: center;
  background-color: #f8f8f8;
  margin-top: 30px;
}

.logros-title-container h1 {
  font-size: 2.8rem;
  color: #333;
  margin-bottom: 30px;
  font-weight: bold;
}

.logros-text-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.emprendedor-text,
.disenador-text,
.marketing-text {
  flex: 1 1 300px;
  max-width: 380px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  text-align: center;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emprendedor-text h4,
.disenador-text h4,
.marketing-text h4 {
  font-size: 1.3rem;
  color: #555;
  line-height: 1.4;
  margin: 0;
}

@media (max-width: 768px) {
  .logros-section {
    padding: 30px 15px;
  }

  .logros-title-container h1 {
    font-size: 2.2rem;
    margin-bottom: 25px;
  }

  .logros-text-container {
    gap: 20px;
  }

  .emprendedor-text,
  .disenador-text,
  .marketing-text {
    flex: 1 1 calc(50% - 20px);
    max-width: calc(50% - 20px);
    padding: 15px;
    min-height: 100px;
  }
}

@media (max-width: 480px) {
  .logros-section {
    padding: 20px 10px;
  }

  .logros-title-container h1 {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }

  .logros-text-container {
    gap: 15px;
  }

  .emprendedor-text,
  .disenador-text,
  .marketing-text {
    flex: 1 1 100%;
    max-width: 100%;
    padding: 15px;
    min-height: unset;
  }

  .emprendedor-text h4,
  .disenador-text h4,
  .marketing-text h4 {
    font-size: 1.1rem;
  }
}
</style>