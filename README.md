**Gestor web para contratación de servicios en**
**diseño gráfico y marketing digital**

Un gestor web que facilita la interacción entre emprendedores, diseñadores gráficos y expertos en marketing digital. Los usuarios pueden seleccionar su perfil según su ocupación y establecer colaboraciones estratégicas con otros profesionales, según sus necesidades. El proyecto se elaboró como requisito para optar por el título de Licenciatura en computación.

**Informacion general**

El tema del gestor web fue proporcionar al usuario un sitio web donde pudiera establecer convenios, principalmente para los emprendedores. Ya que actualmente se observa gran actividad y crecimiento en los emprendimientos y a su vez dificultad para mantener la imagen del negocio (por falta de publicidad y atracción a cliente), sobre todo porque en la actualidad la mayoría son emprendimientos virtuales (tiendas virtuales) y requieren de buena atracción visual, de ahí el énfasis en convenios con profesiones de diseño gráfico y marketing digital. Nuestra aplicación busca precisamente eso: permitir que los emprendedores establezcan convenios que les ayuden a fortalecer su estatus visual en redes sociales y superar este desafío común.

**Tecnologías y herramientas**

* Visual Studio Code
* Java Script
* Vue.js 
* Node.js
* Express.js
* Boostrap
* MySQL
* phpMyAdmin
* WampServer

**Elaboración**

Para lograr el desarrollo del gestor web, se utilizó MySQL y phpMyAdmin para la base de datos, Node.js con Express.js para la lógica del servidor (backend), y Vue.js junto con Bootstrap para la interfaz de usuario interactiva y atractiva (frontend), todo esto desarrollado en Visual Studio Code y gestionado con WampServer para el entorno local.

**Arreglos**

Una vez instalados los aplicativos necesarios, para configurar el entorno del proyecto deberá realizar lo siguiente:

•	Primero coloque la carpeta del código en la ubicación deseada de su equipo.
•	Abra la terminal (o símbolo del sistema) y navegue hasta el directorio raíz del proyecto ([ruta donde este el proyecto]/app).
•	Ejecute línea de comando **npm install** para instalar todos los archivos necesarios para el backend.
•	Abra nuevamente otro terminal (sin cerrar la del servicio de express.js) y navegue hasta el directorio raíz del proyecto ([ruta donde este el proyecto]/app/interfaz).
•	Ejecute línea de comando **npm install** para esta vez iniciar servicio de fontend.
•	Una vez ejecutados los comandos debería tener el entorno configurado ya que el archivo del proyecto (código) contiene los archivo package.json para su despliegue de paqueterías.


**Procesos**

Ya realizados los pasos para configuración del entorno, para ejecución del aplicativo web se debe realizar lo siguiente:

•	Abra la terminal (o símbolo del sistema) y navegue hasta el directorio raíz del proyecto ([ruta donde este el proyecto]/app).
•	Ejecute línea de comando **npm run dev** para iniciar servicio de archivos de express.js.
•	Abra nuevamente otro terminal (sin cerrar la del servicio de express.js) y navegue hasta el directorio raíz del proyecto ([ruta donde este el proyecto]/app/interfaz).
•	Ejecute línea de comando **npm run serve** para iniciar servicio de archivos vue.js.
•	Verificar que ambos servicios estén activos correctamente, el de express.js en el puerto 4000 y el vue.js 8080. 
•	Una vez en ejecución los servicios, se debe iniciar la aplicación WampServe para poder poner en marcha la base de datos.
•	Ya activo el aplicativo WampServe ingresar a phpAdmin con credenciales genéricas (root y sin contraseña).
•	Importar base de datos convenio_emprendimiento. Podrá verificar tablas, estructura y relaciones.
•	Ya con el entorno en ejecución y enlace de la base de datos podrá verificar funcionalidad del aplicativo web a través de la ruta emitida en la terminal donde se ejecuta el frontend.
