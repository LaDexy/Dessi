<template>
    <div>

  <!--Clase que denomina todos los requisitos-->
  
      <div class="TodoDos">



<!--Requisitos para el registro-->



<div class="wrapper">
<div class="form-box login">
<h2>Diseñador</h2>
<form @submit.prevent="submitRegistroDisenador">

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
		<label><input type="radio" v-model="modalidad_trabajo" value="Totalmente_virtual" name="modalidad">

		Metodo remoto</label>
	</div>

	<div class="remember-forgot">
		<label><input type="radio" v-model="modalidad_trabajo" value="Semi_presencial" name="modalidad">

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

	<div>
  <button type="submit" class="Registro">Siguiente (Crear Contraseña)</button>
</div>
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
      modalidad_trabajo: '', // Correcto para radio buttons
      correo_electronico: '',
      tipo_perfil: 'Diseñador' // O 'Marketing' según el componente
    };
  },
  methods: {
    async submitRegistroDisenador() { // O submitRegistroMarketing()
      try {
        // LOG AQUI: Muestra los datos que se van a guardar en localStorage
        console.log('Datos de Diseñador/Marketing ANTES de guardar en localStorage:', {
          nombre_usuario: this.nombre_usuario,
          localidad: this.localidad,
          modalidad_trabajo: this.modalidad_trabajo,
          correo_electronico: this.correo_electronico,
          tipo_perfil: this.tipo_perfil
        });

        // Guardar temporalmente los datos en localStorage
        localStorage.setItem('registroTempData', JSON.stringify({
          nombre_usuario: this.nombre_usuario,
          localidad: this.localidad,
          modalidad_trabajo: this.modalidad_trabajo,
          correo_electronico: this.correo_electronico,
          tipo_perfil: this.tipo_perfil
        }));

        // Emitir evento para mostrar el formulario de creación de contraseña
        this.$emit('MostrarRegistro', 'Clave');
        console.log('Datos de Diseñador/Marketing guardados temporalmente. Pasando a creación de contraseña.');

      } catch (error) {
        console.error('Error al preparar el registro de Diseñador/Marketing:', error);
        alert('Hubo un error al preparar el registro. Por favor, inténtalo de nuevo.');
      }
    }
  }
};
</script>

<style>


/*centrar los requisitos*/
.TodoDos{

position: fixed; /* Fijo en el viewport */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6); /* Fondo oscuro translúcido */
  display: flex; /* Usamos flexbox para centrar el modal */
  justify-content: center; /* Centra horizontalmente */
  align-items: center; /* Centra verticalmente */
  z-index: 9999; /* Asegura que el modal esté por encima de todo */
  /* Opcional: transición para que aparezca suavemente */
  opacity: 1; /* Asumiendo que Vue controla la visibilidad con v-if */
  transition: opacity 0.3s ease;
  backdrop-filter: blur(5px); /* Un ligero desenfoque del fondo */

}

.wrapper {

/* Eliminamos position: absolute, left, top. Ahora está centrado por #Iniciar */
  /* Eliminamos padding: 40px aquí, ya que el .form-box lo tiene */
  font-family: "Times New Roman", serif;
  /* El width y height se definirán en .Boton, que es el contenedor visual */
  display: flex; /* Para centrar el .Boton si es necesario, aunque .Boton ya es flex */
  justify-content: center;
  align-items: center;
  /* Asegura que no se desborde */
  max-width: 90%; /* Limita el ancho máximo del contenedor en pantallas grandes */
  max-height: 90vh; /* Limita la altura máxima para que quepa en el viewport */
  overflow-y: auto; /* Permite desplazamiento si el contenido es muy largo */

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
border-bottom: 2px solid hsl(300, 29%, 78%);
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