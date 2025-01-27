module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    cel_clien: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,  // Asumí que la clave primaria es cel_clien
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  /* Relación uno a muchos con Pedido
  Cliente.hasMany(sequelize.models.Pedido, {
    foreignKey: 'cel_clien',
    as: 'pedidos',  // Alias para acceder a los pedidos de un cliente
  });
*/
  return Cliente;
};
