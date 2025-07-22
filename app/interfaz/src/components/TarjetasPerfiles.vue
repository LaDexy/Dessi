<template>
  <div class="TarjetasPerfiles">
    <div class="TarjetasPerfiles-container">
      <div class="TarjetasPerfiles-grid">
        <div class="Exterior" v-for="profile in profiles" :key="profile.id_usuario">
          <div class="Tarjeta">
            <header class="Inicio-Tarjeta">
              <img :src="profile.foto_perfil_url || require('../assets/Usuario.png')" :alt="`Foto de perfil de ${profile.nombre_usuario}`" />
            </header>

            <footer class="Final-Tarjeta">
              <div class="Categoria-Tarjeta">
                <span class="profile-name">{{ profile.nombre_usuario }}</span>
                <ValorAcumulado :reputacion="profile.reputacion" />
              </div>

              <div class="Texto-Tarjeta">
                <h3>{{ profile.tipo_perfil }}</h3>
              </div>

              <div class="Descripcion-Tarjeta">
                <p>{{ profile.descripcion_perfil || 'Aún no ha añadido una descripción.' }}</p>
              </div>
              
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
import ValorAcumulado from '@/components/ValorAcumulado.vue'; // Asegúrate de que la ruta sea correcta

export default {
  name: "TarjetasPerfiles",
  components: {
    ValorAcumulado // Declara el componente para que pueda ser usado en el template
  },
  props: {
    profiles: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
};
</script>

<style>

/*Todos los perfiles*/
.TarjetasPerfiles {
 
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
.Tarjeta {
  position: relative;
  max-width: 100%;
  border-radius: 8px;
  margin: 1rem;
  box-shadow: 0 0 12px #d7d7d7;
}

/*El encabezado de la tarjeta*/
.Inicio-Tarjeta img {
  border-radius: 8px 8px 0 0;
  max-height: 200px;
  height: 200px;
  width: 100%;
}

/*Nombre de usuario Y la reputación juntos */
.Categoria-Tarjeta {
  margin-top: 1rem;
  display: flex; /* Añadir display: flex para alinear horizontalmente */
  align-items: center; /* Alinear verticalmente al centro */
  justify-content: center; /* Centrar horizontalmente el contenido */
  gap: 5px; /* Espacio entre el nombre y la medalla */
}

.profile-name {
  font-weight: bold; /* Puedes hacer el nombre más prominente */
  font-size: 1.1em;
}


/*Boton de solicitud*/
.Interes {
  background-color: rgb(162, 162, 250);
  border-radius: 50px;
  padding: .2rem .5rem;
}

/*Parte externa de tarjeta*/
.Tarjeta footer {
  padding: 0 1rem;
  text-align: center; /* Centra el contenido del footer si quieres */
}

/*Ajuste de tarjetas*/
.Exterior {
  display: flex;
  flex-flow: wrap;
}

/* Estilos para el texto de la tarjeta */
.Texto-Tarjeta {
  margin-top: 0.5rem;
}

.Descripcion-Tarjeta {
  margin-top: 0.5rem;
  min-height: 40px; /* Asegura un mínimo de altura para la descripción */
}

.buttons-container {
  display: flex;
  justify-content: space-around; /* O center, o flex-start, según prefieras */
  gap: 10px;
  margin-top: 1rem;
  padding-bottom: 1rem; /* Espacio debajo de los botones */
}
</style>