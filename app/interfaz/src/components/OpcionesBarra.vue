<template>
  <div>
    <!--ESTA ES LA PARTE DEL ICONO DE INTERROGACION DE PAGINA PRINCIPAL DONDE SE AGREGARA COMO UN INSTRUCTIVO DE USUARIO
    DE LO QUE SE PUEDA HACER EN LA APP (MAS QUE TODO INFORMATIVO PARA EL CONVENIO) AUN NO ESTA TERMINADA-->
    <div class="Menu">
      <button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom" aria-controls="offcanvasBottom">
        <i class="fa-regular fa-circle-question fa-2xl" style="color: #ffffff;"></i>
      </button>

      <div class="offcanvas offcanvas-bottom" tabindex="-1" id="offcanvasBottom" aria-labelledby="offcanvasBottomLabel">
        <div class="offcanvas-header">
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

<style scoped>
.Menu {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
}

.Menu .btn {
  background-color: hsl(300, 29%, 78%) !important;
  border-color: hsl(300, 29%, 78%) !important;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.Menu .btn:hover {
  background-color: #d18cc4;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.Menu .btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.Menu .fa-circle-question {
  color: #ffffff !important;
  font-size: 2rem;
}

.offcanvas {
  background-color: #f8f8f8;
  color: #333;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
}

.offcanvas-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 10px;
}

.offcanvas-header p {
  margin-bottom: 0;
}

.offcanvas-header .btn-primary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
  border-radius: 5px;
  min-width: 120px;
  padding: 10px 20px;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.offcanvas-header .btn-primary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

.collapse .card-body {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-top: 10px;
  padding: 15px;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #444;
}

@media (max-width: 768px) {
  .Menu {
    bottom: 15px;
    left: 15px;
  }

  .Menu .btn {
    width: 50px;
    height: 50px;
  }

  .Menu .fa-circle-question {
    font-size: 1.6rem;
  }

  .offcanvas-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .offcanvas-header .btn-primary {
    width: 100%;
    text-align: left;
  }
}

@media (max-width: 480px) {
  .Menu {
    bottom: 10px;
    left: 10px;
  }

  .Menu .btn {
    width: 45px;
    height: 45px;
  }

  .Menu .fa-circle-question {
    font-size: 1.4rem;
  }
}
</style>