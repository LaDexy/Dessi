// Importa las librerías necesarias usando sintaxis ES Modules
import express from 'express';
import mysql from 'mysql2/promise'; // Usamos mysql2 con promesas para operaciones asíncronas
import bcrypt from 'bcrypt'; // Para hashear contraseñas
import cors from 'cors'; // Para manejar las políticas de Cross-Origin Resource Sharing
import jwt from 'jsonwebtoken'; // Para generar JSON Web Tokens
import multer from 'multer'; // Para manejar la carga de archivos (imágenes)
import path from 'path'; // Para manejar rutas de archivos
import { fileURLToPath } from 'url'; // Para obtener __dirname en ES Modules
import fs from 'fs'; // Para crear directorios si no existen

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Creación de servidor
const app = express();

// Configura los middlewares
// ====================================================================
// Configuración de CORS - ¡Debe ir al principio!
// ====================================================================
app.use(cors({
    origin: 'http://localhost:8080', // Permite solicitudes SÓLO desde tu frontend Vue.js
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Asegúrate de incluir todos los métodos que usas
    allowedHeaders: ['Content-Type', 'Authorization'], // Permite estas cabeceras
    credentials: true // Permite el envío de cookies de origen cruzado (si las usas)
}));

app.use(express.json()); // Permite a Express parsear cuerpos de solicitud JSON
app.use(express.urlencoded({ extended: true })); // Para formularios URL-encoded
// Sirve archivos estáticos desde la carpeta 'uploads' (donde guardaremos las imágenes de perfil/proyectos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de la conexión a la base de datos MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'convenio_emprendimiento',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crea un pool de conexiones para la base de datos
const pool = mysql.createPool(dbConfig);

// ====================================================================
// ¡IMPORTANTE! Elimina estas líneas si estás usando mysql2/promise con el pool
// No necesitas una conexión 'db' separada con 'db.connect'
// const db = mysql.createConnection({ ... });
// db.connect(err => { ... });
// ====================================================================

// Clave secreta para firmar los JWT
const JWT_SECRET = 'tu_super_secreto_jwt_muy_seguro_y_largo_1234567890'; // Asegúrate de haberla cambiado

// Configuración de Multer para la carga de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

    if (token == null) {
        console.log('Autenticación fallida: Token no proporcionado.');
        return res.status(401).json({ message: 'Token no proporcionado.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Autenticación fallida: Token inválido o expirado.', err.message);
            return res.status(403).json({ message: 'Token inválido o expirado.' });
        }
        req.user = user;
        console.log('Token autenticado para usuario:', user.id_usuario, user.nombre_usuario);
        next();
    });
};

