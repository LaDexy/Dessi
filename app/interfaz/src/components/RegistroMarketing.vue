<template>
  <div>
    <!--ESTA ES LA VENTANA EMERGENTE PARA REGISTRO DE MARKETING-->
    <div class="TodoTres">
      <div class="wrapper">
        <div class="form-box login">
          <h2>Marketing</h2>
          <form @submit.prevent="submitRegistroMarketing">
            <div class="Cerrar" @click="$emit('cerrar')">
              <span class="icon-close">
                <i class="fa-regular fa-circle-xmark" style="color: #0a0f18;"></i>
              </span>
            </div>

            <div class="input-box">
              <span class="icon"></span>
              <input type="text" v-model="nombre_usuario" required>
              <label>Nombre de usuario</label>
            </div>

            <div class="input-box">
              <span class="icon"></span>
              <input type="text" v-model="localidad" required>
              <label>Localidad</label>
            </div>

            <div class="remember-forgot">
              <label><input type="radio" v-model="modalidad_trabajo" value="Totalmente_virtual" name="modalidad">
                Metodo remoto</label>
            </div>

            <div class="remember-forgot">
              <label><input type="radio" v-model="modalidad_trabajo" value="Semi_presencial" name="modalidad">
                Metodo Semi-Presencial</label>
            </div>

            <div class="input-box">
              <span class="icon"></span>
              <input type="email" v-model="correo_electronico" required>
              <label>Correo electronico</label>
            </div>

            <div>
              <button type="submit" class="Registro">Siguiente</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nombre_usuario: '',
      localidad: '',
      modalidad_trabajo: '',
      correo_electronico: '',
      tipo_perfil: 'Marketing'
    };
  },
  methods: {
    async submitRegistroMarketing() {
      console.log('Datos de Diseñador/Marketing ANTES de guardar en localStorage:', {
        nombre_usuario: this.nombre_usuario,
        localidad: this.localidad,
        modalidad_trabajo: this.modalidad_trabajo,
        correo_electronico: this.correo_electronico,
        tipo_perfil: this.tipo_perfil
      });

      localStorage.setItem('registroTempData', JSON.stringify({
        nombre_usuario: this.nombre_usuario,
        localidad: this.localidad,
        modalidad_trabajo: this.modalidad_trabajo,
        correo_electronico: this.correo_electronico,
        tipo_perfil: this.tipo_perfil
      }));

      this.$emit('MostrarRegistro', 'Clave');
      console.log('Datos de Diseñador/Marketing guardados temporalmente. Pasando a creación de contraseña.');
    }
  }
};
</script>

<style>
.TodoTres {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  opacity: 1;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(5px);
}

.wrapper {
  position: relative;
  width: 450px;
  height: 600px;
  background: white;
  border: 5px solid rgba(0, 0, 0, 0.5);
  border-radius: 100px;
  backdrop-filter: blur(20px);
  box-shadow: 0 0 30px rgba(0, 0, 0, .5);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  opacity: 0.9;
}

.wrapper .form-box {
  width: 100%;
  padding: 40px;
}

.wrapper .icon-close {
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
  transition: .5s;
}

.input-box input:focus~label,
.input-box input:valid~label {
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
  color: #7598b3;
  text-decoration: none;
}

.remember-forgot a:hover {
  text-decoration: underline;
}

.Registro {
  width: 100%;
  height: 45px;
  background: hsl(300, 29%, 78%);
  border: none;
  outline: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  color: #fff;
  font-weight: 500;
}
</style>