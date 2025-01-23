const { Sequelize } = require('sequelize');

// Configuración de PostgreSQL
const sequelize = new Sequelize('postgres', 'postgres', '123456', {
  host: 'localhost',
  dialect: 'postgres',
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Conexión a PostgreSQL exitosa');
  })
  .catch((err) => {
    console.error('Error de conexión:', err);
  });

module.exports = sequelize;
