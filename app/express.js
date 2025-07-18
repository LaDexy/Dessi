// Importa los módulos necesarios usando la sintaxis ES Module
import express from 'express'; // Framework web para Node.js
import cors from 'cors'; // Middleware para habilitar CORS
import bodyParser from 'body-parser'; // Middleware para parsear cuerpos de solicitud
import jwt from 'jsonwebtoken'; // Para trabajar con JSON Web Tokens
import bcrypt from 'bcryptjs'; // Para encriptar contraseñas
import { MongoClient, ObjectId } from 'mongodb'; // Cliente de MongoDB y ObjectId para IDs

// Inicializa la aplicación Express
const app = express();
const port = 4000; // Puerto donde el servidor Express escuchará

// Clave secreta para firmar los JWTs
// ¡IMPORTANTE! En un entorno de producción, esta clave debe ser una variable de entorno segura.
// Por ejemplo: process.env.JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_fallback'; // Usar variable de entorno o un fallback

// Configuración de la conexión a MongoDB
// ¡IMPORTANTE! En un entorno de producción, esta URI también debe ser una variable de entorno.
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017'; // URI de conexión a tu instancia de MongoDB
const dbName = 'forumDB'; // Nombre de la base de datos

let db; // Variable para almacenar la instancia de la base de datos
let client; // Variable para almacenar la instancia del cliente de MongoDB

// Conectar a MongoDB
async function connectToMongo() {
    try {
        client = new MongoClient(uri); // Crea una nueva instancia del cliente
        await client.connect();
        db = client.db(dbName);
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        // Considera un reintento o un mecanismo de alerta en producción
        process.exit(1); // Salir de la aplicación si no se puede conectar a la base de datos
    }
}

// Llama a la función para conectar a MongoDB al iniciar el servidor
connectToMongo();

// Middlewares
app.use(cors()); // Habilita CORS para todas las solicitudes
app.use(bodyParser.json()); // Parsea el cuerpo de las solicitudes como JSON

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Obtiene el token de la cabecera 'Bearer <token>'

    if (token == null) {
        // Si no hay token, el usuario no está autenticado
        return res.sendStatus(401); // 401 Unauthorized
    }

    // Verifica el token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Si el token no es válido (expirado, mal firmado, etc.)
            return res.sendStatus(403); // 403 Forbidden
        }
        req.user = user; // Adjunta la información del user (id, username) al objeto de solicitud
        next(); // Continúa con la siguiente función middleware o ruta
    });
};

// Rutas de la API

// Ruta de registro de usuarios
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Nombre de usuario y contraseña son requeridos.' });
    }

    try {
        const usersCollection = db.collection('users');
        const existingUser = await usersCollection.findOne({ username });

        if (existingUser) {
            return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
        }

        // Encripta la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10); // 10 es el costo de salting

        const newUser = {
            username,
            password: hashedPassword,
            createdAt: new Date()
        };

        await usersCollection.insertOne(newUser);
        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al registrar usuario.' });
    }
});

// Ruta de inicio de sesión de usuarios
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Nombre de usuario y contraseña son requeridos.' });
    }

    try {
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        // Compara la contraseña proporcionada con la contraseña encriptada
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        // Genera un token JWT que incluye el ID y el nombre de usuario
        // El id del usuario de MongoDB (_id) es un ObjectId, pero jwt.sign lo convierte a string.
        const token = jwt.sign({ id: user._id.toString(), username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Inicio de sesión exitoso.', token });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
    }
});

// Ruta para obtener todos los temas
app.get('/topics', async (req, res) => {
    try {
        const topicsCollection = db.collection('topics');
        // Encuentra todos los temas y los ordena por fecha de creación descendente
        const topics = await topicsCollection.find({}).sort({ createdAt: -1 }).toArray();
        res.json(topics);
    } catch (error) {
        console.error('Error al obtener temas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener temas.' });
    }
});

// Ruta para crear un nuevo tema (requiere autenticación)
app.post('/topics', authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    const { username } = req.user; // Obtiene el nombre de usuario del token

    if (!title || !content) {
        return res.status(400).json({ message: 'Título y contenido son requeridos.' });
    }

    try {
        const topicsCollection = db.collection('topics');
        const newTopic = {
            title,
            content,
            author: username, // Autor del tema
            createdAt: new Date(),
            comments: [] // Inicializa un array vacío para los comentarios
        };
        const result = await topicsCollection.insertOne(newTopic);
        // Devuelve el tema recién creado con su _id
        res.status(201).json({ message: 'Tema creado exitosamente.', topic: { ...newTopic, _id: result.insertedId } });
    } catch (error) {
        console.error('Error al crear tema:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear tema.' });
    }
});

// Ruta para obtener un tema por su ID
app.get('/topics/:id', async (req, res) => {
    const { id } = req.params;
    // Validar si el ID es un ObjectId válido antes de intentar la conversión
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID de tema inválido.' });
    }
    try {
        const topicsCollection = db.collection('topics');
        const topic = await topicsCollection.findOne({ _id: new ObjectId(id) });

        if (!topic) {
            return res.status(404).json({ message: 'Tema no encontrado.' });
        }
        res.json(topic);
    } catch (error) {
        console.error('Error al obtener tema por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener tema.' });
    }
});

