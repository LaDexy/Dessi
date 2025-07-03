<template>

<div>

 <!--Rectangulo de arriba de texto de foro-->
    <div class="RectanguloForo">
      <div class="rectangulo"></div>
      <h1 class="titulo-foro">Foro de la Comunidad</h1>
    </div>

<!-- Cuerpo inicial del foro-->
  <div class="forum-container">

    

    

    <!-- Vista de Lista de Temas -->
    <div v-if="currentView === 'topicList'" class="ListaTemas">
        <div class="titulo-temas">
            <h2 class="Seccion">Temas Recientes</h2>
            <button class="NuevoTema" @click="showNewTopicForm">
                Crear Nuevo Tema
            </button>
        </div>

        <!-- Lista de temas -->
        <div class="TarjetasTemas">
            <div
                v-for="topic in forumData"
                :key="topic.id"
                class="TarjetaIndividual"
                @click="showTopicDetail(topic.id)"
            >
                <h3>{{ topic.title }}</h3>
                <p>
                    Publicado por <span style="font-weight: bold; color: #007bff;">{{ topic.author }}</span>
                    el {{ topic.date }}
                    <span class="reputacion-icono">{{ topic.authorReputation }}</span>
                </p>
                <div class="InfoAdicional">
                    <span>{{ topic.replies.length }} Respuestas</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Vista de Detalle del Tema -->
    <div v-else-if="currentView === 'topicDetail'" class="DetalleTemas">
        <button class="VolverBoton" @click="showTopicList">← Volver al Foro</button>

        <div class="PrimerTema">
            <h3>{{ currentTopic.title }}</h3>
            <p class="InfoAutor">
                Publicado por <span style="font-weight: bold; color: #007bff;">{{ currentTopic.author }}</span>
                el {{ currentTopic.date }}
                <span class="reputacion-icono">{{ currentTopic.authorReputation }}</span>
            </p>
            <p class="contenido-tema">{{ currentTopic.content }}</p>
        </div>

        <h4 class="Respuestas">Respuestas</h4>
        <div class="respuestas-lista">
            <div v-for="reply in currentTopic.replies" :key="reply.id" class="TarjetaRespuesta">
                <p class="InfoAutorRespuesta">
                    <span style="font-weight: bold; color: #007bff;">{{ reply.author }}</span>
                    el {{ reply.date }}
                    <span class="reputacion-icono">{{ reply.authorReputation }}</span>
                </p>
                <p class="ContenidoRespuesta">{{ reply.content }}</p>
            </div>
        </div>

        <div class="FormularioRespuesta">
            <h5 class="TituloFormularioRespuesta">Deja una Respuesta</h5>
            <textarea v-model="replyContent" class="CampoRespuesta" rows="4" placeholder="Escribe tu respuesta aquí..."></textarea>
            <button class="PublicarRespuesta" @click="postReply">Publicar Respuesta</button>
        </div>
    </div>

    <!-- Formulario para Crear Nuevo Tema -->
    <div v-else-if="currentView === 'newTopicForm'" class="FormularioNuevoTema">
        <button class="VolverBoton" @click="showTopicList">← Cancelar</button>
        <h2 class="TituloNuevoTema">Crear Nuevo Tema</h2>
        <div class="CamposNuevoFormulario">
            <div>
                <label for="newTopicTitle" class="EtiquetaCampo">Título del Tema</label>
                <input type="text" id="newTopicTitle" v-model="newTopicTitle" class="CampoTexto">
            </div>
            <div>
                <label for="newTopicContent" class="EtiquetaCampo">Contenido</label>
                <textarea id="newTopicContent" v-model="newTopicContent" class="CampoTexto" rows="8"></textarea>
            </div>
            <button class="PublicarTema" @click="createNewTopic">Publicar Tema</button>
        </div>
    </div>
  </div>

</div>
</template>

<script>

