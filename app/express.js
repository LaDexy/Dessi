// Estas son las librerias de importacion
import express from "express";
import mysql from "mysql2/promise"; // importe mysql2 con promesas para operaciones asíncronas
import bcrypt from "bcrypt"; // Para hashear contraseñas y otorgar mayor seguridad
import cors from "cors"; // Para manejar las políticas de Cross-Origin Resource Sharing
import jwt from "jsonwebtoken"; // Para generar JSON Web Tokens
import multer from "multer"; // Para manejar la carga de archivos (en este caso son las imagenes que puede subir el usuario)
import path from "path"; // Para manejar rutas de archivos (funcion para subir archivos cuando usuario participe en desafios)
import { fileURLToPath } from "url"; // Para obtener __dirname en ES Modules
import fs from "fs"; // Para crear directorios si no existen

// Estas son las funciones para __filename y __dirname para entornos ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// En esta funcion se crea el servidor Express para conexion con la base de datos creada en MySQL, phpAdmin y servidor WampServer
const app = express();

// Configuracion de los middlewares
// Middleware de CORS, lo que permite la conexion de mi interfaz con mi parte Backend
app.use(
  cors({
    origin: "http://localhost:8080", // Ruta de origen de mi interfaz Vue.js
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], 
    allowedHeaders: ["Content-Type", "Authorization"], 
    credentials: true, // Permite el envío de cookies (aunque aun no esta aplicado, lo agregue para funcionalidad adicional)
  })
);

app.use(express.json()); // Permite a Express parsear cuerpos de solicitud JSON
app.use(express.urlencoded({ extended: true })); // Para formularios URL-encoded

// Esta funcion es para cuando los usuarios suban sus imagenes de perfil o de portafolio, seagreguen en la carpeta creada llamada uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configuración de la conexión a la base de datos MySQL
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "convenio_emprendimiento", // Esta es mi base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

// Esta sera mi clave secreta para firmar los JWT
const JWT_SECRET = "H0l4c0m03st4squ13r0qu3s3p4squ33st03sun4cl4v3sup3rd1f1c1lh3ch4p0rm1"; 

// --- CONFIGURACIÓN DE MULTER ---

// 1. Configuración de Multer para la funcionalidad del gestor web de subir imagenes
//    Variable 'upload'
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

// 2. Configuración de Multer que se enfoca especificamente e subir archivos para participar en desafios (funcion todavia en observacion)

const proposalsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads", "proposals");
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const uploadPropuesta = multer({
  storage: proposalsStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Para las propuestas de desafios agregue un maximo de peso de archivo en 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif)!"));
  },
});

// --- FIN DE LA CONFIGURACIÓN DE MULTER ---

// --- MIDDLEWARES DE AUTENTICACIÓN Y AUTORIZACIÓN ---

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

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
    req.user = user;
    console.log(
      "Token autenticado para usuario:",
      user.id_usuario,
      user.nombre_usuario,
      user.tipo_perfil
    );
    next();
  });
};

