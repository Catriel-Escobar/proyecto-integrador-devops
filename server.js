const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'muro_comentarios';
const COLLECTION_NAME = 'comentarios';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Variables globales para la conexión
let db;
let client;

// Conectar a MongoDB
async function conectarMongoDB() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Conectado a MongoDB');

    // Crear índice para ordenar por fecha
    await db.collection(COLLECTION_NAME).createIndex({ fecha: -1 });
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
}

// Inicializar conexión
conectarMongoDB();

// Rutas API

// Obtener todos los comentarios
app.get('/api/comentarios', async (req, res) => {
  try {
    const comentarios = await db
      .collection(COLLECTION_NAME)
      .find({})
      .sort({ fecha: -1 })
      .toArray();

    res.json(comentarios);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});

// Crear un nuevo comentario
app.post('/api/comentarios', async (req, res) => {
  try {
    const { nombre, mensaje } = req.body;

    if (!mensaje) {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    if (mensaje.trim().length === 0) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    const nombreFinal = nombre && nombre.trim() ? nombre.trim() : 'Anónimo';
    const fecha = new Date();

    const nuevoComentario = {
      nombre: nombreFinal,
      mensaje: mensaje.trim(),
      fecha: fecha,
    };

    const result = await db
      .collection(COLLECTION_NAME)
      .insertOne(nuevoComentario);

    // Obtener el comentario insertado con su _id
    nuevoComentario._id = result.insertedId;

    res.status(201).json(nuevoComentario);
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ error: 'Error al crear comentario' });
  }
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('Conexión a MongoDB cerrada');
  }
  process.exit(0);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