export default {
  name: "ForoUsuarios",
  data() {
    return {
      // Datos falsos para el foro
      forumData: [
        {
          id: 't1',
          title: 'Consejos para Diseñar un Logo Minimalista',
          author: 'Ana Diseñadora',
          authorReputation: 125,
          date: '2025-07-01',
          content: 'Estoy trabajando en un logo para una startup de tecnología y quiero que sea muy minimalista. ¿Qué principios o herramientas recomiendan para lograr un diseño efectivo y memorable con la menor cantidad de elementos?',
          replies: [
            {
              id: 'r1-1',
              author: 'Carlos Marketer',
              authorReputation: 80,
              date: '2025-07-01',
              content: 'El minimalismo es clave. Enfócate en la tipografía y un icono simple. Menos es más. Piensa en la escalabilidad del logo en diferentes plataformas.'
            },
            {
              id: 'r1-2',
              author: 'María Emprendedora',
              authorReputation: 45,
              date: '2025-07-02',
              content: 'Considera la psicología del color. A veces, un color bien elegido puede comunicar mucho sin necesidad de formas complejas.'
            },
            {
              id: 'r1-3',
              author: 'Ana Diseñadora',
              authorReputation: 125,
              date: '2025-07-02',
              content: '¡Gracias por los consejos! Estoy experimentando con una paleta de colores muy limitada y formas geométricas básicas.'
            }
          ]
        },
        {
          id: 't2',
          title: 'Estrategias de Marketing para Lanzar un Producto Ecológico',
          author: 'Javier Emprendedor',
          authorReputation: 95,
          date: '2025-06-28',
          content: 'Mi startup está a punto de lanzar una línea de productos de limpieza ecológicos. ¿Cuáles son las mejores estrategias de marketing digital para llegar a un público consciente del medio ambiente?',
          replies: [
            {
              id: 'r2-1',
              author: 'Laura Marketer',
              authorReputation: 150,
              date: '2025-06-29',
              content: 'El marketing de contenidos es vital. Crea blogs y videos que eduquen sobre los beneficios de los productos ecológicos y la sostenibilidad. Usa influencers con valores similares.'
            },
            {
              id: 'r2-2',
              author: 'Pedro Diseñador',
              authorReputation: 60,
              date: '2025-06-29',
              content: 'No olvides el empaque. Un diseño de empaque sostenible y atractivo refuerza el mensaje ecológico y es un gran punto de venta visual.'
            }
          ]
        },
        {
          id: 't3',
          title: 'Herramientas Indispensables para la Gestión de Proyectos de Diseño',
          author: 'Sofía Diseñadora',
          authorReputation: 110,
          date: '2025-06-25',
          content: 'Como diseñadora freelance, a veces me cuesta organizar mis proyectos y clientes. ¿Qué herramientas de gestión de proyectos recomiendan para diseñadores? Busco algo intuitivo y que me ayude a mantener el control.',
          replies: [
            {
              id: 'r3-1',
              author: 'Miguel Emprendedor',
              authorReputation: 70,
              date: '2025-06-26',
              content: 'Asana o Trello son buenas opciones para empezar. Son visuales y fáciles de usar para seguimiento de tareas.'
            },
            {
              id: 'r3-2',
              author: 'Elena Marketer',
              authorReputation: 105,
              date: '2025-06-27',
              content: 'Para proyectos más complejos, Jira o ClickUp ofrecen más funcionalidades, pero tienen una curva de aprendizaje mayor.'
            }
          ]
        }
      ],
      
      currentView: 'topicList',
      currentTopic: null, 

      /* Datos del Formulario Nuevo Tema*/
      newTopicTitle: '',
      newTopicContent: '',

      /*Datos del Formulario de Respuesta*/
      replyContent: ''
    };
  },
  methods: {
    /*Funciones dentro del foro*/
    showTopicList() {
      this.currentView = 'topicList';
      this.currentTopic = null; 
    },
    showTopicDetail(topicId) {
      this.currentTopic = this.forumData.find(t => t.id === topicId);
      this.currentView = 'topicDetail';
    },
    showNewTopicForm() {
      this.currentView = 'newTopicForm';
      this.newTopicTitle = '';
      this.newTopicContent = '';
    },

    
    createNewTopic() {
      if (this.newTopicTitle.trim() === '' || this.newTopicContent.trim() === '') {
        alert('Por favor, completa el título y el contenido del tema.');
        return;
      }

      const newTopic = {
        id: 't' + (this.forumData.length + 1), 
        title: this.newTopicTitle.trim(),
        author: 'Usuario Actual', 
        authorReputation: 50, 
        date: new Date().toISOString().slice(0, 10),
        content: this.newTopicContent.trim(),
        replies: []
      };

      this.forumData.unshift(newTopic); 
      this.showTopicList(); 
    },
    postReply() {
      if (this.replyContent.trim() === '') {
        alert('Por favor, escribe tu respuesta.');
        return;
      }

      if (this.currentTopic) {
        const newReply = {
          id: 'r' + this.currentTopic.id + '-' + (this.currentTopic.replies.length + 1),
          author: 'Usuario Actual', 
          authorReputation: 50,
          date: new Date().toISOString().slice(0, 10),
          content: this.replyContent.trim()
        };
        this.currentTopic.replies.push(newReply);
        this.replyContent = ''; 
      }
    }
  },
 
};