const authorizeEntrepreneur = (req, res, next) => {
  
  if (req.user && req.user.tipo_perfil === "Emprendedor") {
    next();
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

const authorizeDesignerMarketing = (req, res, next) => {
  if (
    req.user &&
    (req.user.tipo_perfil === "Diseñador" ||
      req.user.tipo_perfil === "Marketing")
  ) {
    next();
  } else {
    console.warn(
      "Error 403: Acceso denegado. Solo Diseñadores y Marketing pueden ver esta lista de desafíos. Tipo de perfil:",
      req.user ? req.user.tipo_perfil : "No especificado"
    );
    res.status(403).json({
      message:
        "Acceso denegado. Solo Diseñadores y Marketing pueden realizar esta acción.", 
    });
  }
};

// --- RUTAS DE AUTENTICACIÓN Y PERFIL ---

// --- RUTA PARA SUBIR Y ACTUALIZAR LA IMAGEN DE PERFIL ---
app.post(
  "/api/upload-profile-image",
  authenticateToken,
  upload.single("profileImage"),
  async (req, res) => {
    
    console.log(
      "Solicitud POST /api/upload-profile-image recibida para usuario:",
      req.user.id_usuario
    );

    if (!req.file) {
      console.log("Error 400: No se ha subido ningún archivo.");
      return res
        .status(400)
        .json({ message: "No se ha subido ningún archivo." });
    }

    const userId = req.user.id_usuario;
    const imageUrl = `/uploads/${req.file.filename}`; 

    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // 1. FUNCION PARA ACTUALIZAR URL DE LA FOTO D PERFIL EN TABLA usuarios DE MI BD
      console.log(
        "Actualizando foto_perfil_url en la DB para usuario:",
        userId
      );
      const [result] = await connection.query(
        "UPDATE usuarios SET foto_perfil_url = ? WHERE id_usuario = ?",
        [imageUrl, userId]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        // OPCION POR SI FALLA LA SUBIDA DE FOTO DE PERFIL
        fs.unlink(req.file.path, (err) => {
          if (err)
            console.error(
              "Error al eliminar archivo subido tras fallo de DB:",
              err
            );
        });
        return res
          .status(404)
          .json({
            message:
              "Usuario no encontrado o no se pudo actualizar la imagen de perfil.",
          });
      }

      await connection.commit();
      console.log(
        "Imagen de perfil subida y URL actualizada en DB exitosamente."
      );
      res.status(200).json({
        message: "Imagen de perfil subida y actualizada correctamente",
        imageUrl: imageUrl, 
        fullImageUrl: `${req.protocol}://${req.get("host")}${imageUrl}`, 
      });
    } catch (error) {
      if (connection) await connection.rollback();
      
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err)
            console.error("Error al eliminar archivo subido tras fallo:", err);
        });
      }
      console.error(
        "Error al procesar la subida de imagen o actualizar la DB:",
        error
      );
      res.status(500).json({
        message: "Error interno del servidor al subir la imagen.",
        error: error.message,
      });
    } finally {
      if (connection) connection.release();
    }
  }
);

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
        
       // SE AÑADE EN LISTA COLUMNA DE REACCION ACUMULADA YA QUE ES UN FUNCION PENDIENTE POR AÑADIR
        "INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena_hash, tipo_perfil, fecha_registro, foto_perfil_url, descripcion_perfil, reputacion, reaccion_acumulada) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)",
        [
          nombre_usuario,
          correo_electronico,
          contrasena_hash,
          tipo_perfil,
          "", 
          "", 
          0, 
          0, 
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

// --- RUTA PARA EL INICIO DE SESION DE USUARIOS ---
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

// --- RUTA PROTEGIDA: OBTENER EL PERFIL DEL USUARIO INICIADO ---
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
    profileData = users[0]; 
        profileData.reputacion = profileData.reputacion || 0;
    console.log(
      "Datos de usuario principal obtenidos:",
      profileData.nombre_usuario
    );

    if (profileData.foto_perfil_url) {
      profileData.foto_perfil_url = `${req.protocol}://${req.get("host")}${
        profileData.foto_perfil_url
      }`;
    } else {
      profileData.foto_perfil_url = ""; 

    } 
    
    // CONSULTA PARA LOS DATOS DE LOS PERFILES POR SEPARADOS (EMPRENDEDOR, DISEÑADOR Y ARKETING)

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

// RUTAS PARA NOTIFICACIONES Y SOLICITUDES DE CONTACTO CUANDO SE DESEE CONTACTAR A USUARIO


// 1. RUTA PARA ENVIAR SOLICITUD DESDE LAS TARJETAS DE PERFILES
app.post("/api/solicitudes-contacto", authenticateToken, async (req, res) => {
    console.log("Solicitud de contacto recibida. Datos:", req.body);
    const { id_receptor, email, whatsapp, instagram, tiktok, facebook } =
        req.body;
    const id_emisor = req.user.id_usuario; 

    if (!id_emisor || !id_receptor) {
        return res
            .status(400)
            .json({ message: "ID del emisor y receptor son requeridos." });
    }
    if (id_emisor === id_receptor) {
        return res.status(400).json({
            message: "No puedes enviarte una solicitud de contacto a ti mismo.",
        });
    }

    let connection; 
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction(); 

        // VERIFICACION DE SOLICITUD EXISTENTE
        const [existingRequests] = await connection.query(
            "SELECT * FROM solicitudes_contacto WHERE id_emisor = ? AND id_receptor = ? AND estatus = ?",
            [id_emisor, id_receptor, "Pendiente"]
        );

        if (existingRequests.length > 0) {
            await connection.rollback(); 
            return res.status(409).json({
                message: "Ya existe una solicitud pendiente para este usuario.",
            });
        }

        // OBTENER NOMBRE DE QUIEN ENVIA SOLICITUD (EN COLUMNA DE TABLA DE BD SE LLAMA id_emisor)
        const [emisorProfile] = await connection.query(
            "SELECT nombre_usuario FROM usuarios WHERE id_usuario = ?",
            [id_emisor]
        );
        const emisor_nombre =
            emisorProfile.length > 0
                ? emisorProfile[0].nombre_usuario
                : "Usuario Desconocido";

        // INSERTAR DATOS DE SOLICITUD
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
            "Pendiente",
        ];

        const [result] = await connection.query(query, values);
        const id_solicitud_generada = result.insertId; 

        // NOTIFICACION DE SOLICITUD A USUARIO RECEPTOR (EN BD LA COLUMNA SE LLAMA id_receptor)
        const notificationTitle = "Nueva Solicitud de Contacto";
        const notificationMessage = `¡${emisor_nombre} te ha enviado una solicitud de contacto!`;
        const notificationUrl = `/notificaciones?solicitud=${id_solicitud_generada}`; 

        await connection.query(
            "INSERT INTO notificaciones (id_usuario_receptor, tipo_notificacion, titulo, mensaje, url_redireccion, id_referencia, leida, creado_fecha) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
            [
                id_receptor,
                "solicitud_contacto",
                notificationTitle,
                notificationMessage,
                notificationUrl,
                id_solicitud_generada,
                false,
            ]
        );

        // CONFIRMACION DE SOLICITUD
        await connection.commit();
        res.status(201).json({
            message: "Solicitud de contacto enviada con éxito.",
            id_solicitud: id_solicitud_generada,
        });
    } catch (error) {

      //ERROR EN LA SOLICITUD
        if (connection) await connection.rollback(); 
        console.error("Error al enviar solicitud de contacto:", error);
        res.status(500).json({
            message:
                "Error interno del servidor al procesar la solicitud de contacto.",
            error: error.message,
        });
    } finally {
        if (connection) connection.release(); 
    }
});

// 2. RUTA PARA OBTENER LAS SOLICITUDES RECIBIDAS SEGUN ESTATUS (COLUMNA DE TABLA DE solicitudes_contacto)
app.get("/api/solicitudes-recibidas", authenticateToken, async (req, res) => {
    console.log(
        "Solicitud GET /api/solicitudes-recibidas para usuario:",
        req.user.id_usuario
    );
    const id_receptor = req.user.id_usuario;
    const estatus = req.query.estatus || "Pendiente"; 

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

        rows.forEach((solicitud) => {
            if (solicitud.emisor_foto_perfil) {
                solicitud.emisor_foto_perfil = `${req.protocol}://${req.get("host")}${
                    solicitud.emisor_foto_perfil
                }`;
            }
        });

        res.json(rows);
    } catch (error) {
        console.error("Error al obtener solicitudes de contacto recibidas:", error);
        res.status(500).json({
            message: "Error interno del servidor al obtener solicitudes recibidas.",
        });
    }
});

