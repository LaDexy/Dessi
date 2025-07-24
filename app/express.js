// Importa las librerías necesarias usando sintaxis ES Modules
import express from "express";
import mysql from "mysql2/promise"; // Usamos mysql2 con promesas para operaciones asíncronas
import bcrypt from "bcrypt"; // Para hashear contraseñas
import cors from "cors"; // Para manejar las políticas de Cross-Origin Resource Sharing
import jwt from "jsonwebtoken"; // Para generar JSON Web Tokens
import multer from "multer"; // Para manejar la carga de archivos (imágenes)
import path from "path"; // Para manejar rutas de archivos
import { fileURLToPath } from "url"; // Para obtener __dirname en ES Modules
import fs from "fs"; // Para crear directorios si no existen

// Obtener __filename y __dirname para entornos ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Creación de servidor
const app = express();

// Configura los middlewares
// Middleware de CORS: ¡Este es el que permite la comunicación entre tu frontend y backend!
app.use(
  cors({
    origin: "http://localhost:8080", // Permite solicitudes SÓLO desde tu frontend Vue.js
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Asegúrate de incluir todos los métodos que usas
    allowedHeaders: ["Content-Type", "Authorization"], // Permite estas cabeceras
    credentials: true, // Permite el envío de cookies de origen cruzado (si las usas)
  })
);

app.use(express.json()); // Permite a Express parsear cuerpos de solicitud JSON
app.use(express.urlencoded({ extended: true })); // Para formularios URL-encoded

// Sirve archivos estáticos desde la carpeta 'uploads' (donde guardaremos las imágenes de perfil/proyectos)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configuración de la conexión a la base de datos MySQL
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "convenio_emprendimiento", // Nombre de tu base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Crea un pool de conexiones para la base de datos
const pool = mysql.createPool(dbConfig);

// Clave secreta para firmar los JWT
// ¡IMPORTANTE! Asegúrate de que esta clave sea la misma que usas al generar tokens
// y que sea un valor seguro y largo en un entorno de producción (ej. desde variables de entorno).
const JWT_SECRET = "tu_super_secreto_jwt_muy_seguro_y_largo_1234567890"; // Asegúrate de haberla cambiado

// Configuración de Multer para la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// --- MIDDLEWARES DE AUTENTICACIÓN Y AUTORIZACIÓN ---

// Middleware para verificar el token JWT (ya lo tenías)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Formato: Bearer TOKEN

  if (token == null) {
    console.log("Autenticación fallida: Token no proporcionado.");
    return res.status(401).json({ message: "Token no proporcionado." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log(
        "Autenticación fallida: Token inválido o expirado.",
        err.message
      );
      return res.status(403).json({ message: "Token inválido o expirado." });
    }
    req.user = user; // 'user' contendrá el payload del token (id_usuario, tipo_perfil, nombre_usuario)
    console.log(
      "Token autenticado para usuario:",
      user.id_usuario,
      user.nombre_usuario,
      user.tipo_perfil
    );
    next();
  });
};

// NUEVO MIDDLEWARE: Para autorizar solo a usuarios Emprendedores
const authorizeEntrepreneur = (req, res, next) => {
  if (req.user && req.user.tipo_perfil === "Emprendedor") {
    next(); // El usuario es un emprendedor, continuar
  } else {
    console.warn(
      "Error 403: Acceso denegado. Solo los emprendedores pueden realizar esta acción. Tipo de perfil:",
      req.user ? req.user.tipo_perfil : "No especificado"
    );
    res.status(403).json({
      message:
        "Acceso denegado. Solo los emprendedores pueden realizar esta acción.",
    });
  }
};

// NUEVO MIDDLEWARE: Para autorizar solo a usuarios Diseñador o Marketing
const authorizeDesignerMarketing = (req, res, next) => {
  if (
    req.user &&
    (req.user.tipo_perfil === "Diseñador" ||
      req.user.tipo_perfil === "Marketing")
  ) {
    next(); // El usuario es Diseñador o Marketing, continuar
  } else {
    console.warn(
      "Error 403: Acceso denegado. Solo Diseñadores y Marketing pueden ver esta lista de desafíos. Tipo de perfil:",
      req.user ? req.user.tipo_perfil : "No especificado"
    );
    res.status(403).json({
      message:
        "Acceso denegado. Solo Diseñadores y Marketing pueden ver esta lista de desafíos.",
    });
  }
};

// --- RUTAS DE AUTENTICACIÓN Y PERFIL ---

