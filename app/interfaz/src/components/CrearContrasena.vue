<template>

  <!--ESTA ES LA PARTE DONDE SE DESPLIEGA LA VENTANITA PARA CREACION DE CONTRASEÑA PAA PODER INICIAR-->
  <div id="Contraseña">
    <div class="Clave">
      <div class="General">
        <div class="form-box login">
          <h2>Creacion de contraseña</h2>
          <form @submit.prevent="submitCreacionContrasena">
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
              <input type="password" v-model="contrasena" required />
              <label>Contraseña</label>
            </div>

            <div class="input-box">
              <span class="icon"> </span>
              <input type="password" v-model="validar_contrasena" required />
              <label>Validar contraseña</label>
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
      contrasena: '',
      validar_contrasena: '',
      registroTempData: null
    };
  },
  mounted() {
    console.log('CrearContrasena.vue montado.');
    const temp = localStorage.getItem('registroTempData');
    if (temp) {
      this.registroTempData = JSON.parse(temp);
      console.log('Datos temporales de registro recuperados:', this.registroTempData);
    } else {
      console.warn('No se encontraron datos de registro temporales. El usuario debería empezar por el formulario de perfil.');
      this.$emit('MostrarRegistro', null);
    }
  },
  methods: {
    async submitCreacionContrasena() {
      console.log('Método submitCreacionContrasena iniciado.');

      if (this.contrasena !== this.validar_contrasena) {
        alert('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
        console.log('Error: Contraseñas no coinciden.');
        return;
      }

      if (!this.registroTempData) {
        alert('Error: Datos de registro incompletos. Por favor, comienza el registro de nuevo.');
        console.log('Error: Datos temporales de registro faltantes.');
        this.$emit('MostrarRegistro', null);
        return;
      }

      const userData = {
        ...this.registroTempData,
        contrasena: this.contrasena
      };

      console.log('Enviando datos de registro al backend:', userData);

      try {
        const response = await axios.post('http://localhost:4000/api/register', userData);
        console.log('Respuesta del backend recibida:', response.status, response.data);

        if (response.status === 201) {
          alert('¡Registro exitoso! Ya puedes iniciar sesión.');
          localStorage.removeItem('registroTempData');
          this.$emit('cerrar');
          console.log('Registro exitoso y datos temporales eliminados.');
        } else {
          alert('Hubo un error al registrar el usuario: ' + (response.data.message || 'Error desconocido'));
          console.error('Error de registro (respuesta no 201):', response.data);
        }
      } catch (error) {
        console.error('Error al enviar el registro (catch):', error);
        if (error.response) {
          console.error('Respuesta de error del servidor:', error.response.status, error.response.data);
          if (error.response.status === 409) {
            alert('El correo electrónico ya está registrado. Por favor, usa otro o inicia sesión.');
          } else if (error.response.status === 400) {
            alert('Datos incompletos o inválidos: ' + error.response.data.message);
          } else {
            alert('Error en el servidor: ' + (error.response.data.message || 'Error desconocido'));
          }
        } else if (error.request) {
          console.error('No se recibió respuesta del servidor. ¿Está corriendo el backend?', error.request);
          alert('No se pudo conectar con el servidor. Asegúrate de que el servidor Express esté corriendo en http://localhost:4000.');
        } else {
          console.error('Error de configuración de la solicitud:', error.message);
          alert('Error desconocido al registrar: ' + error.message);
        }
      }
    }
  }
};
</script>

<style>
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