// 3. RUTA PARA ACEPTAR SOLICITUD
app.patch(
    "/api/solicitudes/:id_solicitud/aceptar",
    authenticateToken,
    async (req, res) => {
        console.log(
            "Solicitud PATCH /api/solicitudes/:id_solicitud/aceptar para solicitud:",
            req.params.id_solicitud,
            "por usuario:",
            req.user.id_usuario
        );
        const { id_solicitud } = req.params;
        const id_receptor = req.user.id_usuario; 

        let connection; 
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // 1. FUNCION PARA OBTENER ID DEL EMISOR Y EL NOMBRE DEL USUARIO A SOLICITAR
           
            const [requests] = await connection.query(
                "SELECT sc.id_emisor, u.nombre_usuario AS receptor_nombre FROM solicitudes_contacto sc JOIN usuarios u ON sc.id_receptor = u.id_usuario WHERE sc.id_solicitud = ? AND sc.id_receptor = ? AND sc.estatus = ?",
                [id_solicitud, id_receptor, "Pendiente"]
            );

            if (requests.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    message: "Solicitud no encontrada o no pendiente para este usuario.",
                });
            }

            const id_emisor = requests[0].id_emisor; 
            const receptor_nombre = requests[0].receptor_nombre; 

            // 2. FUNCION PARA ACTUALIZAR ESTATUS DE SOLICITUD A ACEPTADA
            const [result] = await connection.query(
                "UPDATE solicitudes_contacto SET estatus = ?, fecha_respuesta = CURRENT_TIMESTAMP() WHERE id_solicitud = ? AND id_receptor = ? AND estatus = ?",
                ["Aceptada", id_solicitud, id_receptor, "Pendiente"]
            );

            if (result.affectedRows === 0) {
               
                await connection.rollback();
                return res.status(404).json({
                    message: "Solicitud no encontrada o no pendiente para este usuario.",
                });
            }

            // 3. FUNCION PARA NOTIFICAR A EMISOR EL ESTATUS DE LA SOLICITUD (FUNCIONALIDAD EN REVISION YA QUE SE QUIERE MEJORAR)
            const notificationTitleEmisorAccepted = "Solicitud de Contacto Aceptada";
            const mensajeNotificacionAccepted = `¡Tu solicitud de contacto ha sido ACEPTADA por ${receptor_nombre}!`;
            const urlRedireccionAccepted = `/notificaciones?solicitud=${id_solicitud}`; 

            await connection.query(
                "INSERT INTO notificaciones (id_usuario_receptor, tipo_notificacion, titulo, mensaje, url_redireccion, id_referencia, leida, creado_fecha) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
                [
                    id_emisor, 
                    "solicitud_aceptada",
                    notificationTitleEmisorAccepted,
                    mensajeNotificacionAccepted,
                    urlRedireccionAccepted,
                    id_solicitud, 
                    false,
                ]
            );

            await connection.commit();
            res.json({
                message:
                    "Solicitud de contacto aceptada con éxito y emisor notificado.",
            });
        } catch (error) {
            if (connection) await connection.rollback(); 
            console.error("Error al aceptar solicitud de contacto:", error);
            res.status(500).json({
                message: "Error interno del servidor al aceptar la solicitud.",
                error: error.message,
            });
        } finally {
            if (connection) connection.release(); 
        }
    }
);

// 4. RUTA PARA RECHAZAR UNA SOLICITUD
app.patch(
    "/api/solicitudes/:id_solicitud/rechazar",
    authenticateToken,
    async (req, res) => {
        console.log(
            "Solicitud PATCH /api/solicitudes/:id_solicitud/rechazar para solicitud:",
            req.params.id_solicitud,
            "por usuario:",
            req.user.id_usuario
        );
        const { id_solicitud } = req.params;
        const id_receptor = req.user.id_usuario; 

        let connection; 
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction(); 

            // 1. MISMA RUTA PASADA PARA OBTENER ID DEL EMISOR Y NOMBRE DE RECEPTOR
          
            const [requests] = await connection.query(
                "SELECT sc.id_emisor, u.nombre_usuario AS receptor_nombre FROM solicitudes_contacto sc JOIN usuarios u ON sc.id_receptor = u.id_usuario WHERE sc.id_solicitud = ? AND sc.id_receptor = ? AND sc.estatus = ?",
                [id_solicitud, id_receptor, "Pendiente"]
            );

            if (requests.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    message: "Solicitud no encontrada o no pendiente para este usuario.",
                });
            }

            const id_emisor = requests[0].id_emisor; 
            const receptor_nombre = requests[0].receptor_nombre; 

            // 2. ACTUALIZACION DE ESTATUS A RECHAZADA
            const [result] = await connection.query(
                "UPDATE solicitudes_contacto SET estatus = ?, fecha_respuesta = CURRENT_TIMESTAMP() WHERE id_solicitud = ? AND id_receptor = ? AND estatus = ?",
                ["Rechazada", id_solicitud, id_receptor, "Pendiente"]
            );

            if (result.affectedRows === 0) {
               
                await connection.rollback();
                return res.status(404).json({
                    message: "Solicitud no encontrada o no pendiente para este usuario.",
                });
            }

            // 3. FUNCION PARA NOTIFICAR A EMISOR QUE SOLICITUD FUE RECHAZADA
            const notificationTitleEmisorRejected = "Solicitud de Contacto Rechazada";
            const mensajeNotificacionRejected = `Tu solicitud de contacto ha sido RECHAZADA por ${receptor_nombre}.`;
            const urlRedireccionRejected = `/notificaciones?solicitud=${id_solicitud}`; 

            await connection.query(
                "INSERT INTO notificaciones (id_usuario_receptor, tipo_notificacion, titulo, mensaje, url_redireccion, id_referencia, leida, creado_fecha) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
                [
                    id_emisor,
                    "solicitud_rechazada",
                    notificationTitleEmisorRejected,
                    mensajeNotificacionRejected,
                    urlRedireccionRejected,
                    id_solicitud, 
                    false, 
                ]
            );

            await connection.commit();
            res.json({
                message:
                    "Solicitud de contacto rechazada con éxito y emisor notificado.",
            });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error("Error al rechazar solicitud de contacto:", error);
            res.status(500).json({
                message: "Error interno del servidor al rechazar la solicitud.",
                error: error.message,
            });
        } finally {
            if (connection) connection.release(); 
        }
    }
);


 // RUTA PARA LAS NOTIFICACIONES NO LEIDAS (FUNCION AUN EN REVISION)
