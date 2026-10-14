const fs = require('fs/promises');
const path = require('path');
const { uploadsDir } = require('../middlewares/upload');

// Borra un archivo del disco. Si ya no existe no es un problema.
const borrarArchivo = async (ruta) => {
  try {
    await fs.unlink(ruta);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('No se pudo borrar el archivo:', ruta, err.message);
  }
};

// Archivos recién subidos por multer (req.files): se usa cuando algo falla y hay que "deshacer".
const borrarSubidos = (files = []) => Promise.all(files.map((f) => borrarArchivo(f.path)));

// Foto guardada en la base ("/uploads/abc.jpg") -> borra el archivo correspondiente.
// path.basename evita que una URL rara apunte fuera de la carpeta uploads.
const borrarPorUrl = (url) => borrarArchivo(path.join(uploadsDir, path.basename(url)));

module.exports = { borrarSubidos, borrarPorUrl };
