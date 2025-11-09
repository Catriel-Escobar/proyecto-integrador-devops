import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import path from 'path';
import clientProm from 'prom-client';
import pkg, { pushMetrics } from 'prometheus-remote-write';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

global.fetch = fetch;
dotenv.config();

const { RemoteWriteClient } = pkg;
const collectDefaultMetrics = clientProm.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });
const httpRequestDurationMicroseconds = new clientProm.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [50, 100, 200, 300, 500, 1000],
});

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'muro_comentarios';
const COLLECTION_NAME = 'comentarios';
console.log('MONGODB_URI:', MONGODB_URI);
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      code: res.statusCode,
    });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', clientProm.register.contentType);
  res.end(await clientProm.register.metrics());
});

const username = process.env.GRAFANA_USERNAME;
const password = process.env.GRAFANA_API_KEY;

const url =
  'https://prometheus-prod-40-prod-sa-east-1.grafana.net/api/prom/push';

async function enviarMetricas() {
  try {
    const metrics = await clientProm.register.getMetricsAsJSON();

    const metricMap = {};
    for (const m of metrics) {
      if (m.type === 'gauge' || m.type === 'counter') {
        metricMap[m.name] = m.values[0]?.value ?? 0;
      }
    }
    await pushMetrics(metricMap, {
      url,
      auth: { username, password },
      labels: { service: 'express-backend' },
    });

    console.log('Métricas enviadas correctamente a Grafana Cloud');
  } catch (err) {
    console.error(' Error enviando métricas:', err.message);
  }
}

setInterval(enviarMetricas, 60000);

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
