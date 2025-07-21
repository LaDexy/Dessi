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
// Middleware de CORS: ¡Este es el que permite la comunicación entre tu frontend y backend!
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
    database: 'convenio_emprendimiento', // Nombre de tu base de datos
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crea un pool de conexiones para la base de datos
const pool = mysql.createPool(dbConfig);

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

// --- RUTA PARA REGISTRO DE USUARIOS ---
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
                'INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena_hash, tipo_perfil, fecha_registro, foto_perfil_url, descripcion_perfil, reputacion) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)',
                [nombre_usuario, correo_electronico, contrasena_hash, tipo_perfil, '', '', 0] // Valores por defecto para foto, descripción y reputación
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

// --- RUTA PARA LOGIN DE USUARIOS ---
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
            { expiresIn: '24h' }
        );
        console.log('JWT generado. Enviando respuesta de login.');

        res.status(200).json({ message: 'Inicio de sesión exitoso', token, tipo_perfil: user.tipo_perfil, id_usuario: user.id_usuario, nombre_usuario: user.nombre_usuario });

    } catch (error) {
        console.error('Error general en la ruta de login:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// --- RUTA PROTEGIDA: OBTENER EL PERFIL DEL USUARIO LOGUEADO ---
app.get('/api/profile/me', authenticateToken, async (req, res) => {
    console.log('Solicitud GET /api/profile/me recibida para usuario:', req.user.id_usuario);
    const userId = req.user.id_usuario;
    const userProfileType = req.user.tipo_perfil;

    try {
        let profileData = {};
        console.log('Consultando datos de usuario principal...');
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
            console.log('Consultando datos de emprendedor...');
            const [emprendedorData] = await pool.query(
                'SELECT nombre_negocio, localidad, tipo_negocio FROM emprendedor WHERE id_usuario = ?',
                [userId]
            );
            if (emprendedorData.length > 0) {
                profileData = { ...profileData, ...emprendedorData[0] };
            }
        } else if (userProfileType === 'Diseñador' || userProfileType === 'Marketing') {
            console.log('Consultando datos de diseñador/marketing...');
            const [dmData] = await pool.query(
                'SELECT localidad, modalidad_trabajo FROM disenador_marketing WHERE id_usuario = ?',
                [userId]
            );
            if (dmData.length > 0) {
                profileData = { ...profileData, ...dmData[0] };
            }
        }

        console.log('Consultando proyectos y fotos del usuario...');
        const [projects] = await pool.query(
            'SELECT p.id_proyecto, p.titulo_proyecto, p.descripcion_proyecto, p.fecha_creacion, p.estado, i.id_imagen, i.url_imagen, i.descripcion_imagen FROM proyecto p LEFT JOIN imagen i ON p.id_proyecto = i.id_proyecto WHERE p.id_usuario = ? ORDER BY p.fecha_creacion DESC, i.orden ASC',
            [userId]
        );
        console.log('Proyectos y fotos obtenidos. Agrupando...');

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
        console.log('Perfil completo enviado al frontend.');
        res.status(200).json(profileData);

    } catch (error) {
        console.error('Error general al obtener el perfil del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// --- RUTA PARA SUBIR FOTO DE PERFIL (INDIVIDUAL) ---
app.post('/api/upload-profile-image', authenticateToken, upload.single('profileImage'), async (req, res) => {
    const userId = req.user.id_usuario;

    if (!req.file) {
        console.error('Error: No se ha subido ningún archivo para la foto de perfil.');
        return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    try {
        const [result] = await pool.query(
            'UPDATE usuarios SET foto_perfil_url = ? WHERE id_usuario = ?',
            [imageUrl, userId]
        );

        if (result.affectedRows === 0) {
            console.warn(`No se encontró usuario con ID ${userId} para actualizar la imagen de perfil.`);
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        console.log(`URL de imagen de perfil actualizada para userId ${userId}: ${imageUrl}`);
        const fullImageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
        res.status(200).json({ message: 'Imagen de perfil subida y URL actualizada!', imageUrl: fullImageUrl });

    } catch (error) {
        console.error('Error al actualizar la URL de la imagen de perfil en la DB:', error);
        res.status(500).json({ message: 'Error interno del servidor al guardar la URL de la imagen de perfil.', error: error.message });
    }
});

// --- RUTA: PARA ACTUALIZAR LA DESCRIPCIÓN DEL PERFIL ---
app.patch('/api/profile/description', authenticateToken, async (req, res) => {
    console.log('Solicitud PATCH /api/profile/description recibida para usuario:', req.user.id_usuario);
    const userId = req.user.id_usuario;
    const { description } = req.body;

    if (description === undefined || description === null) {
        console.warn('Error 400: Descripción no proporcionada.');
        return res.status(400).json({ message: 'La descripción es requerida.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE usuarios SET descripcion_perfil = ? WHERE id_usuario = ?',
            [description, userId]
        );

        if (result.affectedRows === 0) {
            console.warn(`No se encontró usuario con ID ${userId} para actualizar la descripción.`);
            return res.status(404).json({ message: 'Usuario no encontrado o descripción no cambiada.' });
        }

        console.log(`Descripción actualizada para userId ${userId}. Nueva descripción: "${description}"`);
        res.status(200).json({ message: 'Descripción actualizada exitosamente!' });

    } catch (error) {
        console.error('Error al actualizar la descripción en la DB:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar la descripción.', error: error.message });
    }
});

// --- RUTA: SUBIR MÚLTIPLES IMÁGENES AL PORTAFOLIO ---
app.post('/api/upload-portfolio-images', authenticateToken, upload.array('portfolioImages', 10), async (req, res) => {
    console.log('Solicitud POST /api/upload-portfolio-images recibida para usuario:', req.user.id_usuario);
    const userId = req.user.id_usuario;

    if (!req.files || req.files.length === 0) {
        console.error('Error: No se han subido archivos para el portafolio.');
        return res.status(400).json({ message: 'No se han subido archivos de imagen.' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();
    const uploadedImageUrls = [];

    try {
        // 1. Buscar o crear un proyecto genérico para el portafolio del usuario
        let projectId;
        const [existingProjects] = await connection.query(
            'SELECT id_proyecto FROM proyecto WHERE id_usuario = ? AND titulo_proyecto = ?',
            [userId, 'Mi Portafolio']
        );

        if (existingProjects.length > 0) {
            projectId = existingProjects[0].id_proyecto;
            console.log(`Proyecto 'Mi Portafolio' existente encontrado para userId ${userId}: ${projectId}`);
        } else {
            // Si no existe, crear un nuevo proyecto genérico
            console.log(`Creando nuevo proyecto 'Mi Portafolio' para userId ${userId}...`);
            const [newProjectResult] = await connection.query(
                'INSERT INTO proyecto (id_usuario, titulo_proyecto, descripcion_proyecto, fecha_creacion, estado) VALUES (?, ?, ?, NOW(), ?)',
                [userId, 'Mi Portafolio', 'Imágenes de mi portafolio personal.', 'Activo']
            );
            projectId = newProjectResult.insertId;
            console.log(`Proyecto 'Mi Portafolio' creado con ID: ${projectId}`);
        }

        // 2. Insertar cada imagen en la tabla 'imagen' y asociarla al proyecto
        for (const file of req.files) {
            const imageUrl = `/uploads/${file.filename}`;
            const [imageResult] = await connection.query(
                'INSERT INTO imagen (id_proyecto, url_imagen, descripcion_imagen) VALUES (?, ?, ?)',
                [projectId, imageUrl, 'Imagen de portafolio'] // Puedes añadir una descripción por defecto
            );
            const id_imagen = imageResult.insertId;
            const fullImageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
            uploadedImageUrls.push({ id_imagen, url_imagen: fullImageUrl, descripcion_imagen: 'Imagen de portafolio' });
            console.log(`Imagen de portafolio insertada: ${fullImageUrl} para proyecto ${projectId}`);
        }

        await connection.commit();
        console.log('Imágenes de portafolio subidas y guardadas exitosamente.');
        res.status(200).json({ message: 'Imágenes subidas exitosamente!', images: uploadedImageUrls });

    } catch (error) {
        await connection.rollback();
        console.error('Error al subir imágenes al portafolio:', error);
        res.status(500).json({ message: 'Error interno del servidor al subir imágenes.', error: error.message });
    } finally {
        connection.release();
    }
});

// --- RUTA: ELIMINAR IMAGEN DEL PORTAFOLIO ---
app.delete('/api/delete-portfolio-image/:id_imagen', authenticateToken, async (req, res) => {
    console.log('Solicitud DELETE /api/delete-portfolio-image recibida para imagen ID:', req.params.id_imagen);
    const imageId = req.params.id_imagen;
    const userId = req.user.id_usuario;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Obtener la URL de la imagen y verificar que pertenece al usuario
        const [images] = await connection.query(
            'SELECT i.url_imagen FROM imagen i JOIN proyecto p ON i.id_proyecto = p.id_proyecto WHERE i.id_imagen = ? AND p.id_usuario = ?',
            [imageId, userId]
        );

        if (images.length === 0) {
            console.warn(`Error 404/403: Imagen con ID ${imageId} no encontrada o no pertenece al usuario ${userId}.`);
            await connection.rollback();
            return res.status(404).json({ message: 'Imagen no encontrada o no tienes permiso para eliminarla.' });
        }

        const imageUrlToDelete = images[0].url_imagen;
        const filePath = path.join(__dirname, imageUrlToDelete); // Obtener la ruta física del archivo

        // 2. Eliminar la imagen de la base de datos
        const [result] = await connection.query(
            'DELETE FROM imagen WHERE id_imagen = ?',
            [imageId]
        );

        if (result.affectedRows === 0) {
            console.warn(`No se eliminó ninguna imagen con ID ${imageId}.`);
            await connection.rollback();
            return res.status(404).json({ message: 'Imagen no encontrada.' });
        }

        // 3. Eliminar el archivo físico del servidor (opcional, pero recomendado)
        // Asegúrate de que la URL no sea un path absoluto fuera de 'uploads' por seguridad
        if (filePath.startsWith(path.join(__dirname, 'uploads'))) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error al eliminar el archivo físico ${filePath}:`, err);
                    // No revertimos la DB si falla la eliminación del archivo, solo loggeamos
                } else {
                    console.log(`Archivo físico eliminado: ${filePath}`);
                }
            });
        } else {
            console.warn(`Intento de eliminar archivo fuera del directorio de uploads: ${filePath}`);
        }

        await connection.commit();
        console.log(`Imagen con ID ${imageId} eliminada exitosamente de la DB.`);
        res.status(200).json({ message: 'Imagen eliminada exitosamente!' });

    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar la imagen del portafolio:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar la imagen.', error: error.message });
    } finally {
        connection.release();
    }
});

// --- RUTA: CREAR UN NUEVO DESAFÍO ---
app.post('/api/challenges', authenticateToken, async (req, res) => {
    console.log('Solicitud POST /api/challenges recibida para usuario:', req.user.id_usuario);
    const userId = req.user.id_usuario; // ID del usuario autenticado
    const userProfileType = req.user.tipo_perfil; // Tipo de perfil del usuario autenticado

    // 1. Verificar que el usuario sea un Emprendedor
    if (userProfileType !== 'Emprendedor') {
        console.warn('Error 403: Usuario no autorizado para crear desafíos. Tipo de perfil:', userProfileType);
        return res.status(403).json({ message: 'Solo los usuarios Emprendedores pueden crear desafíos.' });
    }

    // 2. Validación de campos del desafío
    const { nombre_desafio, descripcion_desafio, beneficios, duracion_dias } = req.body;

    if (!nombre_desafio || !descripcion_desafio || !beneficios || !duracion_dias) {
        console.warn('Error 400: Campos de desafío incompletos.');
        return res.status(400).json({ message: 'Todos los campos del desafío son obligatorios.' });
    }
    if (typeof duracion_dias !== 'number' || duracion_dias <= 0) {
        console.warn('Error 400: Duración de días inválida.');
        return res.status(400).json({ message: 'La duración del desafío debe ser un número positivo de días.' });
    }

    try {
        // 3. Obtener el id_emprendedor a partir del id_usuario
        console.log('Buscando id_emprendedor para id_usuario:', userId);
        const [emprendedorResult] = await pool.query(
            'SELECT id_emprendedor FROM emprendedor WHERE id_usuario = ?',
            [userId]
        );

        if (emprendedorResult.length === 0) {
            console.warn('Error 404: No se encontró el id_emprendedor asociado al id_usuario.', userId);
            return res.status(404).json({ message: 'No se encontró el perfil de emprendedor asociado a este usuario.' });
        }
        const id_emprendedor = emprendedorResult[0].id_emprendedor;
        console.log('id_emprendedor encontrado:', id_emprendedor);

        // 4. Calcular fecha_fin
        const fechaCreacion = new Date();
        const fechaFin = new Date(fechaCreacion);
        fechaFin.setDate(fechaCreacion.getDate() + duracion_dias);

        // 5. Insertar el desafío en la tabla 'desafios'
        const [result] = await pool.query(
            'INSERT INTO desafios (id_emprendedor, nombre_desafio, descripcion_desafio, beneficios, dias_duracion, fecha_creacion, fecha_fin) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_emprendedor, nombre_desafio, descripcion_desafio, beneficios, duracion_dias, fechaCreacion, fechaFin]
        );

        console.log(`Desafío creado exitosamente para id_emprendedor ${id_emprendedor}. ID: ${result.insertId}`);
        res.status(201).json({ message: 'Desafío creado exitosamente!', id_desafio: result.insertId });

    } catch (error) {
        console.error('Error al crear el desafío en la DB:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear el desafío.', error: error.message });
    }
});

// --- RUTA: OBTENER DESAFÍOS CREADOS POR EL USUARIO LOGUEADO ---
app.get('/api/challenges/me', authenticateToken, async (req, res) => {
    console.log('Solicitud GET /api/challenges/me recibida para usuario:', req.user.id_usuario);
    const userId = req.user.id_usuario; // ID del usuario autenticado
    const userProfileType = req.user.tipo_perfil; // Tipo de perfil del usuario autenticado

    // 1. Verificar que el usuario sea un Emprendedor
    if (userProfileType !== 'Emprendedor') {
        console.warn('Error 403: Usuario no autorizado para ver desafíos. Tipo de perfil:', userProfileType);
        return res.status(403).json({ message: 'Solo los usuarios Emprendedores pueden ver sus desafíos.' });
    }

    try {
        // 2. Obtener el id_emprendedor a partir del id_usuario
        console.log('Buscando id_emprendedor para id_usuario:', userId);
        const [emprendedorResult] = await pool.query(
            'SELECT id_emprendedor FROM emprendedor WHERE id_usuario = ?',
            [userId]
        );

        if (emprendedorResult.length === 0) {
            console.warn('Error 404: No se encontró el id_emprendedor asociado al id_usuario.', userId);
            return res.status(404).json({ message: 'No se encontró el perfil de emprendedor asociado a este usuario.' });
        }
        const id_emprendedor = emprendedorResult[0].id_emprendedor;
        console.log('id_emprendedor encontrado para obtener desafíos:', id_emprendedor);

        // 3. Obtener los desafíos asociados a ese id_emprendedor
        const [challenges] = await pool.query(
            'SELECT id_desafio, id_emprendedor, nombre_desafio, descripcion_desafio, beneficios, dias_duracion, fecha_creacion, fecha_fin, estado FROM desafios WHERE id_emprendedor = ? ORDER BY fecha_creacion DESC',
            [id_emprendedor]
        );

        console.log(`Desafíos obtenidos para id_emprendedor ${id_emprendedor}: ${challenges.length} desafíos.`);
        res.status(200).json(challenges);

    } catch (error) {
        console.error('Error al obtener los desafíos del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener desafíos.', error: error.message });
    }
});

// --- NUEVA RUTA: OBTENER TODOS LOS PERFILES (EXCEPTO EL DEL USUARIO LOGUEADO) ---
app.get('/api/profiles', authenticateToken, async (req, res) => {
    console.log('Solicitud GET /api/profiles recibida para usuario:', req.user.id_usuario);
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

        console.log(`Perfiles obtenidos (excluyendo el actual): ${allProfiles.length}`);

        // Procesar los resultados para un formato consistente
        const formattedProfiles = allProfiles.map(profile => {
            let profession = profile.tipo_perfil;
            let location = '';
            let description = profile.descripcion_perfil || 'Aún no ha añadido una descripción.'; // Default description

            // Determinar la profesión y la localidad basada en el tipo de perfil
            if (profile.tipo_perfil === 'Emprendedor') {
                profession = profile.nombre_negocio || 'Emprendedor';
                location = profile.emprendedor_localidad || '';
            } else if (profile.tipo_perfil === 'Diseñador') {
                profession = 'Diseñador';
                location = profile.dm_localidad || '';
            } else if (profile.tipo_perfil === 'Marketing') {
                profession = 'Especialista en Marketing';
                location = profile.dm_localidad || '';
            }

            // Construir la URL completa de la imagen de perfil
            const fullImageUrl = profile.foto_perfil_url
                ? `${req.protocol}://${req.get('host')}${profile.foto_perfil_url}`
                : ''; // Dejar vacío si no hay URL, el frontend usará el default

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
        console.error('Error al obtener todos los perfiles:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener perfiles.', error: error.message });
    }
});

// --- RUTAS DEL FORO ---

// 1. Ruta para obtener TODOS los temas del foro
app.get('/api/forum/threads', async (req, res) => {
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

        const formattedThreads = threads.map(thread => ({
            id: thread.id,
            title: thread.title,
            content: thread.content,
            author: thread.author,
            date: thread.date,
            // authorReputation: thread.authorReputation || 0, // Eliminada esta línea
            replies: thread.replies_count
        }));

        res.status(200).json(formattedThreads);
    } catch (error) {
        console.error('Error al obtener los temas del foro:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener temas del foro.', error: error.message });
    }
});

// 2. Ruta para CREAR un nuevo tema del foro (requiere autenticación)
app.post('/api/forum/threads', authenticateToken, async (req, res) => {
    console.log('Solicitud POST /api/forum/threads recibida para usuario:', req.user.id_usuario);
    const userId = req.user.id_usuario; // ID del usuario autenticado
    const { title, content } = req.body; // El frontend envía 'content'

    if (!title || !content) {
        return res.status(400).json({ message: 'El título y el contenido del tema son obligatorios.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO foro (id_usuario, titulo, descripcion, fecha_creacion) VALUES (?, ?, ?, NOW())', // ¡CAMBIADO: de 'contenido' a 'descripcion'!
            [userId, title, content] // 'content' del frontend se mapea a 'descripcion' en la DB
        );

        const newThreadId = result.insertId;
        console.log(`Tema de foro creado exitosamente por usuario ${userId}. ID: ${newThreadId}`);
        res.status(201).json({ message: 'Tema creado exitosamente', threadId: newThreadId });

    } catch (error) {
        console.error('Error al crear el tema del foro:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear el tema.', error: error.message });
    }
});

// 3. Ruta para obtener un TEMA ESPECÍFICO del foro por ID
app.get('/api/forum/threads/:id', async (req, res) => {
    const threadId = req.params.id;
    console.log(`Solicitud GET /api/forum/threads/${threadId} recibida.`);

    try {
        // Obtener el tema principal
        const [threads] = await pool.query(`
            SELECT
                f.id_foro AS id,
                f.titulo AS title,
                f.descripcion AS content,
                u.nombre_usuario AS author,
                f.fecha_creacion AS date
            FROM
                foro f
            JOIN
                usuarios u ON f.id_usuario = u.id_usuario
            WHERE
                f.id_foro = ?
        `, [threadId]);

        if (threads.length === 0) {
            console.log(`Tema con ID ${threadId} no encontrado.`);
            return res.status(404).json({ message: 'Tema del foro no encontrado.' });
        }

        const thread = threads[0];

        // Obtener las respuestas para ese tema
        const [replies] = await pool.query(`
            SELECT
                fr.id_mensaje AS id,
                fr.contenido AS content,
                u.nombre_usuario AS author,
                fr.fecha_publicacion AS date
            FROM
                foro_mensaje fr
            JOIN
                usuarios u ON fr.id_usuario = u.id_usuario
            WHERE
                fr.id_foro = ?
            ORDER BY
                fr.fecha_publicacion ASC
        `, [threadId]);

        // Añadir las respuestas al objeto del tema
        thread.replies = replies;

        console.log(`Detalles del tema ${threadId} y sus respuestas obtenidos.`);
        res.status(200).json(thread);

    } catch (error) {
        console.error(`Error al obtener el tema ${threadId} o sus respuestas:`, error);
        res.status(500).json({ message: 'Error interno del servidor al obtener el tema del foro.', error: error.message });
    }
});

// 4. Ruta para añadir una RESPUESTA a un tema (requiere autenticación)
app.post('/api/forum/threads/:id/replies', authenticateToken, async (req, res) => {
    const threadId = req.params.id;
    const userId = req.user.id_usuario; // ID del usuario del token
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'El contenido de la respuesta es obligatorio.' });
    }

    try {
        // Verificar si el tema existe
        const [threads] = await pool.query('SELECT id_foro FROM foro WHERE id_foro = ?', [threadId]);
        if (threads.length === 0) {
            return res.status(404).json({ message: 'El tema al que intentas responder no existe.' });
        }

        const [result] = await pool.query(
            'INSERT INTO foro_mensaje (id_foro, id_usuario, contenido, fecha_publicacion) VALUES (?, ?, ?, NOW())',
            [threadId, userId, content]
        );

        const newReplyId = result.insertId;
        console.log(`Respuesta añadida al tema ${threadId} por usuario ${userId}. ID: ${newReplyId}`);
        res.status(201).json({ message: 'Respuesta publicada exitosamente', replyId: newReplyId });

    } catch (error) {
        console.error('Error al añadir respuesta al tema:', error);
        res.status(500).json({ message: 'Error interno del servidor al añadir respuesta.', error: error.message });
    }
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Convenio de Emprendimiento funcionando!');
});

// Inicio del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en el puerto ${PORT}`);
});
