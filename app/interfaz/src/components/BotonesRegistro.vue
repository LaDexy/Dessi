<template>

<div>

     <!--Boton para iniciar sesion-->

    <div class="Inicio">

        <div @click="$emit('MostrarRegistro', 'Iniciar')"><button>Iniciar Sesion</button></div>

    </div>


<!--Menu desplegable para registro de perfil-->

    <div class="dropdown">

        <button @click="toggleDropdown">Registrarse</button>

            <div class="content">

                <div @click="$emit('MostrarRegistro', 'Emprendedor'); toggleDropdown()"><a>Emprendedor</a></div>
                <div @click="$emit('MostrarRegistro', 'Diseñador'); toggleDropdown()"><a>Diseñador</a></div>
                <div @click="$emit('MostrarRegistro', 'Marketing'); toggleDropdown()"><a>Marketing</a></div>

            </div>
    </div>


</div>

</template>

<script>


export default {
  // Ya no necesitamos importar los componentes de registro aquí
  // components: { ... } // Eliminar esta sección si solo contenía los componentes de registro
  data() {
    return {
      dropdownAbierto: false // Controla si el menú desplegable está abierto
    };
  },
  methods: {
    toggleDropdown() {
      this.dropdownAbierto = !this.dropdownAbierto;
    }
  }
};



</script>

<style scoped>

/*Boton de Inicio de Sesion*/
.Inicio{

left: 75%;
position: relative;
display: inline-block;
top: 9.5px;

}

.Inicio button{

background-color:hsl(300, 29%, 78%);
color: white;
padding: 10px 15px;
border: none;
cursor: pointer;

}

/*Menu desplegable de Registro*/

.dropdown{

left: 80%;
position: relative;
display: inline-block;
top: 10px;

}

.dropdown button{


background-color: hsl(300, 29%, 78%);
color: white  ;
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
background-color:hsl(300, 29%, 78%);
min-width: 100px;
box-shadow: 2px 2px 5px  hsla(0, 0%, 0%, 0.8) ;
}

.dropdown:hover .content{

display: block;

}

.dropdown:hover button{

background-color: #D8BFD8;

}


.dropdown a:hover{

background-color: #D8BFD8;

}

.content{

color: white;

}

</style>
