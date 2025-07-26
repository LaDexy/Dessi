<template>
  <!--ESTE ES EL TEXTO DEL GESTOR QUE SE OBSERVA EN PAGINA PRINCIPAL-->
  <header class="main-header">
    <div class="header-content">
      <h1 class="header-title">TAKE TO STEP</h1>
    </div>
  </header>
</template>

<script>
export default {
  name: "TituloInicial"
}
</script>

<style scoped>
.main-header {
  width: 100%;
  min-height: 60px;
  background-color: hsl(300, 29%, 78%);
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.header-title {
  color: white;
  margin: 0;
  font-size: 2.5rem;
  font-weight: bold;
  letter-spacing: 2px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .main-header {
    min-height: 50px;
    padding: 0 15px;
  }

  .header-title {
    font-size: 1.8rem;
    text-align: center;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .main-header {
    min-height: 40px;
    padding: 0 10px;
  }
  .header-title {
    font-size: 1.5rem;
  }
}
</style>