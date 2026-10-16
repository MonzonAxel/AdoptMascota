const fs = require('fs/promises');
const { FotoAnimal, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const { borrarPorUrl } = require('../utils/archivos');

const MAX_FOTOS_POR_MASCOTA = 6;

// Los primeros bytes de un archivo dicen qué es REALMENTE, sin importar cómo se llame
// ni qué tipo declare el cliente. Así no se puede subir un .exe disfrazado de .jpg.
const tipoReal = async (ruta) => {
  const archivo = await fs.open(ruta, 'r');
  try {
    const { buffer } = await archivo.read(Buffer.alloc(12), 0, 12, 0);
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
    if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
    if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
    return null;
  } finally {
    await archivo.close();
  }
};

const verificarImagenes = async (archivos) => {
  for (const f of archivos) {
    // eslint-disable-next-line no-await-in-loop
    if ((await tipoReal(f.path)) !== f.mimetype) {
      throw new AppError(`El archivo "${f.originalname}" no es una imagen válida`, 422);
    }
  }
};

const validarIndicePrincipal = (valor, cantidad) => {
  if (valor === undefined || valor === null || valor === '') return null;
  const indice = Number(valor);
  if (!Number.isInteger(indice) || indice < 0 || indice >= cantidad) {
    throw new AppError('La selección de foto principal no es válida', 422);
  }
  return indice;
};

// Guarda en la base las fotos que multer ya dejó en el disco.
// La primera foto queda como principal si no existe otra y no se indicó una selección.
const agregar = async (animalId, archivos, { transaction, indicePrincipal: valorIndicePrincipal } = {}) => {
  if (!archivos.length) return [];
  const indicePrincipal = validarIndicePrincipal(valorIndicePrincipal, archivos.length);
  await verificarImagenes(archivos);

  const trabajo = async (t) => {
    const where = { animal_id: animalId };
    const existentes = await FotoAnimal.count({ where, transaction: t });
    if (existentes + archivos.length > MAX_FOTOS_POR_MASCOTA) {
      throw new AppError(`Una mascota puede tener hasta ${MAX_FOTOS_POR_MASCOTA} fotos (ya tiene ${existentes})`, 422);
    }
    const principalActual = await FotoAnimal.findOne({
      where: { ...where, es_principal: true },
      transaction: t,
    });
    const indicePrincipalNuevo = indicePrincipal
      ?? (!principalActual && existentes === 0 ? 0 : null);

    if (indicePrincipal !== null) {
      await FotoAnimal.update({ es_principal: false }, { where, transaction: t });
    } else if (!principalActual && existentes > 0) {
      const primeraExistente = await FotoAnimal.findOne({
        where,
        order: [['orden', 'ASC'], ['id', 'ASC']],
        transaction: t,
      });
      if (primeraExistente) {
        await primeraExistente.update({ es_principal: true }, { transaction: t });
      }
    }
    const maxOrden = await FotoAnimal.max('orden', { where, transaction: t });
    const ultimo = Number.isFinite(maxOrden) ? maxOrden : -1;

    return FotoAnimal.bulkCreate(
      archivos.map((f, i) => ({
        animal_id: animalId,
        url: `/uploads/${f.filename}`,
        es_principal: indicePrincipalNuevo === i,
        orden: ultimo + 1 + i,
      })),
      { transaction: t },
    );
  };

  return transaction ? trabajo(transaction) : sequelize.transaction(trabajo);
};

const buscarFoto = async (animalId, fotoId) => {
  const foto = await FotoAnimal.findOne({ where: { id: fotoId, animal_id: animalId } });
  if (!foto) throw new AppError('Foto no encontrada', 404);
  return foto;
};

// Si se borra la principal, la siguiente pasa a ser la principal (la mascota nunca queda "sin portada").
const quitar = async (animalId, fotoId) => {
  const foto = await buscarFoto(animalId, fotoId);
  await sequelize.transaction(async (t) => {
    await foto.destroy({ transaction: t });
    if (foto.es_principal) {
      const siguiente = await FotoAnimal.findOne({
        where: { animal_id: animalId }, order: [['orden', 'ASC'], ['id', 'ASC']], transaction: t,
      });
      if (siguiente) await FotoAnimal.update({ es_principal: true }, { where: { id: siguiente.id }, transaction: t });
    }
  });
  await borrarPorUrl(foto.url); // el archivo se borra recién cuando la base ya confirmó
};

const marcarPrincipal = async (animalId, fotoId) => {
  const foto = await buscarFoto(animalId, fotoId);
  await sequelize.transaction(async (t) => {
    await FotoAnimal.update({ es_principal: false }, { where: { animal_id: animalId }, transaction: t });
    await FotoAnimal.update({ es_principal: true }, { where: { id: foto.id }, transaction: t });
  });
};

module.exports = { MAX_FOTOS_POR_MASCOTA, agregar, quitar, marcarPrincipal };
