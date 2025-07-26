<template>
  <!--ESTA ES LA PARTE DE LA VENTANA EMERGENTE PARA INCIIAR SESION-->
  <div id="Iniciar">
    <div class="TodoCuatro">
      <div class="Boton">
        <div class="form-box login">
          <h2>Iniciar Sesion</h2>
          <form @submit.prevent="submitLogin">
            <div class="Cerrar" @click="$emit('cerrar')">
              <span class="icon-close">
                <i
                  class="fa-regular fa-circle-xmark"
                  style="color: #0a0f18"
                ></i>
              </span>
            </div>

            <div class="input-box">
              <span class="icon"> </span>
              <input type="Email" v-model="correo_electronico" required />
              <label>Correo electronico</label>
            </div>

            <div class="input-box">
              <span class="icon"> </span>
              <input type="password" v-model="contrasena" required />
              <label>Password</label>
            </div>

            <div class="remember-forgot">
              <label
                ><input type="checkbox" v-model="recordar_contrasena" />

                Recordar contraseña</label
              >
            </div>

            <div class="remember-forgot">
              <div>
                <a href="#">Olvide contraseña</a>
              </div>
            </div>

            <button type="submit" class="Registro">Iniciar</button>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      correo_electronico: '',
      contrasena: '',
      recordar_contrasena: false
    };
  },
  methods: {
    async submitLogin() {
      console.log('Método submitLogin iniciado.');
      console.log('Datos a enviar al backend:', {
        correo_electronico: this.correo_electronico,
        contrasena: this.contrasena.replace(/./g, '*')
      });

      try {
        const response = await axios.post('http://localhost:4000/api/login', {
          correo_electronico: this.correo_electronico,
          contrasena: this.contrasena
        });

        console.log('Respuesta del backend recibida:', response.status, response.data);

        if (response.status === 200) {
          const { token, tipo_perfil, id_usuario, nombre_usuario } = response.data;

          const storage = this.recordar_contrasena ? localStorage : sessionStorage;
          storage.setItem('userToken', token);
          storage.setItem('userProfile', tipo_perfil);
          storage.setItem('userId', id_usuario);
          storage.setItem('userName', nombre_usuario);

          alert('¡Inicio de sesión exitoso!');
          this.$emit('cerrar');

          this.$emit('loginExitoso');
          console.log('Usuario logueado y datos almacenados:', response.data);

        } else {
          alert('Error desconocido al iniciar sesión.');
        }
      } catch (error) {
        console.error('Error al iniciar sesión (catch):', error);
        if (error.response) {
          console.error('Respuesta de error del servidor:', error.response.status, error.response.data);
          if (error.response.status === 401) {
            alert('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
          } else if (error.response.status === 400) {
            alert('Datos incompletos: ' + error.response.data.message);
          } else {
            alert('Error en el servidor: ' + (error.response.data.message || 'Error desconocido'));
          }
        } else if (error.request) {
          console.error('No se recibió respuesta del servidor. ¿Está corriendo el backend?', error.request);
          alert('No se pudo conectar con el servidor. Asegúrate de que el servidor Express esté corriendo en http://localhost:4000.');
        } else {
          console.error('Error de configuración de la solicitud:', error.message);
          alert('Error desconocido al iniciar sesión: ' + error.message);
        }
      }
    }
  }
};
</script>

<style>
.TodoCuatro {
  top: 50px;
  padding: 40px;
  font-family: "Times New Roman", serif;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2500;
}

.Boton {
  position: relative;
  width: 450px;
  height: 400px;
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

.Boton .form-box {
  width: 100%;
  padding: 40px;
}

.Boton .icon-close {
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
  accent-color: hsl(300, 29%, 78%);
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