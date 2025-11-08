import request from 'supertest';
import { MongoClient } from 'mongodb';
import express from 'express';
import cors from 'cors';

// Crear una app de Express para testing
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Variables para la conexión de test
let db;
let client;
const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017';
const DB_NAME = 'muro_comentarios_test';
const COLLECTION_NAME = 'comentarios';

// Conectar a MongoDB para tests
beforeAll(async () => {
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);

  // Limpiar la colección antes de los tests
  await db.collection(COLLECTION_NAME).deleteMany({});
});

// Limpiar después de cada test
afterEach(async () => {
  await db.collection(COLLECTION_NAME).deleteMany({});
});

// Cerrar conexión después de todos los tests
afterAll(async () => {
  if (client) {
    await client.close();
  }
});

// Rutas de la API (copiadas del server.js para testing)
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

describe('API de Comentarios - Tests de Integración', () => {
  test('GET /api/comentarios debe retornar una lista vacía inicialmente', async () => {
    const response = await request(app).get('/api/comentarios').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  test('POST /api/comentarios debe crear un comentario y retornarlo', async () => {
    const nuevoComentario = {
      nombre: 'Test User',
      mensaje: 'Este es un mensaje de prueba',
    };

    const response = await request(app)
      .post('/api/comentarios')
      .send(nuevoComentario)
      .expect(201);

    expect(response.body.nombre).toBe('Test User');
    expect(response.body.mensaje).toBe('Este es un mensaje de prueba');
    expect(response.body._id).toBeDefined();
    expect(response.body.fecha).toBeDefined();
  });

  test('POST /api/comentarios debe retornar error 400 cuando el mensaje está vacío', async () => {
    const response = await request(app)
      .post('/api/comentarios')
      .send({ nombre: 'Test', mensaje: '' })
      .expect(400);

    expect(response.body.error).toBe('El mensaje es requerido');
  });

  test('GET /api/comentarios debe retornar los comentarios creados', async () => {
    // Crear un comentario primero
    await request(app)
      .post('/api/comentarios')
      .send({ nombre: 'Usuario 1', mensaje: 'Primer comentario' })
      .expect(201);

    await request(app)
      .post('/api/comentarios')
      .send({ nombre: 'Usuario 2', mensaje: 'Segundo comentario' })
      .expect(201);

    // Obtener todos los comentarios
    const response = await request(app).get('/api/comentarios').expect(200);

    expect(response.body.length).toBe(2);
    expect(response.body[0].mensaje).toBe('Segundo comentario'); // Más reciente primero
  });
});