// Ruta para añadir un comentario a un tema (requiere autenticación)
app.post('/topics/:id/comments', authenticateToken, async (req, res) => {
    const { id } = req.params; // ID del tema
    const { content } = req.body;
    const { username } = req.user; // Obtiene el nombre de usuario del token

    if (!content) {
        return res.status(400).json({ message: 'El contenido del comentario es requerido.' });
    }
    // Validar si el ID del tema es un ObjectId válido
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID de tema inválido.' });
    }

    try {
        const topicsCollection = db.collection('topics');
        const newComment = {
            _id: new ObjectId(), // Genera un nuevo ObjectId para el comentario
            author: username,
            content,
            createdAt: new Date(),
            reactions: [] // Inicializa un array vacío para las reacciones
        };

        const result = await topicsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $push: { comments: newComment } } // Añade el nuevo comentario al array 'comments'
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Tema no encontrado.' });
        }
        res.status(201).json({ message: 'Comentario añadido exitosamente.', comment: newComment });
    } catch (error) {
        console.error('Error al añadir comentario:', error);
        res.status(500).json({ message: 'Error interno del servidor al añadir comentario.' });
    }
});

// Ruta para añadir/actualizar una reacción a un comentario (requiere autenticación)
app.post('/topics/:topicId/comments/:commentId/reactions', authenticateToken, async (req, res) => {
    const { topicId, commentId } = req.params;
    const { type } = req.body; // Tipo de reacción (e.g., 'like', 'love', 'haha')
    const { id: userId, username } = req.user; // Obtiene el ID y nombre de usuario del token

    if (!type) {
        return res.status(400).json({ message: 'El tipo de reacción es requerido.' });
    }
    // Validar si los IDs son ObjectIds válidos
    if (!ObjectId.isValid(topicId) || !ObjectId.isValid(commentId)) {
        return res.status(400).json({ message: 'ID de tema o comentario inválido.' });
    }

    try {
        const topicsCollection = db.collection('topics');

        // Buscar el tema y el comentario específico
        const topic = await topicsCollection.findOne(
            { _id: new ObjectId(topicId), "comments._id": new ObjectId(commentId) },
            { projection: { "comments.$": 1 } } // Proyectar solo el comentario coincidente
        );

        if (!topic || !topic.comments || topic.comments.length === 0) {
            return res.status(404).json({ message: 'Tema o comentario no encontrado.' });
        }

        const comment = topic.comments[0];
        let reactions = comment.reactions || [];

        // Eliminar cualquier reacción existente del mismo usuario en este comentario
        // Asegurarse de que userId sea un string para la comparación
        reactions = reactions.filter(r => r.userId.toString() !== userId.toString());

        // Añadir la nueva reacción
        reactions.push({ userId: new ObjectId(userId), username, type, createdAt: new Date() });

        // Actualizar el comentario en la base de datos
        const result = await topicsCollection.updateOne(
            { _id: new ObjectId(topicId), "comments._id": new ObjectId(commentId) },
            { $set: { "comments.$.reactions": reactions } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Tema o comentario no encontrado para actualizar.' });
        }
        res.status(200).json({ message: 'Reacción gestionada exitosamente.', reactions });
    } catch (error) {
        console.error('Error al gestionar la reacción:', error);
        res.status(500).json({ message: 'Error interno del servidor al gestionar la reacción.' });
    }
});

// Ruta para eliminar todas las reacciones de un usuario en un comentario (requiere autenticación)
app.delete('/topics/:topicId/comments/:commentId/reactions', authenticateToken, async (req, res) => {
    const { topicId, commentId } = req.params;
    const { id: userId } = req.user; // Obtiene el ID del usuario del token

    // Validar si los IDs son ObjectIds válidos
    if (!ObjectId.isValid(topicId) || !ObjectId.isValid(commentId)) {
        return res.status(400).json({ message: 'ID de tema o comentario inválido.' });
    }

    try {
        const topicsCollection = db.collection('topics');

        // Buscar el tema y el comentario específico
        const topic = await topicsCollection.findOne(
            { _id: new ObjectId(topicId), "comments._id": new ObjectId(commentId) },
            { projection: { "comments.$": 1 } } // Proyectar solo el comentario coincidente
        );

        if (!topic || !topic.comments || topic.comments.length === 0) {
            return res.status(404).json({ message: 'Tema o comentario no encontrado.' });
        }

        const comment = topic.comments[0];
        let reactions = comment.reactions || [];

        // Filtrar para remover todas las reacciones de este usuario
        const initialLength = reactions.length;
        reactions = reactions.filter(r => r.userId.toString() !== userId.toString());

        if (reactions.length === initialLength) {
            // No se encontró ninguna reacción del usuario para eliminar
            return res.status(404).json({ message: 'No se encontraron reacciones de este usuario para eliminar.' });
        }

        // Actualizar el comentario en la base de datos
        const result = await topicsCollection.updateOne(
            { _id: new ObjectId(topicId), "comments._id": new ObjectId(commentId) },
            { $set: { "comments.$.reactions": reactions } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Tema o comentario no encontrado para actualizar.' });
        }
        res.status(200).json({ message: 'Reacciones eliminadas exitosamente.', reactions });
    } catch (error) {
        console.error('Error al eliminar la reacción:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar la reacción.' });
    }
});


// Manejo de cierre de la aplicación para cerrar la conexión a MongoDB
process.on('SIGINT', async () => {
    if (client) {
        await client.close();
        console.log('Conexión a MongoDB cerrada.');
    }
    process.exit(0);
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor Express escuchando en http://localhost:${port}`);
});