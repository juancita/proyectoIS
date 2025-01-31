const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); // Middleware para manejar datos del cuerpo de solicitudes POST
const sequelize = require('./db'); // Conexión a la base de datos
const Pedido = require('./models/Pedido'); // Modelo Pedido
const Cliente = require('./models/Cliente'); // Modelo Cliente
const Producto = require('./models/producto'); // Modelo Producto
const enviarNotificacion = require('./notificaciones');

const app = express();

// Configuración del motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos
app.use(bodyParser.urlencoded({ extended: true })); // Manejo de formularios
app.use(bodyParser.json()); // Manejo de JSON en solicitudes

// Sincronización de la base de datos sin alterar las tablas existentes
sequelize
  .sync({ force: false })  // Sincroniza sin alterar las tablas
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente');
  })
  .catch((err) => {
    console.error('Error al sincronizar la base de datos:', err);
  });

// Ruta principal
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Inicio',
    heading: '¡Bienvenido!',
    message: 'Gestor de pedidos para productos de maíz.',
  });
});

// Consultar pedidos y cargar datos de clientes y productos
app.get('/pedidos', async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
      ],
    });
    const clientes = await Cliente.findAll();
    const productos = await Producto.findAll();

    res.render('pedidos', { pedidos, clientes, productos });
  } catch (err) {
    console.error('Error al consultar pedidos:', err);
    res.status(500).send('Error al consultar pedidos');
  }
});


// Registrar pedido
app.post('/pedidos', async (req, res) => {
  try {
    const { cliente, producto, cantidad, total } = req.body;

    // Verificar si el producto tiene suficiente stock
    const prod = await Producto.findByPk(producto);
    if (!prod || prod.cantidad < cantidad) {
      return res.status(400).send('Stock insuficiente para este producto.');
    }

    // Registrar el pedido y obtener el objeto pedido
    const pedido = await Pedido.create({ 
      cel_clien: cliente, 
      id_producto: producto, 
      estado: 'Pendiente', 
      cantidad: cantidad, 
      total: total 
    });

       // Obtener el pedido con los detalles del cliente y producto
       const pedidoConDetalles = await Pedido.findByPk(pedido.cel_clien, {
        include: [
          {
            model: Producto,
            as: 'producto',
            attributes: ['nombre']  // Solo incluir el nombre del producto
          },
          {
            model: Cliente,
            as: 'cliente',
            attributes: ['nombre']  // Incluir el nombre del cliente
          }
        ]
      });
  
      // Enviar notificación con los detalles del pedido
      await enviarNotificacion(`Nuevo pedido realizado:\nCliente: ${pedidoConDetalles.cliente.nombre}\nCelular: ${pedido.cel_clien}\nProducto: ${pedidoConDetalles.producto.nombre}\nCantidad: $${pedidoConDetalles.cantidad}\nPrecio: $${pedidoConDetalles.total}`);
  
    // Devolver respuesta al cliente
    res.status(201).json({ mensaje: 'Pedido creado y notificado', pedido });

    //actualizar el inventario,
    await Producto.update(
      { cantidad: prod.cantidad - cantidad },
      { where: { id: producto } }
    );
    

  } catch (err) {
    console.error('Error al registrar el pedido:', err);
    res.status(500).send('Error al registrar el pedido');
  }
});


app.get('/pedidos/editar/:cel_clien/:id_producto', async (req, res) => {
  try {
    const { cel_clien, id_producto } = req.params;
    const pedido = await Pedido.findOne({
      where: { cel_clien, id_producto },
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
      ],
    });

    const productos = await Producto.findAll(); // Listar productos disponibles
    const clientes = await Cliente.findAll(); // Listar clientes disponibles

    // Consultar solo los pedidos pendientes
    const pedidosPendientes = await Pedido.findAll({
      where: { estado: 'Pendiente' },
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
      ],
    });

    if (!pedido) {
      return res.status(404).send('Pedido no encontrado');
    }

    res.render('editarPedido', { pedido, clientes, productos, pedidosPendientes });
  } catch (err) {
    console.error('Error al cargar pedido para editar:', err);
    res.status(500).send('Error al cargar pedido para editar');
  }
});

