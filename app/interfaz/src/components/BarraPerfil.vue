<template>
  <div>


    <!--Rectangulo de arriba de barra de perfil-->
    <div class="Barra">
      <div class="rectangulo"></div>

      </div>
    </div>
</template>

<script>
export default {
  name: "BarraPerfil",
};
</script>

<style>
 
 /* Rectángulo de barra superior */
.Barra {
  width: 100%; /* Ocupa el 100% del ancho disponible */
  height: 180px; /* Altura fija para la barra */
  background-color: hsl(300, 29%, 78%); /* Tu color rosado */
  /* Eliminamos cualquier posicionamiento absoluto (position: absolute, top, left) */
  /* para que fluya naturalmente en el documento. */
  /* También eliminamos display: flex, flex-direction, justify-content, align-items, padding */
  /* ya que no hay contenido interno que necesite ser centrado. */
  box-sizing: border-box; /* Incluye padding en el ancho/alto si lo añades en el futuro. */
  margin-top: 20px; /* Espacio entre el nombre de usuario y esta barra */
}



</style>
