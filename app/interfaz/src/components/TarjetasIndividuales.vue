
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
         
          <button class="Interes" @click="sendRequest">Solicitud</button>
          
          <button class="Interes" @click="viewProfile">Ver perfil</button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>

import ValorAcumulado from '@/components/ValorAcumulado.vue';
import IconoInteraccion from '@/components/IconoInteraccion.vue';

export default {
  name: "TarjetasIndividuales", 
  components: {
    ValorAcumulado,
    IconoInteraccion
  },
  props: {
    profile: { 
      type: Object,
      required: true
    }
  },
  methods: {
    sendRequest() {
     
      this.$emit('send-request', this.profile);
    },
    viewProfile() {
    
      this.$emit('view-profile', this.profile);
    }
  }
};
</script>

<style scoped>

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
