<!-- components/TarjetasIndividuales.vue -->
<template>
  <div class="Exterior">
    <div class="Tarjeta">
      <header class="Inicio-Tarjeta">
        <img :src="profile.foto_perfil_url || require('../assets/Usuario.png')" :alt="`Foto de perfil de ${profile.nombre_usuario}`" />
      </header>

      <footer class="Final-Tarjeta">
        <div class="Categoria-Tarjeta">
          <span class="profile-name">{{ profile.nombre_usuario }}</span>
          <ValorAcumulado :reputacion="profile.reputacion" />
          <IconoInteraccion :totalLikesForo="profile.reaccion_acumulada" />
        </div>

        <div class="Texto-Tarjeta">
          <h3>{{ profile.tipo_perfil }}</h3>
        </div>

        <div class="Descripcion-Tarjeta">
          <p>{{ profile.descripcion_perfil || 'Aún no ha añadido una descripción.' }}</p>
        </div>

        <div class="buttons-container">
          <!-- Botón de Solicitud: Emite un evento 'send-request' con el perfil actual -->
          <button class="Interes" @click="sendRequest">Solicitud</button>
          <!-- Botón de Ver perfil: Emite un evento 'view-profile' con el perfil actual -->
          <button class="Interes" @click="viewProfile">Ver perfil</button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
// ¡IMPORTANTE! Estas importaciones deben estar aquí, en el componente de la tarjeta individual
import ValorAcumulado from '@/components/ValorAcumulado.vue';
import IconoInteraccion from '@/components/IconoInteraccion.vue';

export default {
  name: "TarjetasIndividuales", // <-- El nombre del componente es TarjetasIndividuales
  components: {
    ValorAcumulado,
    IconoInteraccion
  },
  props: {
    profile: { // <-- Recibe un ÚNICO objeto 'profile' como prop
      type: Object,
      required: true
    }
  },
  methods: {
    sendRequest() {
      // Emite el evento 'send-request' con el objeto de perfil completo
      this.$emit('send-request', this.profile);
    },
    viewProfile() {
      // Emite el evento 'view-profile' con el objeto de perfil completo
      this.$emit('view-profile', this.profile);
    }
  }
};
</script>

<style scoped>
/*
  ¡IMPORTANTE!
  Aquí debes pegar TODOS los estilos CSS que tenías en TarjetasPerfiles.vue
  que aplican directamente a una tarjeta individual.
  Por ejemplo: .Exterior, .Tarjeta, .Inicio-Tarjeta, .Inicio-Tarjeta img,
  .Interes, .Tarjeta footer, .Texto-Tarjeta, .Descripcion-Tarjeta,
  .buttons-container, .Categoria-Tarjeta, .profile-name.

  Asegúrate de que estos estilos estén aquí y NO en TarjetasPerfiles.vue (el contenedor).
*/
/* Ejemplo de estilos que deben ir aquí: */
.Exterior {
  display: flex;
  align-items: stretch;
}
.Tarjeta {
  position: relative;
  max-width: 100%;
  border-radius: 8px;
  margin: 1rem;
  box-shadow: 0 0 12px #d7d7d7;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.Inicio-Tarjeta {
  border-radius: 8px 8px 0 0;
  max-height: 200px;
  height: 200px;
  width: 100%;
  overflow: hidden;
}
.Inicio-Tarjeta img {
  border-radius: 8px 8px 0 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
}
.Interes {
  background-color: rgb(162, 162, 250);
  border: none;
  color: white;
  border-radius: 50px;
  padding: .6rem 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.Interes:hover {
  background-color: rgb(120, 120, 240);
}
.Tarjeta footer {
  padding: 0 1rem;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.Texto-Tarjeta {
  margin-top: 0.5rem;
  font-size: 1em;
  color: #555;
}
.Descripcion-Tarjeta {
  margin-top: 0.5rem;
  min-height: 60px;
  flex-grow: 1;
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
.Categoria-Tarjeta {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 0 5px;
}
.profile-name {
  font-weight: bold;
  font-size: 1.1em;
  color: #333;
}
</style>
