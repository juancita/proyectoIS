const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');  // Conexión a la base de datos
const Cliente = require('./Cliente'); // Importamos el modelo Cliente
const Producto = require('./producto'); // Importamos el modelo Producto

const Pedido = sequelize.define('Pedido', {
  cel_clien: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,  // Establecer como parte de la clave primaria
  },
  id_producto: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,  // Establecer como parte de la clave primaria
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'Pendiente',
  },
  cantidad: {
    type: DataTypes.INTEGER,
  },
  total: {
    type: DataTypes.FLOAT,
  }
}, {
  tableName: 'pedido',  // Especificamos el nombre de la tabla
  timestamps: false,    // No hay campos de timestamps en la base de datos
});

// Relaciones
Pedido.belongsTo(Cliente, { foreignKey: 'cel_clien', as: 'cliente' });
Pedido.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });

module.exports = Pedido;