app.get('/api/notificaciones/unread-count', authenticateToken, async (req, res) => {
    const userId = req.user.id_usuario;

    if (!userId) {
        return res.status(400).json({ message: 'ID de usuario no disponible en el token.' });
    }

    try {
        const [rows] = await pool.query(
            "SELECT COUNT(*) as count FROM notificaciones WHERE id_usuario_receptor = ? AND leida = FALSE",
            [userId]
        );
        res.json({ count: rows[0].count });
    } catch (error) {
        console.error('Error al obtener el recuento de notificaciones no leídas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener el recuento de notificaciones.' });
    }
});


app.get("/api/notificaciones", authenticateToken, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "No autenticado." });
    }
    const userId = req.user.id_usuario;

    try {
        const [notifications] = await pool.query(
            `SELECT
                n.id_notificacion,
                n.tipo_notificacion,
                n.mensaje,
                n.titulo,           
                n.url_redireccion,  
                n.creado_fecha AS fecha_creacion, 
                n.leida,   
                n.id_referencia,
                -- Datos de la solicitud de contacto si aplica
                sc.email AS email_emisor,
                sc.whatsapp AS emisor_whatsapp,
                sc.instagram AS emisor_instagram,
                sc.tiktok AS emisor_tiktok,
                sc.facebook AS emisor_facebook,
                sc.estatus AS estatus_solicitud, -- Estado de la solicitud de contacto
                u.nombre_usuario AS nombre_usuario_emisor -- Nombre del emisor de la solicitud
            FROM
                notificaciones n
            LEFT JOIN
                solicitudes_contacto sc ON n.id_referencia = sc.id_solicitud AND n.tipo_notificacion = 'solicitud_contacto'
            LEFT JOIN
                usuarios u ON sc.id_emisor = u.id_usuario
            WHERE
                n.id_usuario_receptor = ? 
            ORDER BY
                n.creado_fecha DESC`,
            [userId]
        );
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        res
            .status(500)
            .json({
                message: "Error interno del servidor al obtener notificaciones.",
            });
    }
});

// RUTA PARA MARCAR LAS NOTIFICACIONES COMO LEIDAS (FUNCION EN REVISION)
app.patch(
    "/api/notificaciones/:id/marcar-leida",
    authenticateToken,
    async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ message: "No autenticado." });
        }
        const notificationId = req.params.id;
        const userId = req.user.id_usuario;

        try {
            const [result] = await pool.query(
                "UPDATE notificaciones SET leida = TRUE WHERE id_notificacion = ? AND id_usuario_receptor = ?",
                [notificationId, userId]
            );

            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Notificación no encontrada o no tienes permiso para marcarla como leída.",
                    });
            }

            res
                .status(200)
                .json({ message: "Notificación marcada como leída exitosamente." });
        } catch (error) {
            console.error("Error al marcar notificación como leída:", error);
            res
                .status(500)
                .json({
                    message:
                        "Error interno del servidor al marcar notificación como leída.",
                });
        }
    }
);



// RUTA PARA ACTUALIZAR LA DESCRIPCIÓN DEL PERFIL
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

