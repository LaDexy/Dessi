<template>
    <div>

  <!--Clase que denomina todos los requisitos-->
  
      <div class="TodoDos">



<!--Requisitos para el registro-->



<div class="wrapper">
<div class="form-box login">
<h2>Diseñador</h2>
<form action="#">

<!--Icono de Cerrar-->
<div class="Cerrar" @click="$emit('cerrar')">
	<span class="icon-close">

<i class="fa-regular fa-circle-xmark" style="color: #0a0f18;"></i>

</span>
</div>

<!-- Opcion de Nombre de usuario-->

	<div class="input-box">
		<span class="icon">
     
    </span>
		<input type="text" v-model="nombre_usuario" required>
		<label>Nombre de usuario</label>
	</div>


<!-- Opcion de Localidad-->

	<div class="input-box">
		<span class="icon">
     
    </span>
		<input type="text" v-model="localidad" required>
		<label>Localidad</label>
	</div>

<!-- Opcion de Modalidad-->

	<div class="remember-forgot">
		<label><input type="checkbox" v-model="modalidad_trabajo" value="Totalmente_virtual">

		Metodo remoto</label>
	</div>

	<div class="remember-forgot">
		<label><input type="checkbox" v-model="modalidad_trabajo" value="Semi_presencial">

		Metodo Semi-Presencial</label>
	</div>

<!--Opcion de Correo electronico-->
	<div class="input-box">
		<span class="icon">
     
    </span>
		<input type="email" v-model="correo_electronico" required>
		<label>Correo electronico</label>
	</div>

<!--Boton para registrar datos-->

	<div @click="$emit('MostrarRegistro', 'Clave')"><button type="submit" class="Registro">Registrar</button></div>

	</form>
	</div>


<!--Cierre de requisitos-->

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
      modalidad_trabajo: [], // Usar un array para checkboxes
      correo_electronico: '',
      tipo_perfil: 'Diseñador' // Definido para este componente
    };
  },
  methods: {
    async submitRegistroDisenador() {
      try {
        // Guardar temporalmente los datos en localStorage
        localStorage.setItem('registroTempData', JSON.stringify({
          nombre_usuario: this.nombre_usuario,
          localidad: this.localidad,
          modalidad_trabajo: this.modalidad_trabajo.join(','), // Unir para guardar como string
          correo_electronico: this.correo_electronico,
          tipo_perfil: this.tipo_perfil
        }));

        // Emitir evento para mostrar el formulario de creación de contraseña
        this.$emit('MostrarRegistro', 'Clave');
        console.log('Datos de Diseñador guardados temporalmente. Pasando a creación de contraseña.');

      } catch (error) {
        console.error('Error al preparar el registro de diseñador:', error);
        alert('Hubo un error al preparar el registro. Por favor, inténtalo de nuevo.');
      }
    }
  }
};


</script>

<style>


/*centrar los requisitos*/
.TodoDos{

position: absolute;
left: 500px;
top: 50px;
padding: 40px;
font-family: "Times New Roman", serif;

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

.wrapper .icon-close{

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

.form-box h2{

font-size: 3em;
color: #000000;
text-align: center;

}

.input-box{

position: relative;
width: 100%;
height: 50px;
border-bottom: 2px solid #000000;
margin: 30px 0;

}

.input-box label{

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
.input-box input:valid~label{

top: -5px;

}

.input-box input{

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

.remember-forgot{

font-size: 1em;
color: #000000;
font-weight: 500;
margin: -15px 0 15px;
display: flex;
justify-content: space-between;

}

.remember-forgot label input{

accent-color: #861c78;
margin-right: 3px;

}

.remember-forgot a {

color: #7598b3;
text-decoration: none;

}

.remember-forgot a:hover{

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