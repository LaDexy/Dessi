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
		<input type="text" required>
		<label>Nombre de usuario</label>
	</div>


<!-- Opcion de Localidad-->

	<div class="input-box">
		<span class="icon">
     
    </span>
		<input type="text" required>
		<label>Localidad</label>
	</div>

<!-- Opcion de Modalidad-->

	<div class="remember-forgot">
		<label><input type="checkbox">

		Metodo remoto</label>
	</div>

	<div class="remember-forgot">
		<label><input type="checkbox">

		Metodo Semi-Presencial</label>
	</div>

<!--Opcion de Correo electronico-->
	<div class="input-box">
		<span class="icon">
     
    </span>
		<input type="email" required>
		<label>Correo electronico</label>
	</div>

<!--Boton para registrar datos-->

	<button type="submit" class="Registro">Registrar</button>

	</form>
	</div>

<!--Cierre de requisitos-->

</div>

</div>



    </div>
</template>



<script>

export default {
    name: "RegistroDisenador"
  
}


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