// RUTA PARA SUBIR VARIAS IMÁGENES AL PORTAFOLIO (FUNCION EN REVISION YA QUE A VECES SE PRESENTAN EVENTUALIDADES)
app.post(
 
  "/api/upload-portafolio-images", 
  authenticateToken,
  upload.array("portfolioImages", 10), 
  async (req, res) => {
    console.log(
      "Solicitud POST /api/upload-portafolio-images recibida para usuario:",
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
      // 1. CREACION DE PROYECTO O AÑADIR IMAGEN A PORTAFOLIO
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

      // 2. FUNCION PARA AÑADIR IMAGEN A PORTAFOLIO (GUARDADA EN TABLA LLAMADA imagen)
      
      for (const file of req.files) {
        const imageUrl = `/uploads/${file.filename}`; 
        const [imageResult] = await connection.query(
          "INSERT INTO imagen (id_proyecto, url_imagen, descripcion_imagen) VALUES (?, ?, ?)",
          [projectId, imageUrl, "Imagen de portafolio"] 
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
// RUTA PARA ELIMINAR IMAGEN DEL PORTAFOLIO (FUNCION AGREGADA EN ESTE ARCHIVO EXPRESS PERO AUN NO AGREGADA INTERFAZ)
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
      // 1. FUNCION PARA OBTENER URL DE IMAGEN
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
      const filePath = path.join(__dirname, imageUrlToDelete);

      // 2. FUNCION PARA ELIMINAR IMAGEN (FUNCION AGREGADA EN EXPRESS PERO NO EN INTERFAZ)
      const [result] = await connection.query(
        "DELETE FROM imagen WHERE id_imagen = ?",
        [imageId]
      );

      if (result.affectedRows === 0) {
        console.warn(`No se eliminó ninguna imagen con ID ${imageId}.`);
        await connection.rollback();
        return res.status(404).json({ message: "Imagen no encontrada." });
      }

      // 3. FUNCION DE ELIMINACION DE ARCHIVO DE SERVIDOR (OPCION AGREGADA MAS QUE TODO POR ELIMINACION PERMANENTE DE ARCHIVO YY MAYOR LIMPIEZA, PERO RIESGOSO)
      if (filePath.startsWith(path.join(__dirname, "uploads"))) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(
              `Error al eliminar el archivo físico ${filePath}:`,
              err
            );
          
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

// RUTAS DE DESAFÍOS

// RUTA PARA CREAR UN NUEVO DESAFÍO (SOLO PARA PERFIL DE EMPRENDEDOR)
app.post(
  "/api/challenges",
  authenticateToken,
  authorizeEntrepreneur,
  async (req, res) => {
    console.log(
      "Solicitud POST /api/challenges recibida para usuario:",
      req.user.id_usuario
    );
    const userId = req.user.id_usuario; 

    // 1. VALIDAR LOS DATOS DEL FORMULARIO QUE APARECE PARA CREAR DESAFIO
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

    let connection; 
    try {
      connection = await pool.getConnection(); 
      await connection.beginTransaction();

      // 2. FUNCION PARA OBTENER ID DEL USUARIO CREADOR DE DESAFIO Y CONTADOR (EL EMPRENDEDOR SOLO PODRA CREAR UN DEAFIO A LA VEZ Y 3 GRATIS, LUEGO LA OPCION SERA PAGA)
      console.log(
        "Buscando id_emprendedor y contador de desafíos para id_usuario:",
        userId
      );
      const [emprendedorResult] = await connection.query(
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

     // FUNCION PARA CONTEO DE DESAFIOS GRATIS
      const MAX_FREE_CHALLENGES = 3;
      if (desafios_cuenta >= MAX_FREE_CHALLENGES) {
        console.warn(
          "Error 402: El emprendedor ha alcanzado el límite de desafíos gratuitos."
        );
        await connection.rollback(); 
        return res.status(402).json({
          message: `Has alcanzado el límite de ${MAX_FREE_CHALLENGES} desafíos gratuitos. Por favor, realiza un pago para crear más desafíos.`,
        });
      }
      

      // FUNCION PARA VERIFICAR SI DESAFIO EXISTE
      console.log(
        "Verificando desafíos activos para id_emprendedor:",
        id_emprendedor
      );
      const [activeChallenges] = await connection.query(
        "SELECT id_desafio FROM desafios WHERE id_emprendedor = ? AND fecha_fin >= CURDATE()",
        [id_emprendedor]
      );

      if (activeChallenges.length > 0) {
        console.warn(
          "Error 409: El emprendedor ya tiene un desafío activo y no puede crear otro."
        );
        await connection.rollback(); 
        return res.status(409).json({
          message:
            "Ya tienes un desafío activo. Debes esperar a que finalice para crear uno nuevo.",
        });
      }
      console.log(
        "No se encontraron desafíos activos. Procediendo a crear el nuevo desafío."
      );
    

      // 3. VERIFICAR FECHA DE FIN DE DESAFIO
      const fechaCreacion = new Date();
      const fechaFin = new Date(fechaCreacion);
      fechaFin.setDate(fechaCreacion.getDate() + duracion_dias);

      // 4. INSERTAR LOS DATOS DEL DESAFIO EN TABLA DE BD LLAMADA desafios
      const [result] = await connection.query(
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
        ]
      );
      const idDesafioRecienCreado = result.insertId;
      console.log(`Desafío creado con ID: ${idDesafioRecienCreado}`);

      // 5. FUNCION PARA INCREMENTO DE CONTEO DE DESAFIOS CREADOS POR EMPRENDEDOR
      await connection.query(
        "UPDATE emprendedor SET desafios_cuenta = desafios_cuenta + 1 WHERE id_emprendedor = ?",
        [id_emprendedor]
      );
      console.log("Contador de desafíos creados incrementado.");

      // 6. FUNCION PARA NOTIFICACION DE NUEVO DESAFIO CREADO
      const [receptors] = await connection.query(`
          SELECT id_usuario FROM usuarios WHERE tipo_perfil IN ('Diseñador', 'Marketing')
      `);

      const tituloNotificacion = "¡Nuevo Desafío Publicado!";
      const mensajeNotificacion = `Se ha publicado un nuevo desafío: "${nombre_desafio}". ¡Échale un vistazo!`;
      const urlRedireccion = `/desafios/${idDesafioRecienCreado}`; 

      for (const receptor of receptors) {
        await connection.query(
          `
              INSERT INTO notificaciones (id_usuario_receptor, tipo_notificacion, titulo, mensaje, url_redireccion, id_referencia, leida, creado_fecha)
              VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())
          `,
          [
            receptor.id_usuario,
            "nuevo_desafio",
            tituloNotificacion,
            mensajeNotificacion,
            urlRedireccion,
            idDesafioRecienCreado,
            false,
          ]
        );
        console.log(
          `Notificación de nuevo desafío enviada a usuario ${receptor.id_usuario}.`
        );
      }
    

      await connection.commit(); 
      console.log(
        `Desafío creado exitosamente para id_emprendedor ${id_emprendedor}. ID: ${idDesafioRecienCreado}`
      );

     
      res.status(201).json({
        message: "Desafío creado exitosamente!",
        id_desafio: idDesafioRecienCreado,
        desafios_restantes_gratuitos:
          MAX_FREE_CHALLENGES - (desafios_cuenta + 1),
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error("Error al crear el desafío en la DB:", error);
      res.status(500).json({
        message: "Error interno del servidor al crear el desafío.",
        error: error.message,
      });
    } finally {
      if (connection) {
        connection.release(); 
      }
    }
  }
);

// RUTA PARA OBTENER DESAFÍOS CREADOS POR EL USUARIO QUE HA INICIADO SESION
app.get(
  "/api/challenges/me",
  authenticateToken,
  authorizeEntrepreneur,
  async (req, res) => {
    console.log(
      "Solicitud GET /api/challenges/me recibida para usuario:",
      req.user.id_usuario
    );
    const userId = req.user.id_usuario; 

    try {
      // 1. FUNCION QUE LLAMA EL ID DEL EMPRENDEDOR
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

      // 2. FUNCION PARA OBTENER DESAFIOS CREADOS
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

// RUTA PARA OBTENER TODOS LOS DESAFIOS CREADOS EN GENERAL

app.get(
  "/api/desafios_activos_emprendedores",
  authenticateToken,
  authorizeDesignerMarketing,
  async (req, res) => {
    console.log(
      "Solicitud GET /api/desafios_activos_emprendedores recibida para usuario:",
      req.user.id_usuario
    );
    let connection;
    try {
      connection = await pool.getConnection();
      
      const [rows] = await connection.query(`
                SELECT
                    d.id_desafio,
                    d.nombre_desafio,
                    d.descripcion_desafio,
                    d.beneficios,
                    d.dias_duracion,
                    d.fecha_creacion,
                    d.fecha_fin,
                    d.estado,
                    u.nombre_usuario AS nombre_usuario_emprendedor,
                    u.foto_perfil_url AS foto_perfil_emprendedor
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
      connection.release();

  
      const desafiosConUrlCompleta = rows.map((desafio) => {
        if (desafio.foto_perfil_emprendedor) {
          desafio.foto_perfil_emprendedor = `${req.protocol}://${req.get(
            "host"
          )}${desafio.foto_perfil_emprendedor}`;
        }
        return desafio;
      });

      console.log(
        `Desafíos activos de emprendedores obtenidos: ${desafiosConUrlCompleta.length}`
      );
      res.status(200).json(desafiosConUrlCompleta);
    } catch (err) {
      console.error("Error al obtener desafíos activos de emprendedores:", err);
      res.status(500).json({
        message: "Error interno del servidor al obtener desafíos activos.",
        error: err.message,
      });
    } finally {
      if (connection) connection.release();
    }
  }
);


app.get("/api/desafios/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `
            SELECT
                d.id_desafio,
                d.nombre_desafio,
                d.descripcion_desafio,
                d.beneficios,
                d.dias_duracion,
                d.fecha_creacion,
                d.fecha_fin,
                d.estado,
                u.nombre_usuario AS nombre_usuario_emprendedor,
                u.correo_electronico AS email_emprendedor,
                u.foto_perfil_url AS foto_perfil_emprendedor
            FROM
                desafios d
            JOIN
                emprendedor e ON d.id_emprendedor = e.id_emprendedor  
            JOIN
                usuarios u ON e.id_usuario = u.id_usuario       
            WHERE
                d.id_desafio = ?
        `,
      [id]
    );
    connection.release();

    if (rows.length === 0) {
      console.warn(
        `Desafío con ID ${id} no encontrado o datos de emprendedor no coincidentes.`
      );
      return res.status(404).json({
        message: "Desafío no encontrado o datos de emprendedor no válidos.",
      });
    }

    const desafio = rows[0];
   
    if (desafio.foto_perfil_emprendedor) {
      desafio.foto_perfil_emprendedor = `${req.protocol}://${req.get("host")}${
        desafio.foto_perfil_emprendedor
      }`;
    }
    console.log(`Detalles del desafío ${id} obtenidos.`);
    res.json(desafio);
  } catch (error) {
    console.error("Error al obtener detalles del desafío:", error);
    res.status(500).json({
      message: "Error al obtener detalles del desafío.",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});

// RUTA PARA OBTENER PROPUESTAS DE UN DESAFIO POR SU ID
app.get("/api/desafios/:id/propuestas", authenticateToken, async (req, res) => {
  const { id: id_desafio } = req.params;

 
  console.log(`Backend: Solicitud de propuestas para idDesafio: ${id_desafio}`);

  let connection; 
  try {
    connection = await pool.getConnection(); 
    const [propuestas] = await connection.execute(
      `SELECT pd.*, u.nombre_usuario
             FROM propuestas_desafio pd
             JOIN usuarios u ON pd.id_usuario_proponente = u.id_usuario
             WHERE pd.id_desafio = ?`,
      [id_desafio]
    );

   
    console.log(
      "Backend: Resultados de la base de datos para propuestas:",
      propuestas
    );

    res.status(200).json(propuestas);
  } catch (error) {
    console.error("Backend: Error al obtener propuestas del desafío:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor al obtener propuestas." });
  } finally {
    if (connection) connection.release();
  }
});

// RUTA PARA ENVIAR PROPUESTA PARA DESAFIO (OPCION VALIDA SOLO PARA PERFIL DE DISEÑADOR Y MARKETING)

app.post(
  "/api/desafios/:id/proponer",
  authenticateToken,
  authorizeDesignerMarketing,
  uploadPropuesta.single("imagenPropuesta"),
  async (req, res) => {
    const { id: id_desafio } = req.params;
    const { texto_propuesta } = req.body;
    const id_usuario_proponente = req.user.id_usuario;

    const imagen_url = req.file
      ? `/uploads/proposals/${req.file.filename}`
      : null; 

    if (!texto_propuesta && !imagen_url) {
     
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr)
            console.error(
              "Error al eliminar archivo temporal por validación:",
              unlinkErr
            );
        });
      }
      return res.status(400).json({
        message: "Se requiere el texto de la propuesta o una imagen.",
      });
    }

    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction(); 

      const [desafioRows] = await connection.execute(
        "SELECT id_desafio, estado, id_emprendedor, nombre_desafio FROM desafios WHERE id_desafio = ?",
        [id_desafio]
      );
      if (desafioRows.length === 0) {
        await connection.rollback(); 
        if (req.file && req.file.path) {
          fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr)
              console.error("Error al eliminar archivo:", unlinkErr);
          });
        }
        return res.status(404).json({ message: "Desafío no encontrado." });
      }
      if (desafioRows[0].estado !== "Activo") {
        await connection.rollback(); 
        if (req.file && req.file.path) {
          fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr)
              console.error("Error al eliminar archivo:", unlinkErr);
          });
        }
        return res.status(400).json({
          message:
            "No se pueden enviar propuestas a un desafío que no está activo.",
        });
      }

      const idEmprendedorDeTablaDesafios = desafioRows[0].id_emprendedor; 
      const nombreDesafio = desafioRows[0].nombre_desafio;

      
      const [emprendedorUserRows] = await connection.execute(
        "SELECT id_usuario FROM emprendedor WHERE id_emprendedor = ?",
        [idEmprendedorDeTablaDesafios]
      );

      if (emprendedorUserRows.length === 0) {
        await connection.rollback();
        if (req.file && req.file.path) {
          fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr)
              console.error("Error al eliminar archivo:", unlinkErr);
          });
        }
        return res.status(404).json({
          message:
            "Emprendedor asociado al desafío no encontrado en la tabla de emprendedores.",
        });
      }
      const idUsuarioEmprendedor = emprendedorUserRows[0].id_usuario; 

      if (idUsuarioEmprendedor === id_usuario_proponente) {
        
        await connection.rollback(); 
        if (req.file && req.file.path) {
          fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr)
              console.error("Error al eliminar archivo:", unlinkErr);
          });
        }
        return res.status(403).json({
          message: "No puedes enviar una propuesta a tu propio desafío.",
        });
      } 
      
      // 3. FUNCION PARA INGRESAR PROPUESTA A BASE DE DATOS EN LA TABLA LLAMADA propuestas_desafio

      const [result] = await connection.execute(
        "INSERT INTO propuestas_desafio (id_desafio, id_usuario_proponente, texto_propuesta, imagen_url, estado, fecha_envio) VALUES (?, ?, ?, ?, ?, NOW())",
        [
          id_desafio,
          id_usuario_proponente,
          texto_propuesta,
          imagen_url,
          "Pendiente",
        ]
      );
      const idPropuestaCreada = result.insertId;
      console.log(
        `Propuesta ${idPropuestaCreada} creada para desafío ${id_desafio} por usuario ${id_usuario_proponente}. Imagen: ${
          imagen_url || "N/A"
        }`
      );
      // 4. FUNCION PARA NOTIFICACION A EMPRENDEDOR DE NUEVA PROPUESTA (EN REVISION)
      const tituloNotificacion = "¡Nueva Propuesta Recibida!";
      const mensajeNotificacion = `Has recibido una nueva propuesta para tu desafío "${nombreDesafio}" de ${req.user.nombre_usuario}.`;
      const urlRedireccion = `/mis-desafios/${id_desafio}/propuestas`; 

     
      await connection.execute(
        `INSERT INTO notificaciones (id_usuario_receptor, tipo_notificacion, titulo, mensaje, url_redireccion, id_referencia, leida, creado_fecha) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())`, // <-- Así, en una sola línea o con cuidado al formatear
        [
          idUsuarioEmprendedor,
          "nueva_propuesta_desafio",
          tituloNotificacion,
          mensajeNotificacion,
          urlRedireccion,
          idPropuestaCreada,
          false,
        ]
      );
      console.log(
        `Notificación de nueva propuesta enviada al emprendedor ${idUsuarioEmprendedor}.`
      );

    

      await connection.commit();
      res.status(201).json({
        message: "Propuesta enviada con éxito.",
        propuestaId: idPropuestaCreada,
        imagenUrl: imagen_url,
      });
    } catch (error) {
    
      if (connection) {
        await connection.rollback();
      }
      console.error("Error al enviar propuesta:", error);
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr)
            console.error("Error al eliminar archivo tras error:", unlinkErr);
        });
      } 
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json({ message: "El archivo es demasiado grande (máximo 5MB)." });
        }
        return res
          .status(400)
          .json({ message: `Error al subir archivo: ${error.message}` });
      }
      res.status(500).json({
        message: "Error interno del servidor al enviar la propuesta.",
        error: error.message,
      });
    } finally {
      if (connection) connection.release(); 
    }
  }
);

// RUTA PARA OBTENER DE BD TODOS LOS PERFILES REGISTRADOS (FUNCIONA PARA LA PAGINACENTRAL Y VERIFICAR LAS TARJETAS DE PERFILES)
app.get("/api/profiles", authenticateToken, async (req, res) => {
  console.log(
    "Solicitud GET /api/profiles recibida para usuario:",
    req.user.id_usuario
  );
  const currentUserId = req.user.id_usuario;

  try {
   
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
                u.id_usuario != ?`, 
      [currentUserId]
    );

    console.log(
      `Perfiles obtenidos (excluyendo el actual): ${allProfiles.length}`
    );

   
    const formattedProfiles = allProfiles.map((profile) => {
      let profession = profile.tipo_perfil;
      let location = "";
      let description =
        profile.descripcion_perfil || "Aún no ha añadido una descripción."; 

     
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

      
      const fullImageUrl = profile.foto_perfil_url
        ? `${req.protocol}://${req.get("host")}${profile.foto_perfil_url}`
        : "";

      return {
        id_usuario: profile.id_usuario,
        nombre_usuario: profile.nombre_usuario,
        tipo_perfil: profile.tipo_perfil, 
        descripcion_perfil: description,
        profession: profession,
        location: location, 
        foto_perfil_url: fullImageUrl,
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

// RUTAS PARA EL FORO

// 1. RUTA PARA OBTENER TODOS LOS FOROS EN GENERAL
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
    res.status(200).json(threads);
  } catch (error) {
    console.error("Error al obtener los temas del foro:", error);
    res.status(500).json({
      message: "Error interno del servidor al obtener temas del foro.",
      error: error.message,
    });
  }
});

// 2. RUTA PARA CREAR NUEVO TEMA DE FORO
app.post("/api/forum/threads", authenticateToken, async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({
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

// 3. RUTA PARA OBTENER UN FORO A LA VEZ. ES DECIR, UN FORO DE MANERA INDIVIDUAL
app.get("/api/forum/threads/:id", authenticateToken, async (req, res) => {
  const threadId = req.params.id;
  const userId = req.user ? req.user.id_usuario : null; 

  console.log(
    `Solicitud GET /api/forum/threads/${threadId} recibida. Usuario autenticado: ${
      userId || "No"
    }`
  );

  try {
    
    const [threads] = await pool.query(
      `
            SELECT
                f.id_foro AS id,
                f.titulo AS title,
                f.descripcion AS content,
                u.nombre_usuario AS author,
                f.fecha_creacion AS date,
                u.reaccion_acumulada AS author_reputation,
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
    
    if (thread.author_profile_pic) {
      thread.author_profile_pic = `${req.protocol}://${req.get("host")}${
        thread.author_profile_pic
      }`;
    } else {
      thread.author_profile_pic = ""; 
    }

   // RUTA PARA LAS RESPUESTAS DE ESE FORO
    const [replies] = await pool.query(
      `
            SELECT
                fm.id_mensaje AS id,
                fm.contenido AS content,
                u.nombre_usuario AS author,
                fm.fecha_publicacion AS date,
                u.reaccion_acumulada AS reaccion_acumulada_autor,
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

    // RUTA PARA OBTENER LAS REACCIONES DE LOS USUARIOS CON LOS LIKES
    for (const reply of replies) {
     
      if (reply.author_profile_pic) {
        reply.author_profile_pic = `${req.protocol}://${req.get("host")}${
          reply.author_profile_pic
        }`;
      } else {
        reply.author_profile_pic = "";
      }

      // FUNCION PARA CONTEO DE LOS LIKES
      const [likesResult] = await pool.query(
        `SELECT COUNT(*) AS likesCount
                FROM foro_reaccion
                WHERE id_mensaje = ? AND tipo_reaccion = 'like'`,
        [reply.id]
      );
      reply.likesCount = likesResult[0].likesCount;

      // FUNCION PARA VERIFICAR SI EL USUARIO QUE INCIO SESION SE AUTO REACCIONA
      if (userId) {
        const [userLikeResult] = await pool.query(
          `SELECT COUNT(*) AS isLiked
                    FROM foro_reaccion
                    WHERE id_mensaje = ? AND id_usuario = ? AND tipo_reaccion = 'like'`,
          [reply.id, userId]
        );
        reply.likedByCurrentUser = userLikeResult[0].isLiked > 0;
      } else {
        reply.likedByCurrentUser = false;
      }
    }

   
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

// 4. RUTA PARA AÑADIR RESPUESTA A UN TEMA DE FORO
app.post(
  "/api/forum/threads/:id/replies",
  authenticateToken,
  async (req, res) => {
    if (!req.user) {
      return res
        .status(401)
        .json({
          message: "No autenticado. Debes iniciar sesión para responder.",
        });
    }
    const threadId = req.params.id; 
    const userId = req.user.id_usuario;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res
        .status(400)
        .json({ message: "El contenido de la respuesta es obligatorio." });
    }

    try {
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

// 5. RUTA PARA VERIFICAR LAS REACCIONES POR INDIVIDUAL (FUNCION QUE MAS ADELANTE UTILIZARE PARA ICONO DE CONFIABILIDAD DE PERFIL POR REACCION)
app.post("/api/replies/:replyId/like", authenticateToken, async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({
        message: 'No autenticado. Debes iniciar sesión para dar "me gusta".',
      });
  }
  const replyId = req.params.replyId;
  const userId = req.user.id_usuario;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

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

    if (userId === replyAuthorId) {
      await connection.rollback();
      return res
        .status(403)
        .json({ message: "No puedes reaccionar a tu propia respuesta." });
    }

    const [existingReaction] = await connection.query(
      `SELECT id_reaccion FROM foro_reaccion WHERE id_mensaje = ? AND id_usuario = ? AND tipo_reaccion = 'like'`,
      [replyId, userId]
    );

    let action = "";
    let reputationChange = 0; 

    if (existingReaction.length > 0) {
      // Quitar Like
      await connection.query(
        `DELETE FROM foro_reaccion WHERE id_reaccion = ?`,
        [existingReaction[0].id_reaccion]
      );
      action = "unliked";
      reputationChange = -1; 
      console.log(
        `Usuario ${userId} ha quitado el like del mensaje ${replyId}.`
      );
    } else {
      // Dar Like
      await connection.query(
        `INSERT INTO foro_reaccion (id_mensaje, id_usuario, tipo_reaccion, fecha_reaccion) VALUES (?, ?, ?, NOW())`,
        [replyId, userId, "like"]
      );
      action = "liked";
      reputationChange = 1; 
      console.log(`Usuario ${userId} ha dado like al mensaje ${replyId}.`);
    }

    // RUTA DE REACCION ACUMULADAS (FUNCION NO AÑADIDA A LA INTERFAZ)
    // RUTA PARA ACTUALIZAR REACCIONES EN TOTAL DE UN SOLO USUARIO
    await connection.query(
      `UPDATE usuarios SET reaccion_acumulada = reaccion_acumulada + ? WHERE id_usuario = ?`,
      [reputationChange, replyAuthorId]
    );

    // FUNCION PARA OBTENER RACCIONES DE UN PERFIL
    const [newAuthorReputationResult] = await connection.query(
      `SELECT reaccion_acumulada FROM usuarios WHERE id_usuario = ?`,
      [replyAuthorId]
    );
    const reaccion_acumulada_autor =
      newAuthorReputationResult[0].reaccion_acumulada;

    const [newLikesCountResult] = await connection.query(
      `SELECT COUNT(*) AS newLikesCount FROM foro_reaccion WHERE id_mensaje = ? AND tipo_reaccion = 'like'`,
      [replyId]
    );
    const newLikesCount = newLikesCountResult[0].newLikesCount;

    await connection.commit();

    res.json({
      success: true,
      message: `Mensaje ${action} exitosamente.`,
      newLikesCount: newLikesCount,
      likedByCurrentUser: action === "liked",
      reaccion_acumulada_autor: reaccion_acumulada_autor, 
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

// 6. RUTA PARA OBTENER TODOS LOS PERFILES
app.get("/api/profiles", async (req, res) => {
  try {
    const [profiles] = await pool.query(` 
            SELECT
                u.id_usuario,
                u.nombre_usuario,
                u.tipo_perfil,
                u.descripcion_perfil,
                u.foto_perfil_url,
                u.reaccion_acumulada,
                (
                    SELECT COUNT(*)
                    FROM foro_mensaje fm
                    LEFT JOIN foro_reaccion fr ON fm.id_mensaje = fr.id_mensaje
                    WHERE fm.id_usuario = u.id_usuario AND fr.tipo_reaccion = 'like'
                ) AS likes_acumulados_foro
            FROM
                usuarios u
            ORDER BY
                u.nombre_usuario ASC
        `); 

    const formattedProfiles = profiles.map((profile) => {
      const fotoUrl = profile.foto_perfil_url
        ? `${req.protocol}://${req.get("host")}${profile.foto_perfil_url}`
        : "";
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
// RUTA DE PRUEBA 
app.get("/", (req, res) => {
  res.send("API de Convenio de Emprendimiento funcionando!");
});

// RUTA PARA INICIAR EL SERVIDOR 
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en el puerto ${PORT}`);
});
