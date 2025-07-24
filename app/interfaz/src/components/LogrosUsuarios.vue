<template>
  <section class="logros-section">
    <div class="logros-title-container">
      <h1>Logros</h1>
    </div>

    <div class="logros-text-container">
      <div class="emprendedor-text">
        <h4>Mayor visibilidad y alcance de tu marca</h4>
      </div>

      <div class="disenador-text">
        <h4>Tu marca cobrará vida con un diseño impactante</h4>
      </div>

      <div class="marketing-text">
        <h4>Aumentaremos tu visibilidad y reconocimiento de marca</h4>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "LogrosUsuarios"
}
</script>

<style scoped>
/* Contenedor principal de la sección de logros */
.logros-section {
  width: 100%;
  padding: 40px 20px; /* Padding interno para espacio */
  box-sizing: border-box;
  text-align: center; /* Centra el título y puede influir en otros elementos */
  background-color: #f8f8f8; /* Un fondo muy ligero para diferenciar la sección */
  margin-top: 30px; /* Espacio superior para separar del carrusel */
}

/* Contenedor del título "Logros" */
.logros-title-container h1 {
  font-size: 2.8rem; /* Tamaño de fuente grande para el título principal */
  color: #333;
  margin-bottom: 30px; /* Espacio debajo del título */
  font-weight: bold;
}

/* Contenedor de los textos motivadores (la clave para el layout) */
.logros-text-container {
  display: flex; /* Usamos Flexbox para alinear los textos */
  flex-wrap: wrap; /* Permite que los textos salten a la siguiente línea en pantallas pequeñas */
  justify-content: center; /* Centra los textos horizontalmente */
  gap: 30px; /* Espacio entre los textos (horizontal y vertical) */
  max-width: 1200px; /* Limita el ancho máximo del contenedor de textos */
  margin: 0 auto; /* Centra el contenedor de textos en la página */
}

/* Estilos para cada texto motivador individual */
.emprendedor-text,
.disenador-text,
.marketing-text {
  flex: 1 1 300px; /* Flex-grow, flex-shrink, flex-basis. Cada uno intentará tener 300px, pero se encogerá o crecerá */
  max-width: 380px; /* Ancho máximo para cada tarjeta de texto */
  padding: 20px;
  background-color: #ffffff; /* Fondo blanco para cada caja de texto */
  border-radius: 8px; /* Bordes redondeados */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); /* Sombra suave */
  text-align: center; /* Centra el texto dentro de cada caja */
  min-height: 120px; /* Asegura una altura mínima para la consistencia visual */
  display: flex; /* Para centrar el h4 verticalmente si es necesario */
  align-items: center; /* Centra verticalmente el contenido */
  justify-content: center; /* Centra horizontalmente el contenido */
}

.emprendedor-text h4,
.disenador-text h4,
.marketing-text h4 {
  font-size: 1.3rem; /* Tamaño de fuente para los textos */
  color: #555;
  line-height: 1.4;
  margin: 0; /* Elimina márgenes por defecto del h4 */
}

/* Media Queries para Responsividad */

/* Para pantallas medianas (ej. tablets, 768px y abajo) */
@media (max-width: 768px) {
  .logros-section {
    padding: 30px 15px;
  }

  .logros-title-container h1 {
    font-size: 2.2rem;
    margin-bottom: 25px;
  }

  .logros-text-container {
    gap: 20px; /* Reduce el espacio entre textos */
    /* Aquí los textos podrían pasar de 3 a 2 por fila */
  }

  .emprendedor-text,
  .disenador-text,
  .marketing-text {
    flex: 1 1 calc(50% - 20px); /* Dos columnas: 50% menos el gap */
    max-width: calc(50% - 20px); /* Ajusta max-width */
    padding: 15px;
    min-height: 100px;
  }
}

/* Para pantallas pequeñas (ej. móviles, 480px y abajo) */
@media (max-width: 480px) {
  .logros-section {
    padding: 20px 10px;
  }

  .logros-title-container h1 {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }

  .logros-text-container {
    gap: 15px; /* Reduce aún más el espacio */
  }

  .emprendedor-text,
  .disenador-text,
  .marketing-text {
    flex: 1 1 100%; /* Una sola columna en móviles */
    max-width: 100%; /* Ocupa todo el ancho disponible */
    padding: 15px;
    min-height: unset; /* Deja que la altura se ajuste al contenido */
  }

  .emprendedor-text h4,
  .disenador-text h4,
  .marketing-text h4 {
    font-size: 1.1rem; /* Reduce el tamaño de fuente para móviles */
  }
}
</style>