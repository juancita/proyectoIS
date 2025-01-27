module.exports = (sequelize, DataTypes) => {
    const Orden = sequelize.define('Orden', {
      id_pedido: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    });
  
    /* Relación con Pedido y Producto
    Orden.belongsTo(sequelize.models.Pedido, {
      foreignKey: 'id_pedido',
      as: 'pedido'
    });
  
    Orden.belongsTo(sequelize.models.Producto, {
      foreignKey: 'id_producto',
      as: 'producto'
    });
  */
    return Orden;
  };
  