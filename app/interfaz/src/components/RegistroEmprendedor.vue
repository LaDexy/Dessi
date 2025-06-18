<template>
    <div>

<!--Imagen de fondo-->
<div class="Fondo">
<img src="../assets/Prueba.jpg" alt="...">
</div>

  <!--Menu desplegable para registro-->

<div class="dropdown">

<button>Registrarse</button>
<div class="content">

<a href="">Emprendedor</a>
<a href="">Diseñador</a>
<a href="">Marketing</a>

</div>
</div>


  <!--Clase que denomina todos los requisitos-->
  
      <div class="Requisitos">



<!--Requisitos para el registro-->



<div class="wrapper">
<div class="form-box login">
<h2>Emprendedor</h2>
<form action="#">

<!--Icono de Cerrar-->

<span class="icon-close">

<i class="fa-solid fa-xmark"></i>

</span>

<!--OPcion de Correo electronico-->
	<div class="input-box">
		<span class="icon">
     
    </span>
		<input type="email" required>
		<label>Email</label>
	</div>

<!--OPcion de contraseña-->
	<div class="input-box">
    
		<span class="icon">
 
    </span>
		<input type="password" required>
		<label>Password</label>


	</div>

  <!--Opcion para recordar contraseña-->
	<div class="remember-forgot">
		<label><input type="checkbox">

		Recuerdame</label>
	</div>

 
 <!--Olvido de contraseña-->
<div class="remember-forgot">
<div>
<a href="#">Olvide contraseña</a>
</div>
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
    name: "RegistroEmprendedor"
  
}


</script>

<style>

/*fondo*/

.Fondo{

/*Imagen de fondo*/
position: absolute;

}

/*Menu desplegable de Registro*/

.dropdown{

left: 40%;
position: relative;
display: inline-block;
top: 10px;

}

.dropdown button{


background-color: antiquewhite;
color: white;
padding: 10px 15px;
border: none;
cursor: pointer;


}

.dropdown a{

display: block;
color: black;
text-decoration: none;
padding: 10px 15px;

}

.dropdown .content{

display: none;
position: absolute;
background-color: antiquewhite;
min-width: 100px;
box-shadow: 2px 2px 5px  hsla(0, 0%, 0%, 0.8) ;
}

.dropdown:hover .content{

display: block;

}

.dropdown:hover button{

background-color: hsl(0, 0%, 70%);

}


.dropdown a:hover{

background-color: hsl(0, 0%, 90%);

}

/*centrar los requisitos*/
.Requisitos{

position: relative;
left: 500px;
top: 50px;
padding: 40px;


}

.wrapper {

position: relative;
width: 400px;
height: 400px;
background: transparent;
border: 2px solid rgba(0, 0, 0, 0.5);
border-radius: 20px;
backdrop-filter: blur(20px);
box-shadow: 0 0 30px rgba(0, 0, 0, .5);
display: flex;
justify-content: center;
align-items: center;
overflow: hidden;

}

.wrapper .form-box {

width: 100%;
padding: 40px;

}

.wrapper .icon-close{

position: absolute;
top: 0;
right: 0;
width: 45px;
height: 45px;
background: #162938;
font-size: 2em;
color: #fff;
display: flex;
justify-content: center;
align-items: center;
border-bottom-left-radius: 20px;
cursor: pointer;
z-index: 1;

}

.form-box h2{

font-size: 2em;
color: #2e6fa0;
text-align: center;

}

.input-box{

position: relative;
width: 100%;
height: 50px;
border-bottom: 2px solid #5f7e96;
margin: 30px 0;

}

.input-box label{

position: absolute;
top: 50%;
left: 5px;
transform: translateY(-50%);
font-size: 1em;
color: #446a88;
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
font-size: 1em;
color: #6290b4;
font-weight: 600;
padding: 0 35px 0 5px;

}

.remember-forgot{

font-size: .9em;
color: #76bcf1;
font-weight: 500;
margin: -15px 0 15px;
display: flex;
justify-content: space-between;

}

.remember-forgot label input{

accent-color: #85b8df;
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
background: #162938;
border: none;
outline: none;
border-radius: 6px;
cursor: pointer;
font-size: 1em;
color: #fff;
font-weight: 500;

}



</style>