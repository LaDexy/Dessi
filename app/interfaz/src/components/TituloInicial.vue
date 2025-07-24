<template>
  <header class="main-header">

    <div class="header-content">
      <h1 class="header-title">TAKE TO STEP</h1>
      </div>
  </header>
</template>

<script>
export default {
  name: "TituloInicial"
}
</script>

<style scoped> /* Añadí 'scoped' para que los estilos solo apliquen a este componente */

/* Contenedor principal del encabezado (el "rectangulo rosa" ahora es parte de este) */
.main-header {
  /* No necesitamos position: absolute aquí. El header estará en el flujo normal. */
  width: 100%; /* Ocupa todo el ancho disponible */
  min-height: 60px; /* Altura mínima, en lugar de fija */
  background-color: hsl(300, 29%, 78%); /* Tu color rosa */
  display: flex; /* Usamos Flexbox para centrar y alinear contenido */
  align-items: center; /* Centra verticalmente el contenido (Titulo) */
  padding: 0 20px; /* Un poco de padding horizontal para que el texto no toque los bordes */
  box-sizing: border-box; /* Asegura que el padding no añada ancho extra */
}

/* Contenido dentro del encabezado (si necesitas más control) */
.header-content {
  display: flex;
  align-items: center; /* Centra el título si hay otros elementos a su lado */
  width: 100%; /* Opcional: si quieres que el contenido interno ocupe todo el ancho */
  /* Justificar contenido si hay varios elementos:
     justify-content: space-between; /* Para título a la izquierda y botones a la derecha */
     justify-content: center;       /* Para centrar todo */
  
}


/* Texto del Título */
.header-title {
  /* Ya no necesitamos position: absolute, ni top, ni text-align: left;
     Flexbox manejará la alineación. */
  color: white;
  margin: 0; /* Elimina el margen por defecto de los h1 */
  font-size: 2.5rem; /* Tamaño de fuente relativo (2.5 veces el tamaño de fuente base del HTML) */
  font-weight: bold; /* Para que resalte más */
  letter-spacing: 2px; /* Un poco de espaciado entre letras para estética */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2); /* Sutil sombra para mejor legibilidad */
}

/* Media Queries para Responsividad */
@media (max-width: 768px) {
  .main-header {
    min-height: 50px; /* Reduce un poco la altura en pantallas más pequeñas */
    padding: 0 15px;
  }

  .header-title {
    font-size: 1.8rem; /* Reduce el tamaño de la fuente para móviles */
    text-align: center; /* Podrías centrar el título si es el único elemento */
    width: 100%; /* Ocupa todo el ancho si se centra */
  }
}

@media (max-width: 480px) {
  .main-header {
    min-height: 40px; /* Aún más pequeño en pantallas muy estrechas */
    padding: 0 10px;
  }
  .header-title {
    font-size: 1.5rem; /* Tamaño de fuente para móviles muy pequeños */
  }
}

</style>