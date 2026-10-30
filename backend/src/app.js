require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const validarOrigen = require('./middlewares/validarOrigen');
const { uploadsDir } = require('./middlewares/upload');

const app = express();

// Detrás de un proxy/hosting (Render, Railway, nginx...) hay que definir TRUST_PROXY=1 en el .env;
// si no, todos los visitantes parecen tener la misma IP y el límite de pedidos los frena a todos juntos.
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', /^\d+$/.test(process.env.TRUST_PROXY) ? Number(process.env.TRUST_PROXY) : process.env.TRUST_PROXY);
}

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(uploadsDir, {
  // Evita que el navegador "adivine" otro tipo de archivo distinto al de la imagen.
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'))));
app.use('/api', validarOrigen, routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
