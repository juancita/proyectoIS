const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');  // Conexión a la base de datos

const Cliente = sequelize.define('Cliente', {
  cel: {
    type: DataTypes.BIGINT,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'cliente',  // Especificamos el nombre de la tabla
  timestamps: false,     // No hay campos de timestamps en la base de datos
});

module.exports = Cliente;
