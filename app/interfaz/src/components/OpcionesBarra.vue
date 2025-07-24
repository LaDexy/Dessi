<template>
    <div>   

        <div class="Menu">
        <!--Barra Opciones inferior-->
<button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom" aria-controls="offcanvasBottom">

 <!--Icono de Interrogacion-->
                <i class="fa-regular fa-circle-question fa-2xl" style="color: #ffffff;"></i>

</button>

       

<div class="offcanvas offcanvas-bottom" tabindex="-1" id="offcanvasBottom" aria-labelledby="offcanvasBottomLabel">
  <div class="offcanvas-header">

<!--Boton de Instructivo-->
    
    <p>
        <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
    Instructivo
        </a>
    </p>

    <div class="collapse" id="collapseExample">
        <div class="card card-body">
    Aca dira como se inicia sesion y se registra
        </div>
    </div>

    <p>
        <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample2" role="button" aria-expanded="false" aria-controls="collapseExample2">
    Acerca De
        </a>
    </p>

    <div class="collapse" id="collapseExample2">
        <div class="card card-body">
    Aca dira informacion sobre la app web
        </div>
    </div>
    

  </div>
</div>
</div>

    </div>
</template>

<script>

export default {

name: "OpcionesBarra"

}

</script>

<style scoped> /* ¡Esencial mantener 'scoped' aquí! */

/* Contenedor principal del botón de opciones (el botón flotante) */
.Menu {
  position: fixed; /* ¡Cambiado de absolute a fixed! Se mantendrá en la pantalla al hacer scroll. */
  bottom: 20px; /* Distancia desde la parte inferior de la ventana */
  left: 20px; /* Distancia desde la parte izquierda de la ventana */
  z-index: 1000; /* Asegura que esté por encima de la mayoría de los otros elementos */
}

/* Estilos del botón que activa el offcanvas */
.Menu .btn { /* Apuntamos a la clase .btn de Bootstrap */
  background-color: #007bff; /* Un azul de Bootstrap más estándar, o tu color preferido */
  background-color: #3f51b5; /* Un azul más profundo o el color de tu marca */
  border: none;
  border-radius: 50%; /* Hace el botón completamente circular */
  width: 60px; /* Ancho fijo para un botón circular */
  height: 60px; /* Altura fija para un botón circular */
  display: flex; /* Usamos flexbox para centrar el icono dentro del botón */
  justify-content: center; /* Centra horizontalmente el icono */
  align-items: center; /* Centra verticalmente el icono */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); /* Sombra para efecto flotante */
  transition: all 0.3s ease; /* Transición suave para efectos hover/active */
  cursor: pointer;
}

.Menu .btn:hover {
  background-color: #303f9f; /* Un tono más oscuro al pasar el ratón */
  transform: translateY(-3px); /* Pequeño efecto de levantamiento */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3); /* Sombra más pronunciada al hover */
}

.Menu .btn:active {
  transform: translateY(0); /* Vuelve a su posición normal al hacer click */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* Sombra más suave al hacer click */
}

/* Estilos del icono de interrogación (Font Awesome) */
.Menu .fa-circle-question {
  color: #ffffff !important; /* Asegura que el color sea blanco, usando !important si Bootstrap lo sobrescribe */
  font-size: 2rem; /* Ajusta el tamaño del icono. fa-2xl ya es grande, pero puedes controlarlo aquí. */
  /* Si necesitas cambiar el tamaño de fa-2xl, puedes usar font-size: 2em; o un valor fijo en px */
}

/* Estilos para el Offcanvas de Bootstrap (si quieres personalizarlos más allá de Bootstrap) */
/* Por defecto, los offcanvas de Bootstrap son responsivos. Aquí solo algunos ajustes estéticos. */
.offcanvas {
  /* Puedes ajustar el background-color, color del texto, etc. */
  background-color: #f8f8f8; /* Un color de fondo más suave para el offcanvas */
  color: #333;
  border-top-left-radius: 15px; /* Bordes redondeados en la parte superior del offcanvas */
  border-top-right-radius: 15px;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1); /* Sombra sutil en la parte superior */
}

.offcanvas-header {
  /* Estilos para el encabezado del offcanvas */
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex; /* Para alinear los botones de Instructivo y Acerca De */
  flex-wrap: wrap; /* Permitir que los botones se envuelvan en pantallas pequeñas */
  justify-content: flex-start; /* Alinea los botones al inicio */
  gap: 10px; /* Espacio entre los botones */
}

.offcanvas-header p { /* Elimina el margen por defecto de los <p> que envuelven los <a> */
  margin-bottom: 0;
}

.offcanvas-header .btn-primary { /* Estilos para los botones "Instructivo" y "Acerca De" dentro del offcanvas */
  background-color: #6c757d; /* Un gris más neutro para estos botones */
  border-color: #6c757d;
  color: white;
  border-radius: 5px;
  min-width: 120px; 
  padding: 10px 20px;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.offcanvas-header .btn-primary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

.collapse .card-body { /* Estilos para el contenido colapsable */
  background-color: #ffffff; /* Fondo blanco para el contenido */
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-top: 10px;
  padding: 15px;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #444;
}

/* Media Queries para Responsividad */

/* Para pantallas pequeñas (ej. móviles, 768px y abajo) */
@media (max-width: 768px) {
  .Menu {
    bottom: 15px; /* Reduce la distancia desde la parte inferior */
    left: 15px; /* Reduce la distancia desde la izquierda */
  }

  .Menu .btn {
    width: 50px; /* Reduce el tamaño del botón */
    height: 50px;
  }

  .Menu .fa-circle-question {
    font-size: 1.6rem; /* Reduce el tamaño del icono */
  }

  .offcanvas-header {
    flex-direction: column; /* Apila los botones en el offcanvas en móviles */
    align-items: flex-start; /* Alinea los botones apilados a la izquierda */
  }

  .offcanvas-header .btn-primary {
    width: 100%; /* Los botones ocupan todo el ancho en móviles */
    text-align: left; /* Alinea el texto a la izquierda */
  }
}

/* Para pantallas muy pequeñas (ej. móviles, 480px y abajo) */
@media (max-width: 480px) {
  .Menu {
    bottom: 10px;
    left: 10px;
  }

  .Menu .btn {
    width: 45px;
    height: 45px;
  }

  .Menu .fa-circle-question {
    font-size: 1.4rem;
  }
}

</style>