// --- RUTA PARA REGISTRO DE USUARIOS ---
app.post("/api/register", async (req, res) => {
  console.log("Solicitud de registro recibida. Datos:", req.body);

  const {
    nombre_usuario,
    correo_electronico,
    contrasena,
    tipo_perfil,
    nombre_negocio,
    localidad,
    tipo_negocio,
    modalidad_trabajo,
  } = req.body;

  if (!nombre_usuario || !correo_electronico || !contrasena || !tipo_perfil) {
    console.log("Error 400: Campos obligatorios faltantes.");
    return res.status(400).json({
      message: "Todos los campos obligatorios deben ser proporcionados.",
    });
  }

  try {
    console.log(
      "Verificando si el correo electrónico ya está registrado:",
      correo_electronico
    );
    const [users] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE correo_electronico = ?",
      [correo_electronico]
    );
    if (users.length > 0) {
      console.log("Error 409: Correo electrónico ya registrado.");
      return res
        .status(409)
        .json({ message: "El correo electrónico ya está registrado." });
    }

    console.log("Hasheando contraseña...");
    const contrasena_hash = await bcrypt.hash(contrasena, 10);
    console.log("Contraseña hasheada.");

    const connection = await pool.getConnection();
    console.log("Conexión a DB obtenida. Iniciando transacción...");
    await connection.beginTransaction();

    try {
      console.log("Insertando usuario principal...");
      const [userResult] = await connection.query(
        // --- ¡AQUÍ ESTÁ EL CAMBIO IMPORTANTE! ---
        // Se añadió 'reaccion_acumulada' a la lista de columnas y un nuevo '?' para su valor
        "INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena_hash, tipo_perfil, fecha_registro, foto_perfil_url, descripcion_perfil, reputacion, reaccion_acumulada) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)",
        [
          nombre_usuario,
          correo_electronico,
          contrasena_hash,
          tipo_perfil,
          "", // foto_perfil_url por defecto
          "", // descripcion_perfil por defecto
          0, // reputacion por defecto
          0, // <-- NUEVO: reaccion_acumulada por defecto
        ]
      );
      const id_usuario = userResult.insertId;
      console.log("Usuario principal insertado. ID:", id_usuario);

      if (tipo_perfil === "Emprendedor") {
        if (!nombre_negocio || !localidad || !tipo_negocio) {
          throw new Error(
            "Faltan campos específicos para el perfil Emprendedor."
          );
        }
        const tipoNegocioString = Array.isArray(tipo_negocio)
          ? tipo_negocio.join(",")
          : tipo_negocio;
        console.log("Insertando datos de Emprendedor:", {
          id_usuario,
          nombre_negocio,
          localidad,
          tipoNegocioString,
        });
        await connection.query(
          "INSERT INTO emprendedor (id_usuario, nombre_negocio, localidad, tipo_negocio, desafios_cuenta) VALUES (?, ?, ?, ?, 0)",
          [id_usuario, nombre_negocio, localidad, tipoNegocioString]
        );
        console.log("Datos de Emprendedor insertados.");
      } else if (tipo_perfil === "Diseñador" || tipo_perfil === "Marketing") {
        if (!localidad || !modalidad_trabajo) {
          throw new Error(
            "Faltan campos específicos para el perfil Diseñador/Marketing."
          );
        }
        const modalidadTrabajoString = Array.isArray(modalidad_trabajo)
          ? modalidad_trabajo.join(",")
          : modalidad_trabajo;
        console.log("Insertando datos de Diseñador/Marketing:", {
          id_usuario,
          localidad,
          modalidadTrabajoString,
        });
        await connection.query(
          "INSERT INTO disenador_marketing (id_usuario, localidad, modalidad_trabajo) VALUES (?, ?, ?)",
          [id_usuario, localidad, modalidadTrabajoString]
        );
        console.log("Datos de Diseñador/Marketing insertados.");
      } else {
        throw new Error("Tipo de perfil no válido.");
      }

      console.log("Confirmando transacción...");
      await connection.commit();
      console.log("Transacción confirmada. Registro exitoso.");
      res.status(201).json({
        message: "Usuario registrado exitosamente",
        userId: id_usuario,
      });
    } catch (transactionError) {
      console.log(
        "Error en transacción. Revirtiendo cambios...",
        transactionError.message
      );
      await connection.rollback();
      console.error(
        "Error durante la transacción de registro:",
        transactionError
      );
      res.status(500).json({
        message: "Error al registrar el usuario",
        error: transactionError.message,
      });
    } finally {
      console.log("Liberando conexión a DB.");
      connection.release();
    }
  } catch (error) {
    console.error("Error general en la ruta de registro:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
});

// --- RUTA PARA LOGIN DE USUARIOS ---
app.post("/api/login", async (req, res) => {
  console.log("Solicitud de login recibida. Datos:", req.body);
  const { correo_electronico, contrasena } = req.body;

  if (!correo_electronico || !contrasena) {
    console.log("Error 400: Correo o contraseña faltantes.");
    return res
      .status(400)
      .json({ message: "Correo electrónico y contraseña son obligatorios." });
  }

  try {
    console.log("Buscando usuario por correo electrónico:", correo_electronico);
    const [users] = await pool.query(
      "SELECT id_usuario, nombre_usuario, contrasena_hash, tipo_perfil FROM usuarios WHERE correo_electronico = ?",
      [correo_electronico]
    );

    if (users.length === 0) {
      console.log("Error 401: Usuario no encontrado.");
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const user = users[0];
    console.log("Usuario encontrado. Comparando contraseña...");
    const isMatch = await bcrypt.compare(contrasena, user.contrasena_hash);

    if (!isMatch) {
      console.log("Error 401: Contraseña incorrecta.");
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    console.log("Credenciales válidas. Generando JWT...");
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        tipo_perfil: user.tipo_perfil,
        nombre_usuario: user.nombre_usuario,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    console.log("JWT generado. Enviando respuesta de login.");

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      tipo_perfil: user.tipo_perfil,
      id_usuario: user.id_usuario,
      nombre_usuario: user.nombre_usuario,
    });
  } catch (error) {
    console.error("Error general en la ruta de login:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
});

// --- RUTA PROTEGIDA: OBTENER EL PERFIL DEL USUARIO LOGUEADO ---
app.get("/api/profile/me", authenticateToken, async (req, res) => {
  console.log(
    "Solicitud GET /api/profile/me recibida para usuario:",
    req.user.id_usuario
  );
  const userId = req.user.id_usuario;
  const userProfileType = req.user.tipo_perfil;

  try {
    let profileData = {};
    console.log("Consultando datos de usuario principal...");
    const [users] = await pool.query(
      "SELECT id_usuario, nombre_usuario, correo_electronico, tipo_perfil, foto_perfil_url, descripcion_perfil, reputacion FROM usuarios WHERE id_usuario = ?", // <-- ¡AQUÍ ESTÁ EL CAMBIO! Se agregó 'reputacion'
      [userId]
    );

    if (users.length === 0) {
      console.log(
        "Error 404: Perfil de usuario no encontrado para ID:",
        userId
      );
      return res
        .status(404)
        .json({ message: "Perfil de usuario no encontrado." });
    }
    profileData = users[0]; // Opcional: Asegurarse de que reputacion tenga un valor por defecto si por alguna razón fuera null
    profileData.reputacion = profileData.reputacion || 0;
    console.log(
      "Datos de usuario principal obtenidos:",
      profileData.nombre_usuario
    ); // Si la foto_perfil_url existe, conviértela a una URL completa

    if (profileData.foto_perfil_url) {
      profileData.foto_perfil_url = `${req.protocol}://${req.get("host")}${
        profileData.foto_perfil_url
      }`;
    } else {
      profileData.foto_perfil_url = ""; // Asegúrate de que siempre haya un string vacío si no hay imagen
    } // Consulta los datos específicos del perfil (emprendedor o diseñador_marketing)

    if (userProfileType === "Emprendedor") {
      console.log("Consultando datos de emprendedor...");
      const [emprendedorData] = await pool.query(
        "SELECT nombre_negocio, localidad, tipo_negocio, desafios_cuenta FROM emprendedor WHERE id_usuario = ?",
        [userId]
      );
      if (emprendedorData.length > 0) {
        profileData = { ...profileData, ...emprendedorData[0] };
      }
    } else if (
      userProfileType === "Diseñador" ||
      userProfileType === "Marketing"
    ) {
      console.log("Consultando datos de diseñador/marketing...");
      const [dmData] = await pool.query(
        "SELECT localidad, modalidad_trabajo FROM disenador_marketing WHERE id_usuario = ?",
        [userId]
      );
      if (dmData.length > 0) {
        profileData = { ...profileData, ...dmData[0] };
      }
    }

    console.log("Consultando proyectos y fotos del usuario...");
    const [projects] = await pool.query(
      "SELECT p.id_proyecto, p.titulo_proyecto, p.descripcion_proyecto, p.fecha_creacion, p.estado, i.id_imagen, i.url_imagen, i.descripcion_imagen FROM proyecto p LEFT JOIN imagen i ON p.id_proyecto = i.id_proyecto WHERE p.id_usuario = ? ORDER BY p.fecha_creacion DESC, i.orden ASC",
      [userId]
    );
    console.log("Proyectos y fotos obtenidos. Agrupando...");

    const groupedProjects = projects.reduce((acc, row) => {
      if (!acc[row.id_proyecto]) {
        acc[row.id_proyecto] = {
          id_proyecto: row.id_proyecto,
          titulo_proyecto: row.titulo_proyecto,
          descripcion_proyecto: row.descripcion_proyecto,
          fecha_creacion: row.fecha_creacion,
          estado: row.estado,
          imagenes: [],
        };
      }
      if (row.id_imagen) {
        acc[row.id_proyecto].imagenes.push({
          id_imagen: row.id_imagen,
          url_imagen: `${req.protocol}://${req.get("host")}${row.url_imagen}`,
          descripcion_imagen: row.descripcion_imagen,
        });
      }
      return acc;
    }, {});

    profileData.proyectos = Object.values(groupedProjects);
    console.log("Perfil completo enviado al frontend.");
    res.status(200).json(profileData);
  } catch (error) {
    console.error("Error general al obtener el perfil del usuario:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
});

// =======================================================
// NUEVAS RUTAS PARA NOTIFICACIONES Y SOLICITUDES DE CONTACTO
// =======================================================

// 1. Ruta para ENVIAR una solicitud de contacto
app.post('/api/solicitudes-contacto', authenticateToken, async (req, res) => {
    console.log("Solicitud de contacto recibida. Datos:", req.body);
    const { id_receptor, email, whatsapp, instagram, tiktok, facebook } = req.body;
    const id_emisor = req.user.id_usuario; // El usuario que envía la solicitud

    if (!id_emisor || !id_receptor) {
        return res.status(400).json({ message: 'ID del emisor y receptor son requeridos.' });
    }
    if (id_emisor === id_receptor) {
        return res.status(400).json({ message: 'No puedes enviarte una solicitud de contacto a ti mismo.' });
    }

    let connection; // Usamos una conexión para la transacción
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction(); // Iniciar transacción

        // Verificar si ya existe una solicitud pendiente
        const [existingRequests] = await connection.query(
            'SELECT * FROM solicitudes_contacto WHERE id_emisor = ? AND id_receptor = ? AND estatus = ?',
            [id_emisor, id_receptor, 'Pendiente']
        );

        if (existingRequests.length > 0) {
            await connection.rollback(); // Rollback si ya existe
            return res.status(409).json({ message: 'Ya existe una solicitud pendiente para este usuario.' });
        }

        // Obtener el nombre del emisor para la notificación
        const [emisorProfile] = await connection.query('SELECT nombre_usuario FROM usuarios WHERE id_usuario = ?', [id_emisor]);
        const emisor_nombre = emisorProfile.length > 0 ? emisorProfile[0].nombre_usuario : 'Usuario Desconocido';

        // Insertar la solicitud de contacto
        const query = `
            INSERT INTO solicitudes_contacto (
                id_emisor,
                id_receptor,
                email,
                whatsapp,
                instagram,
                tiktok,
                facebook,
                estatus,
                creado_fecha
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())
        `;
        const values = [
            id_emisor,
            id_receptor,
            email || null,
            whatsapp || null,
            instagram || null,
            tiktok || null,
            facebook || null,
            'Pendiente'
        ];

        const [result] = await connection.query(query, values);
        const id_solicitud_generada = result.insertId; // ID de la solicitud de contacto generada

        // Insertar una notificación para el RECEPTOR
        const notificationTitle = 'Nueva Solicitud de Contacto';
        const notificationMessage = `¡${emisor_nombre} te ha enviado una solicitud de contacto!`;
        const notificationUrl = `/notificaciones?solicitud=${id_solicitud_generada}`; // Redireccionar a la página de notificaciones

        await connection.query(
            'INSERT INTO notificaciones (id_usuario_receptor, tipo_notificacion, titulo, mensaje, url_redireccion, id_referencia, leida) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_receptor, 'solicitud_contacto', notificationTitle, notificationMessage, notificationUrl, id_solicitud_generada, false]
        );

        await connection.commit(); // Confirmar transacción
        res.status(201).json({ message: 'Solicitud de contacto enviada con éxito.', id_solicitud: id_solicitud_generada });

    } catch (error) {
        if (connection) await connection.rollback(); // Deshacer si hay error
        console.error('Error al enviar solicitud de contacto:', error);
        res.status(500).json({ message: 'Error interno del servidor al procesar la solicitud de contacto.', error: error.message });
    } finally {
        if (connection) connection.release(); // Liberar conexión
    }
});

// 2. Ruta para OBTENER solicitudes de contacto recibidas (filtrar por estatus)
app.get('/api/solicitudes-recibidas', authenticateToken, async (req, res) => {
    console.log("Solicitud GET /api/solicitudes-recibidas para usuario:", req.user.id_usuario);
    const id_receptor = req.user.id_usuario;
    const estatus = req.query.estatus || 'Pendiente'; // Por defecto, obtener solicitudes pendientes

    try {
        const query = `
            SELECT
                s.id_solicitud,
                s.creado_fecha,
                s.estatus,
                s.email AS emisor_email,
                s.whatsapp AS emisor_whatsapp,
                s.instagram AS emisor_instagram,
                s.tiktok AS emisor_tiktok,
                s.facebook AS emisor_facebook,
                u.id_usuario AS emisor_id,
                u.nombre_usuario AS emisor_nombre,
                u.foto_perfil_url AS emisor_foto_perfil
            FROM
                solicitudes_contacto s
            JOIN
                usuarios u ON s.id_emisor = u.id_usuario
            WHERE
                s.id_receptor = ? AND s.estatus = ?
            ORDER BY
                s.creado_fecha DESC;
        `;
        const [rows] = await pool.query(query, [id_receptor, estatus]);

        rows.forEach(solicitud => {
            if (solicitud.emisor_foto_perfil) {
                solicitud.emisor_foto_perfil = `${req.protocol}://${req.get('host')}${solicitud.emisor_foto_perfil}`;
            }
        });

        res.json(rows);

    } catch (error) {
        console.error('Error al obtener solicitudes de contacto recibidas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener solicitudes recibidas.' });
    }
});

// 3. Ruta para ACEPTAR una solicitud de contacto
app.patch('/api/solicitudes/:id_solicitud/aceptar', authenticateToken, async (req, res) => {
    console.log("Solicitud PATCH /api/solicitudes/:id_solicitud/aceptar para solicitud:", req.params.id_solicitud, "por usuario:", req.user.id_usuario);
    const { id_solicitud } = req.params;
    const id_receptor = req.user.id_usuario; // El usuario logueado es el receptor que está aceptando

    let connection; // Usamos una conexión para la transacción
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Obtener la solicitud para verificar y obtener el id_emisor y el nombre del receptor
        const [requests] = await connection.query(
            'SELECT sc.id_emisor, u.nombre_usuario AS receptor_nombre FROM solicitudes_contacto sc JOIN usuarios u ON sc.id_receptor = u.id_usuario WHERE sc.id_solicitud = ? AND sc.id_receptor = ? AND sc.estatus = ?',
            [id_solicitud, id_receptor, 'Pendiente']
        );

        if (requests.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Solicitud no encontrada o no pendiente para este usuario.' });
        }

        const id_emisor = requests[0].id_emisor; // ID del emisor de la solicitud
        const receptor_nombre = requests[0].receptor_nombre; // Nombre del usuario que acepta (el receptor)

        // 2. Actualizar el estatus de la solicitud a 'Aceptada'
        const [result] = await connection.query(
            'UPDATE solicitudes_contacto SET estatus = ?, fecha_respuesta = CURRENT_TIMESTAMP() WHERE id_solicitud = ? AND id_receptor = ? AND estatus = ?',
            ['Aceptada', id_solicitud, id_receptor, 'Pendiente']
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Solicitud no encontrada o no pendiente para este usuario.' });
        }

        // 3. Crear una notificación para el EMISOR de la solicitud
        const notificationTitleEmisorAccepted = 'Solicitud de Contacto Aceptada';
        const mensajeNotificacionAccepted = `¡Tu solicitud de contacto ha sido ACEPTADA por ${receptor_nombre}!`;
        const urlRedireccionAccepted = `/notificaciones?solicitud=${id_solicitud}`; // O a una vista de detalles de la solicitud

        await connection.query(
            'INSERT INTO notificaciones (id_usuario_receptor, tipo_notificacion, titulo, mensaje, url_redireccion, id_referencia, leida) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_emisor, 'solicitud_aceptada', notificationTitleEmisorAccepted, mensajeNotificacionAccepted, urlRedireccionAccepted, id_solicitud, false]
        );

        await connection.commit();
        res.json({ message: 'Solicitud de contacto aceptada con éxito y emisor notificado.' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error al aceptar solicitud de contacto:', error);
        res.status(500).json({ message: 'Error interno del servidor al aceptar la solicitud.', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// 4. Ruta para RECHAZAR una solicitud de contacto
app.patch('/api/solicitudes/:id_solicitud/rechazar', authenticateToken, async (req, res) => {
    console.log("Solicitud PATCH /api/solicitudes/:id_solicitud/rechazar para solicitud:", req.params.id_solicitud, "por usuario:", req.user.id_usuario);
    const { id_solicitud } = req.params;
    const id_receptor = req.user.id_usuario; // El usuario logueado es el receptor que está rechazando

    let connection; // Usamos una conexión para la transacción
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Obtener la solicitud para verificar y obtener el id_emisor y el nombre del receptor
        const [requests] = await connection.query(
            'SELECT sc.id_emisor, u.nombre_usuario AS receptor_nombre FROM solicitudes_contacto sc JOIN usuarios u ON sc.id_receptor = u.id_usuario WHERE sc.id_solicitud = ? AND sc.id_receptor = ? AND sc.estatus = ?',
            [id_solicitud, id_receptor, 'Pendiente']
        );

        if (requests.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Solicitud no encontrada o no pendiente para este usuario.' });
        }

        const id_emisor = requests[0].id_emisor; // ID del emisor de la solicitud
        const receptor_nombre = requests[0].receptor_nombre; // Nombre del usuario que rechaza (el receptor)

        // 2. Actualizar el estatus de la solicitud a 'Rechazada'
        const [result] = await connection.query(
            'UPDATE solicitudes_contacto SET estatus = ?, fecha_respuesta = CURRENT_TIMESTAMP() WHERE id_solicitud = ? AND id_receptor = ? AND estatus = ?',
            ['Rechazada', id_solicitud, id_receptor, 'Pendiente']
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Solicitud no encontrada o no pendiente para este usuario.' });
        }

        // 3. Crear una notificación para el EMISOR de la solicitud
        const notificationTitleEmisorRejected = 'Solicitud de Contacto Rechazada';
        const mensajeNotificacionRejected = `Tu solicitud de contacto ha sido RECHAZADA por ${receptor_nombre}.`;
        const urlRedireccionRejected = `/notificaciones?solicitud=${id_solicitud}`; // O a una vista de detalles de la solicitud

        await connection.query(
            'INSERT INTO notificaciones (id_usuario_receptor, tipo_notificacion, titulo, mensaje, url_redireccion, id_referencia, leida) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_emisor, 'solicitud_rechazada', notificationTitleEmisorRejected, mensajeNotificacionRejected, urlRedireccionRejected, id_solicitud, false]
        );

        await connection.commit();
        res.json({ message: 'Solicitud de contacto rechazada con éxito y emisor notificado.' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error al rechazar solicitud de contacto:', error);
        res.status(500).json({ message: 'Error interno del servidor al rechazar la solicitud.', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// 5. Ruta para OBTENER las notificaciones del usuario logueado
app.get('/api/notificaciones', authenticateToken, async (req, res) => {
    console.log("Solicitud GET /api/notificaciones para usuario:", req.user.id_usuario);
    const id_usuario_receptor = req.user.id_usuario;
    const soloNoLeidas = req.query.leida === 'false'; // Parámetro de consulta para filtrar por no leídas

    try {
        let query = `
            SELECT
                n.id_notificacion,
                n.tipo_notificacion,
                n.titulo,
                n.mensaje,
                n.url_redireccion,
                n.id_referencia,
                n.leida,
                n.creado_fecha AS creado_en, -- Asegúrate de que tu columna se llame 'creado_fecha' si es la que usas en DB
                -- Incluir datos de la solicitud de contacto si es de ese tipo
                sc.estatus AS estatus_solicitud,
                sc.email AS emisor_email,
                sc.whatsapp AS emisor_whatsapp,
                sc.instagram AS emisor_instagram,
                sc.tiktok AS emisor_tiktok,
                sc.facebook AS emisor_facebook,
                u_emisor.nombre_usuario AS emisor_nombre,
                u_emisor.foto_perfil_url AS emisor_foto_perfil
            FROM
                notificaciones n
            LEFT JOIN
                solicitudes_contacto sc ON n.id_referencia = sc.id_solicitud AND n.tipo_notificacion IN ('solicitud_contacto', 'solicitud_aceptada', 'solicitud_rechazada')
            LEFT JOIN
                usuarios u_emisor ON sc.id_emisor = u_emisor.id_usuario
            WHERE
                n.id_usuario_receptor = ?
        `;
        const values = [id_usuario_receptor];

        if (soloNoLeidas) {
            query += ` AND n.leida = FALSE`;
        }

        query += ` ORDER BY n.creado_fecha DESC`; // Ordenar por fecha de creación descendente

        const [rows] = await pool.query(query, values);

        rows.forEach(notification => {
            if (notification.emisor_foto_perfil) {
                notification.emisor_foto_perfil = `${req.protocol}://${req.get('host')}${notification.emisor_foto_perfil}`;
            }
        });

        res.json(rows);

    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener notificaciones.', error: error.message });
    }
});

// 6. Ruta para MARCAR una notificación como leída
app.patch('/api/notificaciones/:id_notificacion/marcar-leida', authenticateToken, async (req, res) => {
    console.log("Solicitud PATCH /api/notificaciones/:id_notificacion/marcar-leida para notificación:", req.params.id_notificacion, "por usuario:", req.user.id_usuario);
    const { id_notificacion } = req.params;
    const id_usuario_receptor = req.user.id_usuario; // El usuario logueado debe ser el receptor de la notificación

    try {
        const [result] = await pool.query(
            'UPDATE notificaciones SET leida = TRUE WHERE id_notificacion = ? AND id_usuario_receptor = ? AND leida = FALSE',
            [id_notificacion, id_usuario_receptor]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notificación no encontrada o ya marcada como leída para este usuario.' });
        }

        res.json({ message: 'Notificación marcada como leída con éxito.' });

    } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
        res.status(500).json({ message: 'Error interno del servidor al marcar la notificación como leída.', error: error.message });
    }
});


// --- RUTA: PARA ACTUALIZAR LA DESCRIPCIÓN DEL PERFIL ---
app.patch("/api/profile/description", authenticateToken, async (req, res) => {
  console.log(
    "Solicitud PATCH /api/profile/description recibida para usuario:",
    req.user.id_usuario
  );
  const userId = req.user.id_usuario;
  const { description } = req.body;

  if (description === undefined || description === null) {
    console.warn("Error 400: Descripción no proporcionada.");
    return res.status(400).json({ message: "La descripción es requerida." });
  }

  try {
    const [result] = await pool.query(
      "UPDATE usuarios SET descripcion_perfil = ? WHERE id_usuario = ?",
      [description, userId]
    );

    if (result.affectedRows === 0) {
      console.warn(
        `No se encontró usuario con ID ${userId} para actualizar la descripción.`
      );
      return res
        .status(404)
        .json({ message: "Usuario no encontrado o descripción no cambiada." });
    }

    console.log(
      `Descripción actualizada para userId ${userId}. Nueva descripción: "${description}"`
    );
    res.status(200).json({ message: "Descripción actualizada exitosamente!" });
  } catch (error) {
    console.error("Error al actualizar la descripción en la DB:", error);
    res.status(500).json({
      message: "Error interno del servidor al actualizar la descripción.",
      error: error.message,
    });
  }
});

// --- RUTA: SUBIR MÚLTIPLES IMÁGENES AL PORTAFOLIO ---
app.post(
  "/api/upload-portfolio-images",
  authenticateToken,
  upload.array("portfolioImages", 10),
  async (req, res) => {
    console.log(
      "Solicitud POST /api/upload-portfolio-images recibida para usuario:",
      req.user.id_usuario
    );
    const userId = req.user.id_usuario;

    if (!req.files || req.files.length === 0) {
      console.error("Error: No se han subido archivos para el portafolio.");
      return res
        .status(400)
        .json({ message: "No se han subido archivos de imagen." });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();
    const uploadedImageUrls = [];

    try {
      // 1. Buscar o crear un proyecto genérico para el portafolio del usuario
      let projectId;
      const [existingProjects] = await connection.query(
        "SELECT id_proyecto FROM proyecto WHERE id_usuario = ? AND titulo_proyecto = ?",
        [userId, "Mi Portafolio"]
      );

      if (existingProjects.length > 0) {
        projectId = existingProjects[0].id_proyecto;
        console.log(
          `Proyecto 'Mi Portafolio' existente encontrado para userId ${userId}: ${projectId}`
        );
      } else {
        // Si no existe, crear un nuevo proyecto genérico
        console.log(
          `Creando nuevo proyecto 'Mi Portafolio' para userId ${userId}...`
        );
        const [newProjectResult] = await connection.query(
          "INSERT INTO proyecto (id_usuario, titulo_proyecto, descripcion_proyecto, fecha_creacion, estado) VALUES (?, ?, ?, NOW(), ?)",
          [
            userId,
            "Mi Portafolio",
            "Imágenes de mi portafolio personal.",
            "Activo",
          ]
        );
        projectId = newProjectResult.insertId;
        console.log(`Proyecto 'Mi Portafolio' creado con ID: ${projectId}`);
      }

      // 2. Insertar cada imagen en la tabla 'imagen' y asociarla al proyecto
      for (const file of req.files) {
        const imageUrl = `/uploads/${file.filename}`;
        const [imageResult] = await connection.query(
          "INSERT INTO imagen (id_proyecto, url_imagen, descripcion_imagen) VALUES (?, ?, ?)",
          [projectId, imageUrl, "Imagen de portafolio"] // Puedes añadir una descripción por defecto
        );
        const id_imagen = imageResult.insertId;
        const fullImageUrl = `${req.protocol}://${req.get("host")}${imageUrl}`;
        uploadedImageUrls.push({
          id_imagen,
          url_imagen: fullImageUrl,
          descripcion_imagen: "Imagen de portafolio",
        });
        console.log(
          `Imagen de portafolio insertada: ${fullImageUrl} para proyecto ${projectId}`
        );
      }

      await connection.commit();
      console.log("Imágenes de portafolio subidas y guardadas exitosamente.");
      res.status(200).json({
        message: "Imágenes subidas exitosamente!",
        images: uploadedImageUrls,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error al subir imágenes al portafolio:", error);
      res.status(500).json({
        message: "Error interno del servidor al subir imágenes.",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  }
);

// --- RUTA: ELIMINAR IMAGEN DEL PORTAFOLIO ---
app.delete(
  "/api/delete-portfolio-image/:id_imagen",
  authenticateToken,
  async (req, res) => {
    console.log(
      "Solicitud DELETE /api/delete-portfolio-image recibida para imagen ID:",
      req.params.id_imagen
    );
    const imageId = req.params.id_imagen;
    const userId = req.user.id_usuario;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Obtener la URL de la imagen y verificar que pertenece al usuario
      const [images] = await connection.query(
        "SELECT i.url_imagen FROM imagen i JOIN proyecto p ON i.id_proyecto = p.id_proyecto WHERE i.id_imagen = ? AND p.id_usuario = ?",
        [imageId, userId]
      );

      if (images.length === 0) {
        console.warn(
          `Error 404/403: Imagen con ID ${imageId} no encontrada o no pertenece al usuario ${userId}.`
        );
        await connection.rollback();
        return res.status(404).json({
          message: "Imagen no encontrada o no tienes permiso para eliminarla.",
        });
      }

      const imageUrlToDelete = images[0].url_imagen;
      const filePath = path.join(__dirname, imageUrlToDelete); // Obtener la ruta física del archivo

      // 2. Eliminar la imagen de la base de datos
      const [result] = await connection.query(
        "DELETE FROM imagen WHERE id_imagen = ?",
        [imageId]
      );

      if (result.affectedRows === 0) {
        console.warn(`No se eliminó ninguna imagen con ID ${imageId}.`);
        await connection.rollback();
        return res.status(404).json({ message: "Imagen no encontrada." });
      }

      // 3. Eliminar el archivo físico del servidor (opcional, pero recomendado)
      // Asegúrate de que la URL no sea un path absoluto fuera de 'uploads' por seguridad
      if (filePath.startsWith(path.join(__dirname, "uploads"))) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(
              `Error al eliminar el archivo físico ${filePath}:`,
              err
            );
            // No revertimos la DB si falla la eliminación del archivo, solo loggeamos
          } else {
            console.log(`Archivo físico eliminado: ${filePath}`);
          }
        });
      } else {
        console.warn(
          `Intento de eliminar archivo fuera del directorio de uploads: ${filePath}`
        );
      }

      await connection.commit();
      console.log(`Imagen con ID ${imageId} eliminada exitosamente de la DB.`);
      res.status(200).json({ message: "Imagen eliminada exitosamente!" });
    } catch (error) {
      await connection.rollback();
      console.error("Error al eliminar la imagen del portafolio:", error);
      res.status(500).json({
        message: "Error interno del servidor al eliminar la imagen.",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  }
);

// --- RUTAS DE DESAFÍOS ---

// --- RUTA: CREAR UN NUEVO DESAFÍO (Ahora usa authorizeEntrepreneur) ---
app.post(
  "/api/challenges",
  authenticateToken,
  authorizeEntrepreneur,
  async (req, res) => {
    console.log(
      "Solicitud POST /api/challenges recibida para usuario:",
      req.user.id_usuario
    );
    const userId = req.user.id_usuario; // ID del usuario autenticado
    // Ya no necesitas userProfileType aquí porque authorizeEntrepreneur ya lo verificó.
    // const userProfileType = req.user.tipo_perfil; // Removido, ahora lo maneja el middleware

    // 1. (Verificación de Emprendedor ya manejada por authorizeEntrepreneur)

    // 2. Validación de campos del desafío
    const { nombre_desafio, descripcion_desafio, beneficios, duracion_dias } =
      req.body;

    if (
      !nombre_desafio ||
      !descripcion_desafio ||
      !beneficios ||
      !duracion_dias
    ) {
      console.warn("Error 400: Campos de desafío incompletos.");
      return res
        .status(400)
        .json({ message: "Todos los campos del desafío son obligatorios." });
    }
    if (typeof duracion_dias !== "number" || duracion_dias <= 0) {
      console.warn("Error 400: Duración de días inválida.");
      return res.status(400).json({
        message: "La duración del desafío debe ser un número positivo de días.",
      });
    }

    const connection = await pool.getConnection(); // Obtener conexión aquí para la transacción
    await connection.beginTransaction(); // Iniciar transacción

    try {
      // 3. Obtener el id_emprendedor y el contador de desafíos creados
      console.log(
        "Buscando id_emprendedor y contador de desafíos para id_usuario:",
        userId
      );
      const [emprendedorResult] = await connection.query(
        // Usar 'connection' para la transacción
        "SELECT id_emprendedor, desafios_cuenta FROM emprendedor WHERE id_usuario = ?",
        [userId]
      );

      if (emprendedorResult.length === 0) {
        console.warn(
          "Error 404: No se encontró el id_emprendedor asociado al id_usuario.",
          userId
        );
        await connection.rollback(); // Revertir transacción
        return res.status(404).json({
          message:
            "No se encontró el perfil de emprendedor asociado a este usuario.",
        });
      }
      const { id_emprendedor, desafios_cuenta } = emprendedorResult[0];
      console.log(
        "id_emprendedor encontrado:",
        id_emprendedor,
        "Desafíos creados:",
        desafios_cuenta
      );

      // --- LÓGICA: VERIFICAR LÍMITE DE DESAFÍOS GRATUITOS ---
      const MAX_FREE_CHALLENGES = 3;
      if (desafios_cuenta >= MAX_FREE_CHALLENGES) {
        console.warn(
          "Error 402: El emprendedor ha alcanzado el límite de desafíos gratuitos."
        );
        await connection.rollback(); // Revertir transacción
        return res.status(402).json({
          message: `Has alcanzado el límite de ${MAX_FREE_CHALLENGES} desafíos gratuitos. Por favor, realiza un pago para crear más desafíos.`,
        });
      }
      // --- FIN LÓGICA LÍMITE ---

      // --- LÓGICA: VERIFICAR SI YA TIENE UN DESAFÍO ACTIVO (EXISTENTE) ---
      console.log(
        "Verificando desafíos activos para id_emprendedor:",
        id_emprendedor
      );
      const [activeChallenges] = await connection.query(
        // Usar 'connection' para la transacción
        "SELECT id_desafio FROM desafios WHERE id_emprendedor = ? AND fecha_fin >= CURDATE()",
        [id_emprendedor]
      );

      if (activeChallenges.length > 0) {
        console.warn(
          "Error 409: El emprendedor ya tiene un desafío activo y no puede crear otro."
        );
        await connection.rollback(); // Revertir transacción
        return res.status(409).json({
          message:
            "Ya tienes un desafío activo. Debes esperar a que finalice para crear uno nuevo.",
        });
      }
      console.log(
        "No se encontraron desafíos activos. Procediendo a crear el nuevo desafío."
      );
      // --- FIN LÓGICA EXISTENTE ---

      // 4. Calcular fecha_fin
      const fechaCreacion = new Date();
      const fechaFin = new Date(fechaCreacion);
      fechaFin.setDate(fechaCreacion.getDate() + duracion_dias);

      // 5. Insertar el desafío en la tabla 'desafios'
      // NOTA: Asumo que la tabla 'desafios' tiene una columna 'estado' y que por defecto es 'Activo'.
      const [result] = await connection.query(
        // Usar 'connection' para la transacción
        "INSERT INTO desafios (id_emprendedor, nombre_desafio, descripcion_desafio, beneficios, dias_duracion, fecha_creacion, fecha_fin, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id_emprendedor,
          nombre_desafio,
          descripcion_desafio,
          beneficios,
          duracion_dias,
          fechaCreacion,
          fechaFin,
          "Activo",
        ] // 'Activo' como estado inicial
      );

      // 6. Incrementar el contador de desafíos creados para el emprendedor
      await connection.query(
        // Usar 'connection' para la transacción
        "UPDATE emprendedor SET desafios_cuenta = desafios_cuenta + 1 WHERE id_emprendedor = ?",
        [id_emprendedor]
      );
      console.log("Contador de desafíos creados incrementado.");

      await connection.commit(); // Confirmar transacción
      console.log(
        `Desafío creado exitosamente para id_emprendedor ${id_emprendedor}. ID: ${result.insertId}`
      );

      // Devolver el nuevo contador para que el frontend lo use
      res.status(201).json({
        message: "Desafío creado exitosamente!",
        id_desafio: result.insertId,
        desafios_restantes_gratuitos:
          MAX_FREE_CHALLENGES - (desafios_cuenta + 1),
      });
    } catch (error) {
      await connection.rollback(); // Revertir transacción en caso de error
      console.error("Error al crear el desafío en la DB:", error);
      res.status(500).json({
        message: "Error interno del servidor al crear el desafío.",
        error: error.message,
      });
    } finally {
      connection.release(); // Liberar conexión
    }
  }
);

// --- RUTA: OBTENER DESAFÍOS CREADOS POR EL USUARIO LOGUEADO (Ahora usa authorizeEntrepreneur) ---
app.get(
  "/api/challenges/me",
  authenticateToken,
  authorizeEntrepreneur,
  async (req, res) => {
    console.log(
      "Solicitud GET /api/challenges/me recibida para usuario:",
      req.user.id_usuario
    );
    const userId = req.user.id_usuario; // ID del usuario autenticado
    // Ya no necesitas userProfileType aquí porque authorizeEntrepreneur ya lo verificó.
    // const userProfileType = req.user.tipo_perfil; // Removido, ahora lo maneja el middleware

    // 1. (Verificación de Emprendedor ya manejada por authorizeEntrepreneur)

    try {
      // 2. Obtener el id_emprendedor a partir del id_usuario
      console.log("Buscando id_emprendedor para id_usuario:", userId);
      const [emprendedorResult] = await pool.query(
        "SELECT id_emprendedor FROM emprendedor WHERE id_usuario = ?",
        [userId]
      );

      if (emprendedorResult.length === 0) {
        console.warn(
          "Error 404: No se encontró el id_emprendedor asociado al id_usuario.",
          userId
        );
        return res.status(404).json({
          message:
            "No se encontró el perfil de emprendedor asociado a este usuario.",
        });
      }
      const id_emprendedor = emprendedorResult[0].id_emprendedor;
      console.log(
        "id_emprendedor encontrado para obtener desafíos:",
        id_emprendedor
      );

      // 3. Obtener los desafíos asociados a ese id_emprendedor
      // FILTRO: SOLO LOS DESAFÍOS CUYA FECHA DE FIN ES HOY O EN EL FUTURO
      const [challenges] = await pool.query(
        "SELECT id_desafio, id_emprendedor, nombre_desafio, descripcion_desafio, beneficios, dias_duracion, fecha_creacion, fecha_fin, estado FROM desafios WHERE id_emprendedor = ? AND fecha_fin >= CURDATE() ORDER BY fecha_creacion DESC",
        [id_emprendedor]
      );

      console.log(
        `Desafíos obtenidos para id_emprendedor ${id_emprendedor}: ${challenges.length} desafíos (filtrando expirados).`
      );
      res.status(200).json(challenges);
    } catch (error) {
      console.error("Error al obtener los desafíos del usuario:", error);
      res.status(500).json({
        message: "Error interno del servidor al obtener desafíos.",
        error: error.message,
      });
    }
  }
);

// --- NUEVA RUTA: OBTENER TODOS LOS DESAFÍOS ACTIVOS CREADOS POR CUALQUIER EMPRENDEDOR ---
// Esta ruta es para los roles de Diseñador y Marketing
app.get(
  "/api/desafios_activos_emprendedores",
  authenticateToken,
  authorizeDesignerMarketing,
  async (req, res) => {
    console.log(
      "Solicitud GET /api/desafios_activos_emprendedores recibida para usuario:",
      req.user.id_usuario
    );

    try {
      // Consulta SQL para obtener desafíos activos (fecha_fin >= CURDATE())
      // y unir con la tabla 'usuarios' para obtener el nombre del emprendedor.
      const [rows] = await pool.query(`
            SELECT
                d.id_desafio,
                d.nombre_desafio,
                d.descripcion_desafio,
                d.beneficios,
                d.dias_duracion,
                d.fecha_creacion,
                d.fecha_fin,
                d.estado,
                u.nombre_usuario AS nombre_usuario_emprendedor
            FROM
                desafios d
            JOIN
                emprendedor e ON d.id_emprendedor = e.id_emprendedor
            JOIN
                usuarios u ON e.id_usuario = u.id_usuario
            WHERE
                d.fecha_fin >= CURDATE()
            ORDER BY
                d.fecha_creacion DESC;
        `);

      console.log(
        `Desafíos activos de emprendedores obtenidos: ${rows.length}`
      );
      res.status(200).json(rows);
    } catch (err) {
      console.error("Error al obtener desafíos activos de emprendedores:", err);
      res.status(500).json({
        message: "Error interno del servidor al obtener desafíos activos.",
        error: err.message,
      });
    }
  }
);

// --- NUEVA RUTA: OBTENER TODOS LOS PERFILES (EXCEPTO EL DEL USUARIO LOGUEADO) ---
app.get("/api/profiles", authenticateToken, async (req, res) => {
  console.log(
    "Solicitud GET /api/profiles recibida para usuario:",
    req.user.id_usuario
  );
  const currentUserId = req.user.id_usuario;

  try {
    // Consulta para obtener todos los usuarios, uniéndolos con sus tablas de perfil específicas
    // Excluimos al usuario actualmente logueado
    const [allProfiles] = await pool.query(
      `SELECT
                u.id_usuario,
                u.nombre_usuario,
                u.tipo_perfil,
                u.foto_perfil_url,
                u.descripcion_perfil,
                e.nombre_negocio,
                e.localidad AS emprendedor_localidad,
                e.tipo_negocio,
                dm.localidad AS dm_localidad,
                dm.modalidad_trabajo
            FROM
                usuarios u
            LEFT JOIN
                emprendedor e ON u.id_usuario = e.id_usuario
            LEFT JOIN
                disenador_marketing dm ON u.id_usuario = dm.id_usuario
            WHERE
                u.id_usuario != ?`, // Excluye el perfil del usuario logueado
      [currentUserId]
    );

    console.log(
      `Perfiles obtenidos (excluyendo el actual): ${allProfiles.length}`
    );

    // Procesar los resultados para un formato consistente
    const formattedProfiles = allProfiles.map((profile) => {
      let profession = profile.tipo_perfil;
      let location = "";
      let description =
        profile.descripcion_perfil || "Aún no ha añadido una descripción."; // Default description

      // Determinar la profesión y la localidad basada en el tipo de perfil
      if (profile.tipo_perfil === "Emprendedor") {
        profession = profile.nombre_negocio || "Emprendedor";
        location = profile.emprendedor_localidad || "";
      } else if (profile.tipo_perfil === "Diseñador") {
        profession = "Diseñador";
        location = profile.dm_localidad || "";
      } else if (profile.tipo_perfil === "Marketing") {
        profession = "Especialista en Marketing";
        location = profile.dm_localidad || "";
      }

      // Construir la URL completa de la imagen de perfil
      const fullImageUrl = profile.foto_perfil_url
        ? `${req.protocol}://${req.get("host")}${profile.foto_perfil_url}`
        : ""; // Dejar vacío si no hay URL, el frontend usará el default

      return {
        id_usuario: profile.id_usuario,
        nombre_usuario: profile.nombre_usuario,
        tipo_perfil: profile.tipo_perfil, // Mantener el tipo de perfil
        foto_perfil_url: fullImageUrl,
        descripcion_perfil: description,
        profession: profession, // Nombre del negocio o tipo de profesional
        location: location, // Localidad específica
      };
    });
    res.status(200).json(formattedProfiles);
  } catch (error) {
    console.error("Error al obtener todos los perfiles:", error);
    res.status(500).json({
      message: "Error interno del servidor al obtener perfiles.",
      error: error.message,
    });
  }
});

// --- PARA REACCIONES ACUMULADAS DE LOS LIKES EN FORO

// Asegúrate de que esta es la ruta app.post('/api/replies/:replyId/like')
app.post("/api/replies/:replyId/like", authenticateToken, async (req, res) => {
  const { replyId } = req.params;
  const userId = req.user.id_usuario; // ID del usuario que da el like

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Obtener información de la respuesta y su autor
    const [replyInfo] = await connection.query(
      "SELECT id_usuario FROM foro_mensaje WHERE id_mensaje = ?",
      [replyId]
    );

    if (replyInfo.length === 0) {
      console.warn(`Error 404: Respuesta con ID ${replyId} no encontrada.`);
      await connection.rollback();
      return res.status(404).json({ message: "Respuesta no encontrada." });
    }

    const replyAuthorId = replyInfo[0].id_usuario; // ID del autor de la respuesta

    // Evitar que un usuario se dé "me gusta" a sí mismo
    if (userId === replyAuthorId) {
      console.warn(
        `Error 403: Usuario ${userId} intentó dar like a su propia respuesta ${replyId}.`
      );
      await connection.rollback();
      return res
        .status(403)
        .json({ message: 'No puedes dar "me gusta" a tu propia respuesta.' });
    }

    // 2. Verificar si el usuario ya le dio "me gusta" a esta respuesta
    const [existingLike] = await connection.query(
      "SELECT * FROM foro_reaccion WHERE id_usuario = ? AND id_mensaje = ?",
      [userId, replyId]
    );

    let newLikesCount;
    let likedByCurrentUser;

    if (existingLike.length > 0) {
      // El usuario ya le había dado "me gusta", ahora lo quita (dislike)
      console.log(`Usuario ${userId} quitando like a respuesta ${replyId}.`);
      await connection.query(
        "DELETE FROM foro_reaccion WHERE id_usuario = ? AND id_mensaje = ?",
        [userId, replyId]
      );

      // AGREGAR ESTO: Decrementar reaccion_acumulada del autor de la respuesta
      await connection.query(
        "UPDATE usuarios SET reaccion_acumulada = GREATEST(0, reaccion_acumulada - 1) WHERE id_usuario = ?",
        [replyAuthorId]
      );
      // Consulta para depuración
      const [updatedAuthor] = await connection.query(
        "SELECT reaccion_acumulada FROM usuarios WHERE id_usuario = ?",
        [replyAuthorId]
      );
      console.log(
        `Backend: Reacción acumulada del autor ${replyAuthorId} decrementada. Ahora es: ${updatedAuthor[0].reaccion_acumulada}`
      );

      likedByCurrentUser = false;
    } else {
      // El usuario no le había dado "me gusta", ahora lo añade (like)
      console.log(`Usuario ${userId} dando like a respuesta ${replyId}.`);
      await connection.query(
        "INSERT INTO foro_reaccion (id_usuario, id_mensaje, tipo_reaccion, fecha_reaccion) VALUES (?, ?, ?, NOW())",
        [userId, replyId, "like"] // Asume 'like' como tipo de reacción
      );

      // AGREGAR ESTO: Incrementar reaccion_acumulada del autor de la respuesta
      await connection.query(
        "UPDATE usuarios SET reaccion_acumulada = reaccion_acumulada + 1 WHERE id_usuario = ?",
        [replyAuthorId]
      );
      // Consulta para depuración
      const [updatedAuthor] = await connection.query(
        "SELECT reaccion_acumulada FROM usuarios WHERE id_usuario = ?",
        [replyAuthorId]
      );
      console.log(
        `Backend: Reacción acumulada del autor ${replyAuthorId} incrementada. Ahora es: ${updatedAuthor[0].reaccion_acumulada}`
      );

      likedByCurrentUser = true;
    }

    // 3. Obtener el nuevo conteo total de "me gusta" para esta respuesta
    const [likesCountResult] = await connection.query(
      "SELECT COUNT(*) AS totalLikes FROM foro_reaccion WHERE id_mensaje = ?",
      [replyId]
    );
    newLikesCount = likesCountResult[0].totalLikes;

    await connection.commit();
    console.log(
      `Transacción de like/dislike completada para respuesta ${replyId}. Nuevo conteo: ${newLikesCount}`
    );
    res
      .status(200)
      .json({
        newLikesCount,
        likedByCurrentUser,
        message: "Reacción procesada con éxito.",
      });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error al procesar el "me gusta" en la respuesta:', error);
    res
      .status(500)
      .json({
        message: "Error interno del servidor al procesar la reacción.",
        error: error.message,
      });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// --- RUTAS DEL FORO ---

// 1. Ruta para obtener TODOS los temas del foro (visibles para todos)
app.get("/api/forum/threads", async (req, res) => {
  try {
    const [threads] = await pool.query(`
            SELECT
                f.id_foro AS id,
                f.titulo AS title,
                f.descripcion AS content,
                u.nombre_usuario AS author,
                f.fecha_creacion AS date,
                (SELECT COUNT(*) FROM foro_mensaje fr WHERE fr.id_foro = f.id_foro) AS replies_count
            FROM
                foro f
            JOIN
                usuarios u ON f.id_usuario = u.id_usuario
            ORDER BY
                f.fecha_creacion DESC
        `);

    // No necesitas 'formattedThreads' separado si los nombres de columna ya son buenos.
    // Asegúrate de que los nombres de columna en la consulta SQL coincidan con lo que esperas en el frontend.
    // replies_count ya es lo que el frontend puede esperar como 'replies'.

    res.status(200).json(threads);
  } catch (error) {
    console.error("Error al obtener los temas del foro:", error);
    res.status(500).json({
      message: "Error interno del servidor al obtener temas del foro.",
      error: error.message,
    });
  }
});

// 2. Ruta para CREAR un nuevo tema del foro (requiere autenticación)
app.post("/api/forum/threads", authenticateToken, async (req, res) => {
  if (!req.user) {
    // Asegúrate de que el usuario esté autenticado
    return res.status(401).json({
      message: "No autenticado. Debes iniciar sesión para crear un tema.",
    });
  }
  console.log(
    "Solicitud POST /api/forum/threads recibida para usuario:",
    req.user.id_usuario
  );
  const userId = req.user.id_usuario;
  const { title, content } = req.body;

  if (!title || !content) {
    return res
      .status(400)
      .json({ message: "El título y el contenido del tema son obligatorios." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO foro (id_usuario, titulo, descripcion, fecha_creacion) VALUES (?, ?, ?, NOW())",
      [userId, title, content]
    );

    const newThreadId = result.insertId;
    console.log(
      `Tema de foro creado exitosamente por usuario ${userId}. ID: ${newThreadId}`
    );
    res
      .status(201)
      .json({ message: "Tema creado exitosamente", threadId: newThreadId });
  } catch (error) {
    console.error("Error al crear el tema del foro:", error);
    res.status(500).json({
      message: "Error interno del servidor al crear el tema.",
      error: error.message,
    });
  }
});

// 3. Ruta para obtener un TEMA ESPECÍFICO del foro por ID y sus respuestas con información de likes
app.get("/api/forum/threads/:id", authenticateToken, async (req, res) => {
  const threadId = req.params.id;
  // req.user ya está poblado por authenticateToken, puede ser null si no hay token o es inválido.
  const userId = req.user ? req.user.id_usuario : null;

  console.log(
    `Solicitud GET /api/forum/threads/${threadId} recibida. Usuario autenticado: ${
      userId || "No"
    }`
  );

  try {
    // Obtener el tema principal
    const [threads] = await pool.query(
      `
            SELECT
                f.id_foro AS id,
                f.titulo AS title,
                f.descripcion AS content,
                u.nombre_usuario AS author,
                f.fecha_creacion AS date,
                u.foto_perfil_url AS author_profile_pic
            FROM
                foro f
            JOIN
                usuarios u ON f.id_usuario = u.id_usuario
            WHERE
                f.id_foro = ?
        `,
      [threadId]
    );

    if (threads.length === 0) {
      console.log(`Tema con ID ${threadId} no encontrado.`);
      return res.status(404).json({ message: "Tema del foro no encontrado." });
    }

    const thread = threads[0];
    // Formatear la URL de la foto de perfil del autor del tema
    if (thread.author_profile_pic) {
      thread.author_profile_pic = `${req.protocol}://${req.get("host")}${
        thread.author_profile_pic
      }`;
    } else {
      thread.author_profile_pic = ""; // Si no hay foto, enviar cadena vacía
    }

    // Obtener las respuestas para ese tema
    const [replies] = await pool.query(
      `
            SELECT
                fm.id_mensaje AS id,
                fm.contenido AS content,
                u.nombre_usuario AS author,
                fm.fecha_publicacion AS date,
                u.foto_perfil_url AS author_profile_pic
            FROM
                foro_mensaje fm
            JOIN
                usuarios u ON fm.id_usuario = u.id_usuario
            WHERE
                fm.id_foro = ?
            ORDER BY
                fm.fecha_publicacion ASC
        `,
      [threadId]
    );

    // Para cada respuesta, obtener el conteo de likes y si el usuario actual le dio like
    for (const reply of replies) {
      // Formatear la URL de la foto de perfil del autor de la respuesta
      if (reply.author_profile_pic) {
        reply.author_profile_pic = `${req.protocol}://${req.get("host")}${
          reply.author_profile_pic
        }`;
      } else {
        reply.author_profile_pic = "";
      }

      // Contar likes
      const [likesResult] = await pool.query(
        `SELECT COUNT(*) AS likesCount
                 FROM foro_reaccion
                 WHERE id_mensaje = ? AND tipo_reaccion = 'like'`,
        [reply.id]
      );
      reply.likesCount = likesResult[0].likesCount;

      // Verificar si el usuario actual le dio like
      if (userId) {
        // Solo si hay un usuario autenticado
        const [userLikeResult] = await pool.query(
          `SELECT COUNT(*) AS isLiked
                     FROM foro_reaccion
                     WHERE id_mensaje = ? AND id_usuario = ? AND tipo_reaccion = 'like'`,
          [reply.id, userId]
        );
        reply.likedByCurrentUser = userLikeResult[0].isLiked > 0;
      } else {
        reply.likedByCurrentUser = false; // No autenticado, entonces no ha dado like
      }
    }

    // Añadir las respuestas al objeto del tema
    thread.replies = replies;

    console.log(`Detalles del tema ${threadId} y sus respuestas obtenidos.`);
    res.status(200).json(thread);
  } catch (error) {
    console.error(
      `Error al obtener el tema ${threadId} o sus respuestas:`,
      error
    );
    res.status(500).json({
      message: "Error interno del servidor al obtener el tema del foro.",
      error: error.message,
    });
  }
});

// 4. Ruta para añadir una RESPUESTA a un tema (requiere autenticación)
app.post(
  "/api/forum/threads/:id/replies",
  authenticateToken,
  async (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado. Debes iniciar sesión para responder.",
      });
    }
    const threadId = req.params.id;
    const userId = req.user.id_usuario;
    const { content } = req.body;

    if (!content) {
      return res
        .status(400)
        .json({ message: "El contenido de la respuesta es obligatorio." });
    }

    try {
      // Verificar si el tema existe
      const [threads] = await pool.query(
        "SELECT id_foro FROM foro WHERE id_foro = ?",
        [threadId]
      );
      if (threads.length === 0) {
        return res
          .status(404)
          .json({ message: "El tema al que intentas responder no existe." });
      }

      const [result] = await pool.query(
        "INSERT INTO foro_mensaje (id_foro, id_usuario, contenido, fecha_publicacion) VALUES (?, ?, ?, NOW())",
        [threadId, userId, content]
      );

      const newReplyId = result.insertId;
      console.log(
        `Respuesta añadida al tema ${threadId} por usuario ${userId}. ID: ${newReplyId}`
      );
      res.status(201).json({
        message: "Respuesta publicada exitosamente",
        replyId: newReplyId,
      });
    } catch (error) {
      console.error("Error al añadir respuesta al tema:", error);
      res.status(500).json({
        message: "Error interno del servidor al añadir respuesta.",
        error: error.message,
      });
    }
  }
);

// 1. Ruta para obtener TODOS los perfiles de usuarios
app.get("/api/profiles", async (req, res) => {
  try {
    const [profiles] = await pool.query(`
            SELECT
                u.id_usuario,
                u.nombre_usuario,
                u.tipo_perfil,
                u.descripcion_perfil,
                u.foto_perfil_url,
                u.reputacion,
                -- NUEVO: Subconsulta para contar el total de likes recibidos por el usuario en el foro
                (
                    SELECT SUM(CASE WHEN fr.tipo_reaccion = 'like' THEN 1 ELSE 0 END)
                    FROM foro_mensaje fm
                    LEFT JOIN foro_reaccion fr ON fm.id_mensaje = fr.id_mensaje
                    WHERE fm.id_usuario = u.id_usuario -- Filtra por los mensajes del usuario
                ) AS likes_acumulados_foro
            FROM
                usuarios u
            ORDER BY
                u.nombre_usuario ASC
        `);

    // Formatear las URLs de las fotos de perfil
    const formattedProfiles = profiles.map((profile) => {
      const fotoUrl = profile.foto_perfil_url
        ? `${req.protocol}://${req.get("host")}${profile.foto_perfil_url}`
        : "";

      // Asegúrate de que likes_acumulados_foro sea un número, incluso si es NULL del SQL (significaría 0)
      const likesAcumulados = profile.likes_acumulados_foro || 0;

      return {
        ...profile,
        foto_perfil_url: fotoUrl,
        likes_acumulados_foro: likesAcumulados,
      };
    });

    res.status(200).json(formattedProfiles);
  } catch (error) {
    console.error("Error al obtener los perfiles:", error);
    res.status(500).json({
      message: "Error interno del servidor al obtener perfiles.",
      error: error.message,
    });
  }
});

// 5. NUEVA RUTA: Manejar el "me gusta" para una respuesta específica (toggle like/unlike)
app.post("/api/replies/:replyId/like", authenticateToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'No autenticado. Debes iniciar sesión para dar "me gusta".',
    });
  }
  const replyId = req.params.replyId;
  const userId = req.user.id_usuario;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Verificar si el mensaje (respuesta) existe y obtener su autor
    const [messageDetails] = await connection.query(
      `SELECT id_mensaje, id_usuario FROM foro_mensaje WHERE id_mensaje = ?`,
      [replyId]
    );
    if (messageDetails.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ message: "Mensaje (respuesta) no encontrado." });
    }

    const replyAuthorId = messageDetails[0].id_usuario;

    // **AQUÍ LA MODIFICACIÓN:**
    // Si el ID del usuario autenticado es el mismo que el ID del autor de la respuesta,
    // no permitir el "me gusta" y enviar el mensaje específico.
    if (userId === replyAuthorId) {
      await connection.rollback(); // Revertir la transacción si se abrió
      return res
        .status(403)
        .json({ message: "No puedes reaccionar a tu propia respuesta." }); // ¡Mensaje modificado aquí!
    }
    // **FIN DE LA MODIFICACIÓN**

    // 2. Verificar si el usuario ya reaccionó con 'like' a este mensaje
    const [existingReaction] = await connection.query(
      `SELECT id_reaccion FROM foro_reaccion
             WHERE id_mensaje = ? AND id_usuario = ? AND tipo_reaccion = 'like'`,
      [replyId, userId]
    );

    let action = ""; // Para saber si se dio like o se quitó
    if (existingReaction.length > 0) {
      // Si ya existe, eliminar la reacción (quitar like)
      await connection.query(
        `DELETE FROM foro_reaccion
                 WHERE id_reaccion = ?`,
        [existingReaction[0].id_reaccion]
      );
      action = "unliked";
      console.log(
        `Usuario ${userId} ha quitado el like del mensaje ${replyId}.`
      );
    } else {
      // Si no existe, insertar la reacción (dar like)
      await connection.query(
        `INSERT INTO foro_reaccion (id_mensaje, id_usuario, tipo_reaccion, fecha_reaccion)
                 VALUES (?, ?, ?, NOW())`,
        [replyId, userId, "like"]
      );
      action = "liked";
      console.log(`Usuario ${userId} ha dado like al mensaje ${replyId}.`);
    }

    // 3. Obtener el nuevo conteo de likes para el mensaje
    const [newLikesCountResult] = await connection.query(
      `SELECT COUNT(*) AS newLikesCount
             FROM foro_reaccion
             WHERE id_mensaje = ? AND tipo_reaccion = 'like'`,
      [replyId]
    );
    const newLikesCount = newLikesCountResult[0].newLikesCount;

    await connection.commit();

    res.json({
      success: true,
      message: `Mensaje ${action} exitosamente.`,
      newLikesCount: newLikesCount,
      likedByCurrentUser: action === "liked", // El usuario lo tiene 'like' si la acción fue 'liked'
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error al procesar el like:", err);
    res
      .status(500)
      .json({ message: "Error interno del servidor al procesar la reacción." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de Convenio de Emprendimiento funcionando!");
});

// Inicio del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en el puerto ${PORT}`);
});