// --- RUTA PARA SUBIR FOTO DE PERFIL ---
app.post('/api/upload-profile-image', authenticateToken, upload.single('profileImage'), async (req, res) => {
    const userId = req.user.id_usuario; // Obtenemos el userId del token autenticado

    if (!req.file) {
        console.error('Error: No se ha subido ningún archivo.');
        return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    try {
        const [result] = await pool.query(
            'UPDATE usuarios SET foto_perfil_url = ? WHERE id_usuario = ?',
            [imageUrl, userId]
        );

        if (result.affectedRows === 0) {
            console.warn(`No se encontró usuario con ID ${userId} para actualizar la imagen.`);
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        console.log(`URL de imagen actualizada para userId ${userId}: ${imageUrl}`);
        const fullImageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
        res.status(200).json({ message: 'Imagen subida y URL actualizada!', imageUrl: fullImageUrl });

    } catch (error) {
        console.error('Error al actualizar la URL de la imagen en la DB:', error);
        res.status(500).json({ message: 'Error interno del servidor al guardar la URL de la imagen.', error: error.message });
    }
});

// --- RUTA PARA OBTENER EL PERFIL DEL USUARIO (incluyendo foto_perfil_url) ---
app.get('/api/profile/me', authenticateToken, async (req, res) => {
    console.log('Solicitud GET /api/profile/me recibida para usuario:', req.user.id_usuario);
    const userId = req.user.id_usuario;
    const userProfileType = req.user.tipo_perfil;

    try {
        let profileData = {};
        const [users] = await pool.query(
            'SELECT id_usuario, nombre_usuario, correo_electronico, tipo_perfil, foto_perfil_url, descripcion_perfil FROM usuarios WHERE id_usuario = ?',
            [userId]
        );

        if (users.length === 0) {
            console.log('Error 404: Perfil de usuario no encontrado para ID:', userId);
            return res.status(404).json({ message: 'Perfil de usuario no encontrado.' });
        }
        profileData = users[0];
        console.log('Datos de usuario principal obtenidos:', profileData.nombre_usuario);

        // Si la foto_perfil_url existe, conviértela a una URL completa
        if (profileData.foto_perfil_url) {
            profileData.foto_perfil_url = `${req.protocol}://${req.get('host')}${profileData.foto_perfil_url}`;
        } else {
            profileData.foto_perfil_url = ''; // Asegúrate de que siempre haya un string vacío si no hay imagen
        }

        // Consulta los datos específicos del perfil (emprendedor o diseñador_marketing)
        if (userProfileType === 'Emprendedor') {
            const [emprendedorData] = await pool.query(
                'SELECT nombre_negocio, localidad, tipo_negocio FROM emprendedor WHERE id_usuario = ?',
                [userId]
            );
            if (emprendedorData.length > 0) {
                profileData = { ...profileData, ...emprendedorData[0] };
            }
        } else if (userProfileType === 'Diseñador' || userProfileType === 'Marketing') {
            const [dmData] = await pool.query(
                'SELECT localidad, modalidad_trabajo FROM disenador_marketing WHERE id_usuario = ?',
                [userId]
            );
            if (dmData.length > 0) {
                profileData = { ...profileData, ...dmData[0] };
            }
        }

        const [projects] = await pool.query(
            'SELECT p.id_proyecto, p.titulo_proyecto, p.descripcion_proyecto, p.fecha_creacion, p.estado, i.id_imagen, i.url_imagen, i.descripcion_imagen FROM proyecto p LEFT JOIN imagen i ON p.id_proyecto = i.id_proyecto WHERE p.id_usuario = ? ORDER BY p.fecha_creacion DESC, i.orden ASC',
            [userId]
        );

        const groupedProjects = projects.reduce((acc, row) => {
            if (!acc[row.id_proyecto]) {
                acc[row.id_proyecto] = {
                    id_proyecto: row.id_proyecto,
                    titulo_proyecto: row.titulo_proyecto,
                    descripcion_proyecto: row.descripcion_proyecto,
                    fecha_creacion: row.fecha_creacion,
                    estado: row.estado,
                    imagenes: []
                };
            }
            if (row.id_imagen) {
                // Aquí también construimos la URL completa para las imágenes de proyectos
                acc[row.id_proyecto].imagenes.push({
                    id_imagen: row.id_imagen,
                    url_imagen: `${req.protocol}://${req.get('host')}/uploads/${row.url_imagen}`,
                    descripcion_imagen: row.descripcion_imagen
                });
            }
            return acc;
        }, {});

        profileData.proyectos = Object.values(groupedProjects);
        console.log('Perfil completo enviado al frontend.');
        res.status(200).json(profileData);

    } catch (error) {
        console.error('Error general al obtener el perfil del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});


// Ruta para el registro de usuarios (mantenida como la tienes)
app.post('/api/register', async (req, res) => {
    console.log('Solicitud de registro recibida. Datos:', req.body);

    const {
        nombre_usuario,
        correo_electronico,
        contrasena,
        tipo_perfil,
        nombre_negocio,
        localidad,
        tipo_negocio,
        modalidad_trabajo
    } = req.body;

    if (!nombre_usuario || !correo_electronico || !contrasena || !tipo_perfil) {
        console.log('Error 400: Campos obligatorios faltantes.');
        return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados.' });
    }

    try {
        console.log('Verificando si el correo electrónico ya está registrado:', correo_electronico);
        const [users] = await pool.query('SELECT id_usuario FROM usuarios WHERE correo_electronico = ?', [correo_electronico]);
        if (users.length > 0) {
            console.log('Error 409: Correo electrónico ya registrado.');
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }

        console.log('Hasheando contraseña...');
        const contrasena_hash = await bcrypt.hash(contrasena, 10);
        console.log('Contraseña hasheada.');

        const connection = await pool.getConnection();
        console.log('Conexión a DB obtenida. Iniciando transacción...');
        await connection.beginTransaction();

        try {
            console.log('Insertando usuario principal...');
            const [userResult] = await connection.query(
                'INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena_hash, tipo_perfil, fecha_registro) VALUES (?, ?, ?, ?, NOW())',
                [nombre_usuario, correo_electronico, contrasena_hash, tipo_perfil]
            );
            const id_usuario = userResult.insertId;
            console.log('Usuario principal insertado. ID:', id_usuario);

            if (tipo_perfil === 'Emprendedor') {
                if (!nombre_negocio || !localidad || !tipo_negocio) {
                    throw new Error('Faltan campos específicos para el perfil Emprendedor.');
                }
                const tipoNegocioString = Array.isArray(tipo_negocio) ? tipo_negocio.join(',') : tipo_negocio;
                console.log('Insertando datos de Emprendedor:', { id_usuario, nombre_negocio, localidad, tipoNegocioString });
                await connection.query(
                    'INSERT INTO emprendedor (id_usuario, nombre_negocio, localidad, tipo_negocio) VALUES (?, ?, ?, ?)',
                    [id_usuario, nombre_negocio, localidad, tipoNegocioString]
                );
                console.log('Datos de Emprendedor insertados.');
            } else if (tipo_perfil === 'Diseñador' || tipo_perfil === 'Marketing') {
                if (!localidad || !modalidad_trabajo) {
                    throw new Error('Faltan campos específicos para el perfil Diseñador/Marketing.');
                }
                const modalidadTrabajoString = Array.isArray(modalidad_trabajo) ? modalidad_trabajo.join(',') : modalidad_trabajo;
                console.log('Insertando datos de Diseñador/Marketing:', { id_usuario, localidad, modalidadTrabajoString });
                await connection.query(
                    'INSERT INTO disenador_marketing (id_usuario, localidad, modalidad_trabajo) VALUES (?, ?, ?)',
                    [id_usuario, localidad, modalidadTrabajoString]
                );
                console.log('Datos de Diseñador/Marketing insertados.');
            } else {
                throw new Error('Tipo de perfil no válido.');
            }

            console.log('Confirmando transacción...');
            await connection.commit();
            console.log('Transacción confirmada. Registro exitoso.');
            res.status(201).json({ message: 'Usuario registrado exitosamente', userId: id_usuario });

        } catch (transactionError) {
            console.log('Error en transacción. Revirtiendo cambios...', transactionError.message);
            await connection.rollback();
            console.error('Error durante la transacción de registro:', transactionError);
            res.status(500).json({ message: 'Error al registrar el usuario', error: transactionError.message });
        } finally {
            console.log('Liberando conexión a DB.');
            connection.release();
        }

    } catch (error) {
        console.error('Error general en la ruta de registro:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// Ruta para el login de usuarios (código existente)
app.post('/api/login', async (req, res) => {
    console.log('Solicitud de login recibida. Datos:', req.body);
    const { correo_electronico, contrasena } = req.body;

    if (!correo_electronico || !contrasena) {
        console.log('Error 400: Correo o contraseña faltantes.');
        return res.status(400).json({ message: 'Correo electrónico y contraseña son obligatorios.' });
    }

    try {
        console.log('Buscando usuario por correo electrónico:', correo_electronico);
        const [users] = await pool.query('SELECT id_usuario, nombre_usuario, contrasena_hash, tipo_perfil FROM usuarios WHERE correo_electronico = ?', [correo_electronico]);

        if (users.length === 0) {
            console.log('Error 401: Usuario no encontrado.');
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = users[0];
        console.log('Usuario encontrado. Comparando contraseña...');
        const isMatch = await bcrypt.compare(contrasena, user.contrasena_hash);

        if (!isMatch) {
            console.log('Error 401: Contraseña incorrecta.');
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        console.log('Credenciales válidas. Generando JWT...');
        const token = jwt.sign(
            { id_usuario: user.id_usuario, tipo_perfil: user.tipo_perfil, nombre_usuario: user.nombre_usuario },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log('JWT generado. Enviando respuesta de login.');

        res.status(200).json({ message: 'Inicio de sesión exitoso', token, tipo_perfil: user.tipo_perfil, id_usuario: user.id_usuario, nombre_usuario: user.nombre_usuario });

    } catch (error) {
        console.error('Error general en la ruta de login:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// Configura el puerto y lanza el servidor
app.set("port", 4000);
app.listen(app.get("port"), () => {
    console.log("Servidor ejecutando en puerto", app.get("port"));
});

// Manejo de errores del pool de conexiones (opcional, pero buena práctica)
pool.on('error', (err) => {
    console.error('Error en el pool de conexiones de MySQL:', err);
});