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
app.use(cors()); // Habilita CORS para permitir solicitudes desde tu frontend Vue.js
app.use(express.json()); // Permite a Express parsear cuerpos de solicitud JSON
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

// Clave secreta para firmar los JWT
// ¡CAMBIA ESTO POR UNA CADENA LARGA Y COMPLEJA EN PRODUCCIÓN!
const JWT_SECRET = 'tu_super_secreto_jwt_muy_seguro_y_largo_1234567890'; // Asegúrate de haberla cambiado

// Configuración de Multer para la carga de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Crea la carpeta 'uploads' si no existe
        const uploadDir = path.join(__dirname, 'uploads');
        // Usar fs.mkdirSync directamente ya que fs está importado al inicio
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Genera un nombre de archivo único para evitar colisiones
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

// Ruta para el registro de usuarios
app.post('/api/register', async (req, res) => {
    console.log('Solicitud de registro recibida. Datos:', req.body); // LOG: Datos recibidos

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
        console.log('Error 400: Campos obligatorios faltantes.'); // LOG
        return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados.' });
    }

    try {
        console.log('Verificando si el correo electrónico ya está registrado:', correo_electronico); // LOG
        const [users] = await pool.query('SELECT id_usuario FROM convenio_emprendimiento_usuarios WHERE correo_electronico = ?', [correo_electronico]);
        if (users.length > 0) {
            console.log('Error 409: Correo electrónico ya registrado.'); // LOG
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }

        console.log('Hasheando contraseña...'); // LOG
        const contrasena_hash = await bcrypt.hash(contrasena, 10);
        console.log('Contraseña hasheada.'); // LOG

        const connection = await pool.getConnection();
        console.log('Conexión a DB obtenida. Iniciando transacción...'); // LOG
        await connection.beginTransaction();

        try {
            console.log('Insertando usuario principal...'); // LOG
            const [userResult] = await connection.query(
                'INSERT INTO convenio_emprendimiento_usuarios (nombre_usuario, correo_electronico, contrasena_hash, tipo_perfil, fecha_registro) VALUES (?, ?, ?, ?, NOW())',
                [nombre_usuario, correo_electronico, contrasena_hash, tipo_perfil]
            );
            const id_usuario = userResult.insertId;
            console.log('Usuario principal insertado. ID:', id_usuario); // LOG

            // Inserta datos específicos del perfil según el tipo
            if (tipo_perfil === 'Emprendedor') {
                if (!nombre_negocio || !localidad || !tipo_negocio) {
                    throw new Error('Faltan campos específicos para el perfil Emprendedor.');
                }
                const tipoNegocioString = Array.isArray(tipo_negocio) ? tipo_negocio.join(',') : tipo_negocio;
                console.log('Insertando datos de Emprendedor:', { id_usuario, nombre_negocio, localidad, tipoNegocioString }); // LOG
                await connection.query(
                    'INSERT INTO convenio_emprendimiento_emprendedor (id_usuario, nombre_negocio, localidad, tipo_negocio) VALUES (?, ?, ?, ?)',
                    [id_usuario, nombre_negocio, localidad, tipoNegocioString]
                );
                console.log('Datos de Emprendedor insertados.'); // LOG
            } else if (tipo_perfil === 'Diseñador' || tipo_perfil === 'Marketing') {
                if (!localidad || !modalidad_trabajo) {
                    throw new Error('Faltan campos específicos para el perfil Diseñador/Marketing.');
                }
                // Asegurarse de que modalidad_trabajo sea un string si viene de un array de checkboxes
                const modalidadTrabajoString = Array.isArray(modalidad_trabajo) ? modalidad_trabajo.join(',') : modalidad_trabajo;
                console.log('Insertando datos de Diseñador/Marketing:', { id_usuario, localidad, modalidadTrabajoString }); // LOG
                await connection.query(
                    'INSERT INTO convenio_emprendimiento_disenador_marketing (id_usuario, localidad, modalidad_trabajo) VALUES (?, ?, ?)',
                    [id_usuario, localidad, modalidadTrabajoString]
                );
                console.log('Datos de Diseñador/Marketing insertados.'); // LOG
            } else {
                throw new Error('Tipo de perfil no válido.');
            }

            console.log('Confirmando transacción...'); // LOG
            await connection.commit();
            console.log('Transacción confirmada. Registro exitoso.'); // LOG
            res.status(201).json({ message: 'Usuario registrado exitosamente', userId: id_usuario });

        } catch (transactionError) {
            console.log('Error en transacción. Revirtiendo cambios...', transactionError.message); // LOG
            await connection.rollback();
            console.error('Error durante la transacción de registro:', transactionError);
            res.status(500).json({ message: 'Error al registrar el usuario', error: transactionError.message });
        } finally {
            console.log('Liberando conexión a DB.'); // LOG
            connection.release();
        }

    } catch (error) {
        console.error('Error general en la ruta de registro:', error); // LOG
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// Ruta para el login de usuarios (código existente)
app.post('/api/login', async (req, res) => {
    console.log('Solicitud de login recibida. Datos:', req.body); // LOG
    const { correo_electronico, contrasena } = req.body;

    if (!correo_electronico || !contrasena) {
        console.log('Error 400: Correo o contraseña faltantes.'); // LOG
        return res.status(400).json({ message: 'Correo electrónico y contraseña son obligatorios.' });
    }

    try {
        console.log('Buscando usuario por correo electrónico:', correo_electronico); // LOG
        const [users] = await pool.query('SELECT id_usuario, nombre_usuario, contrasena_hash, tipo_perfil FROM convenio_emprendimiento_usuarios WHERE correo_electronico = ?', [correo_electronico]);

        if (users.length === 0) {
            console.log('Error 401: Usuario no encontrado.'); // LOG
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = users[0];
        console.log('Usuario encontrado. Comparando contraseña...'); // LOG
        const isMatch = await bcrypt.compare(contrasena, user.contrasena_hash);

        if (!isMatch) {
            console.log('Error 401: Contraseña incorrecta.'); // LOG
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        console.log('Credenciales válidas. Generando JWT...'); // LOG
        const token = jwt.sign(
            { id_usuario: user.id_usuario, tipo_perfil: user.tipo_perfil, nombre_usuario: user.nombre_usuario },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log('JWT generado. Enviando respuesta de login.'); // LOG

        res.status(200).json({ message: 'Inicio de sesión exitoso', token, tipo_perfil: user.tipo_perfil, id_usuario: user.id_usuario, nombre_usuario: user.nombre_usuario });

    } catch (error) {
        console.error('Error general en la ruta de login:', error); // LOG
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// NUEVA RUTA PROTEGIDA: Obtener el perfil del usuario logueado
app.get('/api/profile/me', authenticateToken, async (req, res) => {
    console.log('Solicitud GET /api/profile/me recibida para usuario:', req.user.id_usuario); // LOG
    const userId = req.user.id_usuario;
    const userProfileType = req.user.tipo_perfil;

    try {
        let profileData = {};
        console.log('Consultando datos de usuario principal...'); // LOG
        const [users] = await pool.query(
            'SELECT id_usuario, nombre_usuario, correo_electronico, tipo_perfil, foto_perfil_url, descripcion_perfil FROM convenio_emprendimiento_usuarios WHERE id_usuario = ?',
            [userId]
        );

        if (users.length === 0) {
            console.log('Error 404: Perfil de usuario no encontrado para ID:', userId); // LOG
            return res.status(404).json({ message: 'Perfil de usuario no encontrado.' });
        }
        profileData = users[0];
        console.log('Datos de usuario principal obtenidos:', profileData.nombre_usuario); // LOG

        // Consulta los datos específicos del perfil (emprendedor o diseñador_marketing)
        if (userProfileType === 'Emprendedor') {
            console.log('Consultando datos de emprendedor...'); // LOG
            const [emprendedorData] = await pool.query(
                'SELECT nombre_negocio, localidad, tipo_negocio FROM convenio_emprendimiento_emprendedor WHERE id_usuario = ?',
                [userId]
            );
            if (emprendedorData.length > 0) {
                profileData = { ...profileData, ...emprendedorData[0] };
                console.log('Datos de emprendedor obtenidos.'); // LOG
            }
        } else if (userProfileType === 'Diseñador' || userProfileType === 'Marketing') {
            console.log('Consultando datos de diseñador/marketing...'); // LOG
            const [dmData] = await pool.query(
                'SELECT localidad, modalidad_trabajo FROM convenio_emprendimiento_disenador_marketing WHERE id_usuario = ?',
                [userId]
            );
            if (dmData.length > 0) {
                profileData = { ...profileData, ...dmData[0] };
                console.log('Datos de diseñador/marketing obtenidos.'); // LOG
            }
        }

        console.log('Consultando proyectos y fotos del usuario...'); // LOG
        const [projects] = await pool.query(
            'SELECT p.id_proyecto, p.titulo_proyecto, p.descripcion_proyecto, p.fecha_creacion, p.estado, i.id_imagen, i.url_imagen, i.descripcion_imagen FROM convenio_emprendimiento_proyecto p LEFT JOIN convenio_emprendimiento_imagen i ON p.id_proyecto = i.id_proyecto WHERE p.id_usuario = ? ORDER BY p.fecha_creacion DESC, i.orden ASC',
            [userId]
        );
        console.log('Proyectos y fotos obtenidos. Agrupando...'); // LOG

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
                acc[row.id_proyecto].imagenes.push({
                    id_imagen: row.id_imagen,
                    url_imagen: `${req.protocol}://${req.get('host')}/uploads/${row.url_imagen}`,
                    descripcion_imagen: row.descripcion_imagen
                });
            }
            return acc;
        }, {});

        profileData.proyectos = Object.values(groupedProjects);
        console.log('Perfil completo enviado al frontend.'); // LOG
        res.status(200).json(profileData);

    } catch (error) {
        console.error('Error general al obtener el perfil del usuario:', error); // LOG
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
