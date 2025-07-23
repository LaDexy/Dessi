<!-- components/TarjetasPerfiles.vue -->
<template>
  <div class="TarjetasPerfiles">
    <div class="TarjetasPerfiles-container">
      <div class="TarjetasPerfiles-grid">
        <!-- ¡AQUÍ ES DONDE USAS EL NUEVO COMPONENTE TarjetasIndividuales! -->
        <!-- Ya no hay 'div class="Exterior"' ni el resto del HTML de la tarjeta aquí. -->
        <TarjetasIndividuales
          v-for="profile in profiles"
          :key="profile.id_usuario"
          :profile="profile"
          @send-request="$emit('send-request', profile)"   
          @view-profile="$emit('view-profile', profile)"  
        />
      </div>
    </div>
  </div>
</template>

<script>
// ¡IMPORTANTE! Ahora importas TarjetasIndividuales, no ValorAcumulado ni IconoInteraccion directamente aquí.
import TarjetasIndividuales from './TarjetasIndividuales.vue';

export default {
  name: "TarjetasPerfiles", // El nombre del componente contenedor
  components: {
    TarjetasIndividuales // ¡Registra el nuevo componente hijo!
  },
  props: {
    profiles: { // Este componente sigue recibiendo el array de perfiles
      type: Array,
      required: true,
      default: () => [],
    },
  },
  // No necesitas 'methods' aquí para los botones, ya que los eventos se re-emiten directamente en el template.
};
</script>

<style scoped>
/*
  ¡IMPORTANTE!
  Aquí solo deben quedar los estilos CSS que conciernen al CONTENEDOR de las tarjetas,
  es decir, cómo se organiza la cuadrícula o la lista de tarjetas.

  Los estilos que deben permanecer aquí son:
  .TarjetasPerfiles
  .TarjetasPerfiles-container
  .TarjetasPerfiles-grid

  TODOS los demás estilos que afectan a la apariencia de UNA SOLA TARJETA
  (como .Exterior, .Tarjeta, .Inicio-Tarjeta, .Interes, etc.)
  DEBEN HABER SIDO MOVIDOS a TarjetasIndividuales.vue.
*/

/* Tus estilos existentes para el contenedor de perfiles */
.TarjetasPerfiles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  margin-top: 100px; /* Si este margen es para toda la página, considera moverlo a PaginaCentral o un layout. */
}

.TarjetasPerfiles-container {
  width: 100%; /* O el ancho que desees para el contenedor de la cuadrícula */
  max-width: 1200px; /* Un ancho máximo para centrar el contenido */
}

.TarjetasPerfiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Columnas responsivas */
  gap: 20px;
}

/*
  Si tenías estilos globales como 'body' en este archivo,
  considera moverlos a un archivo CSS global o a App.vue.
*/
</style>