</script>

<style>

/*Rectangulo de barra superior*/

.RectanguloForo {

  width: 1525px;
  height: 230px;
  background-color: hsl(300, 29%, 78%);
   display: flex;
  flex-wrap: wrap;
  justify-content: center; 
  gap: 20px; 
  padding: 20px;
  margin-left: 0%;
}

/* Contenedor principal del foro */
        .forum-container {
            max-width: 960px;
            margin: 2rem auto; 
            padding: 1.5rem;
            background-color: #ffffff;
            border-radius: 0.75rem; 
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); 
        }

        /* Estilos para el título principal del foro */
        .titulo-foro {
            top: 90px;
            position: absolute;
            font-size: 3rem; 
            font-weight: bold;
            color: #ffffff; 
            margin-bottom: 1.5rem; 
            text-align: center; 
        }

        /* Contenedor de la lista de temas */
        .ListaTemas {
            display: flex;
            flex-direction: column;
            gap: 1rem; /* Espacio vertical entre los elementos hijos */
            margin-bottom: 1.5rem; /* Margen inferior para separar de otras secciones */
        }

        /* Contenedor del título "Temas Recientes" y el botón "Crear Nuevo Tema" */
        .titulo-temas {
            display: flex;
            justify-content: space-between; /* Espacio entre los elementos */
            align-items: center; /* Centrado vertical */
            margin-bottom: 1rem; /* Margen inferior */
        }

        /* Estilos para el h2 "Temas Recientes" */
        .Seccion {
            font-size: 1.5rem; /* Tamaño de fuente */
            font-weight: 600; /* Semi-negrita */
            color: #4a5568; /* Gris oscuro */
        }

        /* Estilos para el botón "Crear Nuevo Tema" */
        .NuevoTema {
            background-color: #e4a0d5; /* Color morado suave */
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            border: none; /* Quitar borde por defecto del botón */
            cursor: pointer;
            transition: background-color 0.2s ease-in-out; /* Transición para hover */
        }

        .NuevoTema:hover {
            background-color: #e4a0d5; /* Color al pasar el ratón */
        }

        /* Contenedor donde se cargarán las tarjetas de los temas */
        .TarjetasTemas {
            display: flex;
            flex-direction: column;
            gap: 1rem; /* Espacio entre las tarjetas */
        }

        /* Estilos para cada tarjeta de tema individual */
        .TarjetaIndividual {
            background-color: #ffffff;
            padding: 1.25rem;
            border-radius: 0.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            cursor: pointer;
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            display: flex;
            flex-direction: column;
            align-items: flex-start; /* Alinea el contenido a la izquierda */
        }

        .TarjetaIndividual:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .TarjetaIndividual h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #333333;
            margin-bottom: 0.25rem;
        }

        .TarjetaIndividual p {
            font-size: 0.875rem;
            color: #666666;
            margin-bottom: 0.5rem;
        }

        .InfoAdicional {
            display: flex;
            justify-content: space-between;
            width: 100%;
            font-size: 0.8rem;
            color: #777777;
        }

        /* Estilos para el icono de reputación (círculo amarillo con número) */
        .reputacion-icono {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1.5rem;
            height: 1.5rem;
            border-radius: 50%;
            background-color: #fcd34d; /* Amarillo para la insignia */
            color: #92400e; /* Texto marrón oscuro */
            font-weight: bold;
            font-size: 0.75rem;
            margin-left: 0.5rem;
        }

        /* --- Estilos para la vista de detalle del tema --- */
        .DetalleTemas {
            background-color: #f9fafb; /* Fondo ligeramente gris para la sección */
            padding: 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
            gap: 1rem; /* Espacio entre los elementos del detalle */
        }
        .VolverBoton { /* Botón para volver al foro */
            background-color: #e5e7eb;
            color: #4b5563;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
            margin-bottom: 1rem; /* Margen después del botón */
            align-self: flex-start; /* Alinea el botón a la izquierda */
        }
        .VolverBoton:hover {
            background-color: #d1d5db;
        }
        .PrimerTema { /* Tarjeta del tema principal en el detalle */
            background-color: #e0f2fe; /* Azul claro */
            border: 1px solid #90cdf4;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-bottom: 1rem; /* Margen después del tema principal */
        }
        .PrimerTema h3 {
            font-size: 1.75rem;
            font-weight: bold;
            color: #2b6cb0;
            margin-bottom: 0.5rem;
        }
        .InfoAutor { /* Información del autor del tema principal */
            font-size: 0.9rem;
            color: #4a5568;
            margin-bottom: 1rem;
        }
        .contenido-tema { /* Contenido del tema principal */
            font-size: 1rem;
            line-height: 1.6;
            color: #2d3748;
        }
        .Respuestas { /* Título de la sección de respuestas */
            font-size: 1.25rem;
            font-weight: 600;
            color: #4a5568;
            margin-top: 1rem; /* Margen superior */
            margin-bottom: 1rem; /* Margen inferior */
        }
        .respuestas-lista { /* Contenedor de la lista de respuestas */
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        .TarjetaRespuesta { /* Cada tarjeta de respuesta individual */
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 1rem;
        }
        .InfoAutorRespuesta { /* Información del autor de la respuesta */
            font-size: 0.85rem;
            color: #666666;
            margin-bottom: 0.5rem;
        }
        .ContenidoRespuesta { /* Contenido de la respuesta */
            font-size: 0.95rem;
            line-height: 1.5;
            color: #333333;
        }
        .FormularioRespuesta { /* Contenedor del formulario para responder */
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 1.5rem;
        }
        .TituloFormularioRespuesta { /* Título del formulario de respuesta */
            font-size: 1.125rem;
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 1rem;
        }
        .CampoRespuesta { /* Área de texto para la respuesta */
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #cbd5e0;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
            resize: vertical; /* Permite redimensionar verticalmente */
            font-size: 1rem;
            color: #2d3748;
        }
        .CampoRespuesta:focus { /* Estilo al enfocar el campo */
            outline: none;
            border-color: #667eea; /* Color de foco */
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }
        .PublicarRespuesta { /* Botón para publicar respuesta */
            background-color: #e4a0d5;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
        }
        .PublicarRespuesta:hover {
            background-color: #e4a0d5;
        }

        /* --- Estilos para el formulario de nuevo tema --- */
        .FormularioNuevoTema { /* Contenedor principal del formulario de nuevo tema */
            background-color: #f9fafb;
            padding: 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .TituloNuevoTema { /* Título del formulario de nuevo tema */
            font-size: 1.5rem;
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 1rem;
        }
        .CamposNuevoFormulario { /* Contenedor de los campos del formulario */
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .EtiquetaCampo { /* Etiquetas de los campos del formulario */
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #4a5568;
            margin-bottom: 0.25rem;
        }
        .CampoTexto { /* Campos de texto (input y textarea) */
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #cbd5e0;
            border-radius: 0.375rem;
            font-size: 1rem;
            color: #2d3748;
        }
        .CampoTexto:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }
        .PublicarTema { /* Botón para publicar el nuevo tema */
            background-color: #e4a0d5;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
            margin-top: 1rem;
        }
        .PublicarTema:hover {
            background-color: #7a71dc;
        }

</style>