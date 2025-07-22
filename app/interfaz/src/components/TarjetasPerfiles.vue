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
                <IconoInteraccion :totalLikesForo="profile.likes_acumulados_foro" /> 
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
import ValorAcumulado from '@/components/ValorAcumulado.vue'; // Ya existente
import IconoInteraccion from '@/components/IconoInteraccion.vue'; // Importa el nuevo componente

export default {
  name: "TarjetasPerfiles",
  components: {
    ValorAcumulado,
    IconoInteraccion // Registra el nuevo componente
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

/*Imagen (referencia global, considera mover a .Inicio-Tarjeta img si es solo para tarjetas) */
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
  display: flex; /* Añadido: para que el header y footer se organicen bien */
  flex-direction: column; /* Añadido: para que el header y footer se apilen */
  height: 100%; /* Asegura que la tarjeta ocupe la altura completa de su contenedor */
}

/*El encabezado de la tarjeta*/
.Inicio-Tarjeta {
  border-radius: 8px 8px 0 0;
  max-height: 200px;
  height: 200px;
  width: 100%;
  overflow: hidden; /* Asegura que la imagen no se salga */
}

.Inicio-Tarjeta img {
  border-radius: 8px 8px 0 0; /* Aplicar borde de radio solo a la imagen aquí */
  height: 100%; /* La imagen debe ocupar toda la altura del contenedor */
  width: 100%; /* La imagen debe ocupar todo el ancho del contenedor */
  object-fit: cover; /* Recorta la imagen para que quepa sin distorsión */
}


/*Boton de solicitud*/
.Interes {
  background-color: rgb(162, 162, 250);
  border: none; /* Eliminar el borde por defecto */
  color: white; /* Color de texto blanco */
  border-radius: 50px;
  padding: .6rem 1.2rem; /* Ajuste del padding para que se vea mejor */
  cursor: pointer;
  transition: background-color 0.3s ease; /* Transición suave al pasar el ratón */
}

.Interes:hover {
  background-color: rgb(120, 120, 240); /* Un tono más oscuro al pasar el ratón */
}

/*Parte externa de tarjeta*/
.Tarjeta footer {
  padding: 0 1rem;
  text-align: center;
  flex-grow: 1; /* Permite que el footer ocupe el espacio restante */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Para empujar los botones hacia abajo si hay espacio */
}

/*Ajuste de tarjetas*/
.Exterior {
  /* No necesitas flex-flow: wrap aquí, ya que el contenedor .TarjetasPerfiles ya lo maneja */
  /* Removemos height: 100% si el .Tarjeta ya lo maneja */
  display: flex; /* Asegura que la tarjeta hija se estire en altura */
  align-items: stretch; /* Asegura que todas las tarjetas tengan la misma altura */
}

/* Estilos para el texto de la tarjeta */
.Texto-Tarjeta {
  margin-top: 0.5rem;
  font-size: 1em;
  color: #555;
}

.Descripcion-Tarjeta {
  margin-top: 0.5rem;
  min-height: 60px; /* Aumentado para descripciones más largas, ajusta según necesidad */
  flex-grow: 1; /* Permite que la descripción empuje los botones hacia abajo */
  color: #666;
  font-size: 0.9em;
  line-height: 1.4;
}

.buttons-container {
  display: flex;
  justify-content: space-around;
  gap: 10px;
  margin-top: 1rem;
  padding-bottom: 1rem;
}

/* Estilos generales que podrían estar en un archivo global o en App.vue */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f4f4f4;
}

/* Ajusta los estilos para alinear el nombre, medalla y corazón */
.Categoria-Tarjeta {
  margin-top: 1rem;
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 8px; /* Espacio entre los elementos (nombre, medalla, corazón) */
  flex-wrap: wrap; /* Permite que los elementos se ajusten en varias líneas si es necesario */
  padding: 0 5px; 
}

.profile-name {
  font-weight: bold;
  font-size: 1.1em;
  color: #333;
}

</style>