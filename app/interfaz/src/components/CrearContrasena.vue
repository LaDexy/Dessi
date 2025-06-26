<template>
  <div id="Contraseña">
    <!--Clase que denomina todos los requisitos-->

    <div class="Clave">
      <!--Requisitos para el registro-->

      <div class="General">
        <div class="form-box login">
          <h2>Creacion de contraseña</h2>
          <form action="#">
            <!--Icono de Cerrar-->
            <div class="Cerrar" @click="$emit('cerrar')">
              <span class="icon-close">
                <i
                  class="fa-regular fa-circle-xmark"
                  style="color: #0a0f18"
                ></i>
              </span>
            </div>

            <!--OPcion de crear contraseña-->
            <div class="input-box">
              <span class="icon"> </span>
              <input type="password" required />
              <label>Contraseña</label>
            </div>

            <!--OPcion de comprobar contraseña -->
            <div class="input-box">
              <span class="icon"> </span>
              <input type="password" required />
              <label>Validar contraseña</label>
            </div>

            <!--Boton para registrar datos-->

            <button type="submit" class="Registro">Iniciar</button>
          </form>
        </div>

        <!--Cierre de requisitos-->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "InicioSesion"
}
</script>

<style>
/*centrar los requisitos*/
.Clave {
  position: absolute;
  left: 500px;
  top: 50px;
  padding: 40px;
  font-family: "Times New Roman", serif;
}

.General {
  position: relative;
  width: 450px;
  height: 500px;
  background: white;
  border: 5px solid rgba(0, 0, 0, 0.5);
  border-radius: 100px;
  backdrop-filter: blur(20px);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  opacity: 0.9;
}

.General .form-box {
  width: 100%;
  padding: 40px;
}

.General .icon-close {
  position: absolute;
  top: 18px;
  right: 28px;
  width: 45px;
  height: 45px;
  font-size: 2em;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom-left-radius: 100px;
  cursor: pointer;
}

.form-box h2 {
  font-size: 3em;
  color: #000000;
  text-align: center;
}

.input-box {
  position: relative;
  width: 100%;
  height: 50px;
  border-bottom: 2px solid #000000;
  margin: 30px 0;
}

.input-box label {
  position: absolute;
  top: 50%;
  left: 5px;
  transform: translateY(-50%);
  font-size: 1.3em;
  color: #000000;
  font-weight: 500;
  pointer-events: none;
  transition: 0.5s;
}

.input-box input:focus ~ label,
.input-box input:valid ~ label {
  top: -5px;
}

.input-box input {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1.5em;
  color: #000000;
  font-weight: 600;
  padding: 0 35px 0 5px;
}

.remember-forgot {
  font-size: 1em;
  color: #000000;
  font-weight: 500;
  margin: -15px 0 15px;
  display: flex;
  justify-content: space-between;
}

.remember-forgot label input {
  accent-color: #861c78;
  margin-right: 3px;
}

.remember-forgot a {
  color: #000000;
  text-decoration: none;
}

.remember-forgot a:hover {
  text-decoration: underline;
}

.Registro {
  width: 100%;
  height: 45px;
  background: #440857;
  border: none;
  outline: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  color: #fff;
  font-weight: 500;
}
</style>