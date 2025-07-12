// Importa las librerías necesarias usando sintaxis ES Modules
import express from 'express';
import mysql from 'mysql2/promise'; // Usamos mysql2 con promesas para operaciones asíncronas
import bcrypt from 'bcrypt'; // Para hashear contraseñas
import cors from 'cors'; // Para manejar las políticas de Cross-Origin Resource Sharing
import jwt from 'jsonwebtoken'; // Para generar JSON Web Tokens

// Para el llamado de las rutas y __dirname en ES Modules
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Creación de servidor
const app = express();

// Configura los middlewares
app.use(cors()); // Habilita CORS para permitir solicitudes desde tu frontend Vue.js
app.use(express.json()); // Permite a Express parsear cuerpos de solicitud JSON

// Configuración de la conexión a la base de datos MySQL
// IMPORTANTE: En un entorno de producción, estas credenciales deberían estar en variables de entorno.
const dbConfig = {
    host: 'localhost',
    user: 'root', // Tu usuario de MySQL (WampServer)
    password: '', // Tu contraseña de MySQL (WampServer, a menudo vacía por defecto)
    database: 'convenio_emprendimiento', // El nombre de tu base de datos
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crea un pool de conexiones para la base de datos
const pool = mysql.createPool(dbConfig);

// Clave secreta para firmar los JWT
// ¡CAMBIA ESTO POR UNA CADENA LARGA Y COMPLEJA EN PRODUCCIÓN!
const JWT_SECRET = 'H0l4c0m03st4squ13r0qu3s3p4squ33st03sun4cl4v3sup3rd1f1c1lh3ch4p0rm1';

// Ruta para el registro de usuarios (código existente)
app.post('/api/register', async (req, res) => {
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
        return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados.' });
    }

    try {
        const [users] = await pool.query('SELECT id_usuario FROM convenio_emprendimiento_usuarios WHERE correo_electronico = ?', [correo_electronico]);
        if (users.length > 0) {
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }

        const contrasena_hash = await bcrypt.hash(contrasena, 10);

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [userResult] = await connection.query(
                'INSERT INTO convenio_emprendimiento_usuarios (nombre_usuario, correo_electronico, contrasena_hash, tipo_perfil, fecha_registro) VALUES (?, ?, ?, ?, NOW())',
                [nombre_usuario, correo_electronico, contrasena_hash, tipo_perfil]
            );

            const id_usuario = userResult.insertId;

            if (tipo_perfil === 'Emprendedor') {
                if (!nombre_negocio || !localidad || !tipo_negocio) {
                    throw new Error('Faltan campos específicos para el perfil Emprendedor.');
                }
                const tipoNegocioString = Array.isArray(tipo_negocio) ? tipo_negocio.join(',') : tipo_negocio;
                await connection.query(
                    'INSERT INTO convenio_emprendimiento_emprendedor (id_usuario, nombre_negocio, localidad, tipo_negocio) VALUES (?, ?, ?, ?)',
                    [id_usuario, nombre_negocio, localidad, tipoNegocioString]
                );
            } else if (tipo_perfil === 'Diseñador' || tipo_perfil === 'Marketing') {
                if (!localidad || !modalidad_trabajo) {
                    throw new Error('Faltan campos específicos para el perfil Diseñador/Marketing.');
                }
                await connection.query(
                    'INSERT INTO convenio_emprendimiento_disenador_marketing (id_usuario, localidad, modalidad_trabajo) VALUES (?, ?, ?)',
                    [id_usuario, localidad, modalidad_trabajo]
                );
            } else {
                throw new Error('Tipo de perfil no válido.');
            }

            await connection.commit();
            res.status(201).json({ message: 'Usuario registrado exitosamente', userId: id_usuario });

        } catch (transactionError) {
            await connection.rollback();
            console.error('Error durante la transacción de registro:', transactionError);
            res.status(500).json({ message: 'Error al registrar el usuario', error: transactionError.message });
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error en la ruta de registro:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// NUEVA RUTA PARA EL LOGIN DE USUARIOS
app.post('/api/login', async (req, res) => {
    const { correo_electronico, contrasena } = req.body;

    if (!correo_electronico || !contrasena) {
        return res.status(400).json({ message: 'Correo electrónico y contraseña son obligatorios.' });
    }

    try {
        // Busca el usuario por correo electrónico
        const [users] = await pool.query('SELECT id_usuario, nombre_usuario, contrasena_hash, tipo_perfil FROM convenio_emprendimiento_usuarios WHERE correo_electronico = ?', [correo_electronico]);

        // Si no se encuentra el usuario
        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = users[0];

        // Compara la contraseña proporcionada con el hash almacenado
        const isMatch = await bcrypt.compare(contrasena, user.contrasena_hash);

        // Si las contraseñas no coinciden
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Si las credenciales son válidas, genera un JWT
        const token = jwt.sign(
            { id_usuario: user.id_usuario, tipo_perfil: user.tipo_perfil, nombre_usuario: user.nombre_usuario },
            JWT_SECRET,
            { expiresIn: '1h' } // El token expirará en 1 hora
        );

        // Envía el token y un mensaje de éxito
        res.status(200).json({ message: 'Inicio de sesión exitoso', token, tipo_perfil: user.tipo_perfil, id_usuario: user.id_usuario, nombre_usuario: user.nombre_usuario });

    } catch (error) {
        console.error('Error en la ruta de login:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// Configura el puerto y lanza el servidor
app.set("port", 4000); // Usando el puerto 4000 como en tu configuración
app.listen(app.get("port"), () => {
    console.log("Servidor ejecutando en puerto", app.get("port"));
});

// Manejo de errores del pool de conexiones (opcional, pero buena práctica)
pool.on('error', (err) => {
    console.error('Error en el pool de conexiones de MySQL:', err);
});
