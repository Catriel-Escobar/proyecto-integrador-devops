const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'muro_comentarios';
const COLLECTION_NAME = 'comentarios';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let db;
let client;

async function conectarMongoDB() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Conectado a MongoDB');

    await db.collection(COLLECTION_NAME).createIndex({ fecha: -1 });
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
}

conectarMongoDB();

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

    nuevoComentario._id = result.insertedId;

    res.status(201).json(nuevoComentario);
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ error: 'Error al crear comentario' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('Conexión a MongoDB cerrada');
  }
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
