const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Pedido = sequelize.define('Pedido', {
  cliente: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  producto: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pendiente', // Por defecto el estado será "Pendiente"
  },
});

module.exports = Pedido;
