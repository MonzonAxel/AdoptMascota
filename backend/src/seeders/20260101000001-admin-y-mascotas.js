require('dotenv').config();
const bcrypt = require('bcrypt');

module.exports = {
  async up(qi) {
    const now = new Date();
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@adoptmascota.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin1234!';

    await qi.bulkInsert('usuarios', [
      { id: 1, email, password_hash: await bcrypt.hash(password, 10), rol: 'admin', createdAt: now, updatedAt: now },
    ]);
    await qi.bulkInsert('perfil_usuario', [
      { usuario_id: 1, nombre: 'Admin', apellido: 'AdoptMascota', createdAt: now, updatedAt: now },
    ]);

    const base = { fecha_ingreso: now, estado: 'disponible', creado_por: 1, actualizado_por: 1, createdAt: now, updatedAt: now };
    await qi.bulkInsert('animales', [
      { ...base, id: 1, nombre: 'Luna', especie: 'perro', raza: 'Mestizo', sexo: 'hembra', tamano: 'mediano', edad: 3, color: 'marron', comportamiento: 'Cariñosa y juguetona, se lleva bien con niños.', vacunado: true, esterilizado: true },
      { ...base, id: 2, nombre: 'Milo', especie: 'gato', raza: 'Común europeo', sexo: 'macho', tamano: 'pequeno', edad: 1, color: 'atigrado', comportamiento: 'Curioso y tranquilo.', vacunado: true, esterilizado: false },
      { ...base, id: 3, nombre: 'Thor', especie: 'perro', raza: 'Labrador', sexo: 'macho', tamano: 'grande', edad: 5, color: 'dorado', comportamiento: 'Muy activo, necesita espacio para correr.', vacunado: true, esterilizado: true },
      { ...base, id: 4, nombre: 'Nala', especie: 'gato', raza: 'Siamés', sexo: 'hembra', tamano: 'pequeno', edad: 2, color: 'crema', comportamiento: 'Independiente pero afectuosa.', vacunado: false, esterilizado: true },
    ]);
    await qi.bulkInsert('fotos_animal', [1, 2, 3, 4].map((id) => ({
      animal_id: id, url: `/uploads/placeholder-${id}.jpg`, es_principal: true, orden: 0, createdAt: now, updatedAt: now,
    })));
  },
  async down(qi) {
    await qi.bulkDelete('fotos_animal', null, {});
    await qi.bulkDelete('animales', null, {});
    await qi.bulkDelete('perfil_usuario', null, {});
    await qi.bulkDelete('usuarios', null, {});
  },
};
