<template>
  <div>


    <!--Rectangulo de arriba de barra de perfil-->
    <div class="Barra">
      <div class="rectangulo">

          

      </div>
    </div>

    <!--Texto de nombre de perfil-->
    <div>
      <h1 class="Encabezado">Aca ira el nombre de perfil</h1>
    </div>
  </div>
</template>

<script>
export default {
  name: "BarraPerfil",
};
</script>

<style>
.Barra {
 
  width: 100%; /* Ocupa el 100% del ancho disponible */
  height: 180px; /* Altura fija, ajusta según sea necesario */
  background-color: hsl(300, 29%, 78%); /* Tu color rosado */
  display: flex;
  flex-direction: column; /* Apila el texto verticalmente */
  justify-content: center; /* Centra verticalmente el contenido */
  align-items: center; /* Centra horizontalmente el contenido */
  padding: 20px;
  box-sizing: border-box; /* Incluye padding en el ancho/alto */
  /* Eliminamos 'position: absolute' y 'top: 0%' para que fluya naturalmente */
  /* z-index no es necesario aquí si no se superpone a otros elementos */

}

/* Estilos para el texto dentro de la barra */
.profile-type-text,
.profile-description-text {
  color: #333; /* Color más oscuro para mejor visibilidad sobre el rosa */
  font-size: 1.2em; /* Ajusta el tamaño de fuente */
  margin: 5px 0; /* Espacio entre los textos */
  text-align: center;
}


</style>
