const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('deliapp', 'postgres', '1234', {
  host: 'localhost', // Dirección de tu servidor (generalmente localhost)
  dialect: 'postgres',
  port: 5432, // Puerto de PostgreSQL
});

sequelize
  .authenticate()
  .then(() => console.log('Conexión exitosa con la base de datos'))
  .catch((err) => console.error('Error de conexión:', err));


module.exports = sequelize;