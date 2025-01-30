const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');  // Conexión a la base de datos

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  valor_uni: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'producto',  // Especificamos el nombre de la tabla
  timestamps: false,      // No hay campos de timestamps en la base de datos
});

module.exports = Producto;
