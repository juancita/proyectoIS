const { Sequelize } = require('sequelize');

// Configuración de PostgreSQL
const sequelize = new Sequelize('deliapp', 'postgres', '123456', {
  host: 'localhost',
  dialect: 'postgres',
});

// Definir los modelos
const Cliente = require('./models/Cliente')(sequelize, Sequelize.DataTypes);
const Pedido = require('./models/Pedido')(sequelize, Sequelize.DataTypes);

// Asociaciones entre modelos
Cliente.hasMany(Pedido, {
  foreignKey: 'cel_clien',
  as: 'pedidos',
});

Pedido.belongsTo(Cliente, {
  foreignKey: 'cel_clien',
  as: 'cliente',
});

// Sincronización con la base de datos
sequelize
  .authenticate()
  .then(() => {
    console.log('Conexión a PostgreSQL exitosa');
  })
  .catch((err) => {
    console.error('Error de conexión:', err);
  });

module.exports = { sequelize, Cliente, Pedido };
