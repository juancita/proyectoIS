// models/Producto.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Orden = require('./orden');  // Asegúrate de importar el modelo Orden

const producto = sequelize.define('producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
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
  }
});

// Asociación Producto tiene muchas Ordenes



module.exports = producto;