// Ruta para guardar los cambios de un pedido
app.post('/pedidos/editar/:cel_clien/:id_producto', async (req, res) => {
  try {
    const { cel_clien, id_producto } = req.params;
    const { cantidad, estado } = req.body;

    // Buscar el pedido
    const pedido = await Pedido.findOne({ where: { cel_clien, id_producto } });

    if (!pedido) {
      return res.status(404).send('Pedido no encontrado');
    }

    // Actualizar el pedido
    await pedido.update({ cantidad, estado });

    // Actualizar la cantidad en el inventario
    const producto = await Producto.findByPk(id_producto);
    if (producto) {
      producto.cantidad -= cantidad;
      await producto.save();
    }

    res.redirect('/pedidos');
  } catch (err) {
    console.error('Error al editar el pedido:', err);
    res.status(500).send('Error al editar el pedido');
  }
});
// Ruta para eliminar un pedido
app.post('/pedidos/eliminar/:cel_clien/:id_producto', async (req, res) => {
  try {
    const { cel_clien, id_producto } = req.params;
    
    // Buscar el pedido
    const pedido = await Pedido.findOne({ where: { cel_clien, id_producto } });

    if (!pedido) {
      return res.status(404).send('Pedido no encontrado');
    }

    // Eliminar el pedido
    await pedido.destroy();

    // Restaurar la cantidad en el inventario
    const producto = await Producto.findByPk(id_producto);
    if (producto) {
      producto.cantidad += pedido.cantidad;
      await producto.save();
    }
    // Obtener el pedido con los detalles del cliente y producto
    const pedidoConDetalles = await Pedido.findByPk(pedido.cel_clien, {
      include: [
        {
          model: Producto,
          as: 'producto',
          attributes: ['nombre']  // Solo incluir el nombre del producto
        },
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['nombre']  // Incluir el nombre del cliente
        }
      ]
    });

    // Enviar notificación con los detalles del pedido
    await enviarNotificacion(`PEDIDO CANCELADO :\nCliente: ${pedidoConDetalles.cliente.nombre}\nCelular: ${pedido.cel_clien}\nProducto: ${pedidoConDetalles.producto.nombre}\nCantidad: $${pedidoConDetalles.cantidad}\nPrecio: $${pedidoConDetalles.total}`);

  // Devolver respuesta al cliente

res.redirect('/pedidos');
  } catch (err) {
    console.error('Error al eliminar el pedido:', err);
    res.status(500).send('Error al eliminar el pedido');
  }
});

//APARTADO DE INVENTARIOS:

// Redirigir /inventario a /productos
app.get('/inventario', (req, res) => {
  res.redirect('/productos');
});


// 📌 Obtener la lista de productos con stock
app.get('/productos', async (req, res) => {
  try {
    const productos = await Producto.findAll();
    res.render('productos', { productos });
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).send('Error al obtener productos');
  }
});

// 📌 Agregar un nuevo producto
app.post('/productos/agregar', async (req, res) => {
  try {
    const { nombre, cantidad, valor_uni } = req.body;
    
    // Crear producto en la base de datos
    const producto = await Producto.create({ nombre, cantidad, valor_uni });

    // Enviar notificación
    await enviarNotificacion(`Nuevo producto agregado: ${producto.nombre}\nStock: ${producto.cantidad}\nPrecio: $${producto.valor_uni}`);

    // Redirigir o enviar JSON, pero no ambas cosas
    res.redirect('/productos'); // O usa res.json() pero no ambas
  } catch (err) {
    console.error('Error al agregar producto:', err);
    res.status(500).send('Error al agregar producto');
  }
});


// Editar la cantidad de un producto
app.post('/productos/editar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    // Primero, obtenemos el producto de la base de datos
    const producto = await Producto.findOne({ where: { id } });

    // Si el producto no se encuentra, se retorna un error
    if (!producto) {
      return res.status(404).send('Producto no encontrado');
    }

    const cantidadAnterior = producto.cantidad;

    // Actualizamos la cantidad del producto
    await Producto.update({ cantidad }, { where: { id } });

    // Enviar notificación
    await enviarNotificacion(`Inventario actualizado: ${producto.nombre}\nAntes: ${cantidadAnterior} | Ahora: ${cantidad}`);

    // Redirigir al usuario a la lista de productos
    res.redirect('/productos');
  } catch (err) {
    console.error('Error al actualizar inventario:', err);
    res.status(500).send('Error al actualizar inventario');
  }
});



//  Eliminar un producto del inventario
app.post('/productos/eliminar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findOne({ where: { id } });
    await Producto.destroy({ where: { id } });
    await enviarNotificacion(`PRODUCTO ELIMINADO: ${producto.nombre}`);

    res.redirect('/productos');
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).send('Error al eliminar producto');
  }
});




// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
