// Importa las librerías necesarias usando sintaxis ES Modules
import express from 'express';
import mysql from 'mysql2/promise'; // Usamos mysql2 con promesas para operaciones asíncronas
import bcrypt from 'bcrypt'; // Para hashear contraseñas
import cors from 'cors'; // Para manejar las políticas de Cross-Origin Resource Sharing

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
// Un pool de conexiones es más eficiente para manejar múltiples solicitudes
const pool = mysql.createPool(dbConfig);

// Ruta para el registro de usuarios
app.post('/api/register', async (req, res) => {
    // Extrae los datos del cuerpo de la solicitud
    const {
        nombre_usuario,
        correo_electronico,
        contrasena,
        tipo_perfil,
        nombre_negocio, // Solo para Emprendedor
        localidad,
        tipo_negocio, // Solo para Emprendedor (Tienda Virtual/Física)
        modalidad_trabajo // Solo para Diseñador/Marketing (Remoto/Semi-Presencial)
    } = req.body;

    // Validación básica de los datos de entrada
    if (!nombre_usuario || !correo_electronico || !contrasena || !tipo_perfil) {
        return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados.' });
    }

    try {
        // Verifica si el correo electrónico ya está registrado
        const [users] = await pool.query('SELECT id_usuario FROM convenio_emprendimiento_usuarios WHERE correo_electronico = ?', [correo_electronico]);
        if (users.length > 0) {
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }

        // Hashea la contraseña antes de guardarla en la base de datos
        // El '10' es el número de rondas de sal, un valor común y seguro
        const contrasena_hash = await bcrypt.hash(contrasena, 10);

        // Inicia una transacción para asegurar la consistencia de los datos
        // Si algo falla, se revertirán todos los cambios
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Inserta el usuario principal en la tabla de usuarios
            const [userResult] = await connection.query(
                'INSERT INTO convenio_emprendimiento_usuarios (nombre_usuario, correo_electronico, contrasena_hash, tipo_perfil, fecha_registro) VALUES (?, ?, ?, ?, NOW())',
                [nombre_usuario, correo_electronico, contrasena_hash, tipo_perfil]
            );

            // Obtiene el ID del usuario recién insertado
            const id_usuario = userResult.insertId;

            // Inserta datos específicos del perfil según el tipo
            if (tipo_perfil === 'Emprendedor') {
                if (!nombre_negocio || !localidad || !tipo_negocio) {
                    throw new Error('Faltan campos específicos para el perfil Emprendedor.');
                }
                // Asegúrate de que tipo_negocio sea un array si viene de checkboxes y únelo con comas
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

            // Confirma la transacción
            await connection.commit();
            res.status(201).json({ message: 'Usuario registrado exitosamente', userId: id_usuario });

        } catch (transactionError) {
            // Si hay un error en la transacción, revierte los cambios
            await connection.rollback();
            console.error('Error durante la transacción de registro:', transactionError);
            res.status(500).json({ message: 'Error al registrar el usuario', error: transactionError.message });
        } finally {
            // Libera la conexión de vuelta al pool
            connection.release();
        }

    } catch (error) {
        console.error('Error en la ruta de registro:', error);
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
