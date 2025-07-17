<template>
  <div class="TarjetasPerfiles">
  <div class="TarjetasPerfiles-container">
    <div class="TarjetasPerfiles-grid">
      <!-- Usamos v-for para iterar sobre el array 'profiles' que viene como prop -->
      <div class="Exterior" v-for="profile in profiles" :key="profile.id_usuario">
        <div class="Tarjeta">
          <header class="Inicio-Tarjeta">
            <!-- La imagen de perfil será dinámica. Usamos una imagen por defecto si no hay URL. -->
            <img :src="profile.foto_perfil_url || require('../assets/Usuario.png')" :alt="`Foto de perfil de ${profile.nombre_usuario}`" />
          </header>

          <footer class="Final-Tarjeta">
            <div class="Categoria-Tarjeta">
              <!-- Nombre de usuario dinámico -->
              <span>{{ profile.nombre_usuario }}</span>
            </div>

            <div class="Texto-Tarjeta">
              <!-- Profesión (tipo_perfil) dinámica -->
              <h3>{{ profile.tipo_perfil }}</h3>
            </div>

            <div class="Descripcion-Tarjeta">
              <!-- Descripción dinámica -->
              <p>{{ profile.descripcion_perfil || 'Aún no ha añadido una descripción.' }}</p>
            </div>
            
            <!-- Botones (pueden tener lógica de click más adelante si lo necesitas) -->
            <div class="buttons-container">
                <button class="Interes">Solicitud</button>
                <button class="Interes">Ver perfil</button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  name: "TarjetasPerfiles",
  props: {
    // Definimos la prop 'profiles' que esperamos recibir
    profiles: {
      type: Array, // Esperamos un array de objetos de perfil
      required: true,
      default: () => [], // Valor por defecto si no se pasa nada
    },
  },
};
</script>

<style>

/*Todos los perfiles*/

.TarjetasPerfiles{

  display: flex;
  flex-wrap: wrap;
  justify-content: center; 
  gap: 20px; 
  padding: 20px; 
  margin-top: 100px;

}


/*Imagen*/

img {

max-width: 100%;

}

/*Tarjeta*/
.Tarjeta{

position: relative;
max-width: 100%;
border-radius: 8px;
margin: 1rem;
box-shadow: 0 0 12px #d7d7d7;

}

/*El encabezado de la tarjeta*/

.Inicio-Tarjeta img{

border-radius: 8px 8px 0 0;
max-height: 200px;
height: 200px;
width: 100%;

}

/*Nombre de usuario*/

.Categoria-Tarjeta{

margin-top: 1rem;

}

/*Boton de solicitud*/

.Interes{

background-color: rgb(162, 162, 250);
border-radius: 50px;
padding: .2rem .5rem;

}

/*Parte externa de tarjeta*/

.Tarjeta footer{

padding: 0 1rem;

}

/*Ajuste de tarjetas*/

.Exterior{

display: flex;
flex-flow: wrap;

}

</style>
