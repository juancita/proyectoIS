module.exports = (sequelize, DataTypes) => {
  const Pedido = sequelize.define('Pedido', {
    cel_clien: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING,
      defaultValue: 'Pendiente',
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    primaryKey: ['cel_clien', 'id'], // Definimos la clave primaria compuesta
  });

  // Relación muchos a uno con Cliente
/*  Pedido.belongsTo(sequelize.models.Cliente, {
    foreignKey: 'cel_clien',
    as: 'cliente',
}); */ 

  return Pedido;
};
