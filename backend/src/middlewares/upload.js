const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const AppError = require('../utils/AppError');

const uploadsDir = path.resolve(process.env.UPLOADS_DIR || 'uploads');
const maxMb = Number(process.env.MAX_FILE_SIZE_MB) || 5;
const MAX_FOTOS_POR_VEZ = 6;

// Solo estos tipos, y la extensión sale de acá (no del nombre que mande el cliente).
const EXTENSIONES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

fs.mkdirSync(uploadsDir, { recursive: true }); // si la carpeta no existe, la crea

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${crypto.randomUUID()}${EXTENSIONES[file.mimetype]}`),
});

const upload = multer({
  storage,
  limits: { fileSize: maxMb * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    EXTENSIONES[file.mimetype]
      ? cb(null, true)
      : cb(new AppError('Solo se permiten imágenes JPG, PNG o WEBP', 400)),
});

// Uso en rutas: fotos -> req.files (campo "fotos", hasta 6 archivos por vez)
module.exports = { upload, fotos: upload.array('fotos', MAX_FOTOS_POR_VEZ), uploadsDir, maxMb, MAX_FOTOS_POR_VEZ };
