const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sequelize = require('./db'); // Conexión a la base de datos
const Pedido = require('./models/Pedido'); // Modelo de Pedido
const Cliente = require('./models/Cliente'); // Modelo de Cliente
const Producto = require('./models/producto'); // Modelo de Producto

const app = express();

// Configuración de EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sincronización con la base de datos
sequelize.sync({ force: false })
  .then(() => console.log('Conexión a la base de datos establecida correctamente'))
  .catch(err => console.error('Error al sincronizar la base de datos:', err));

// Ruta principal
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Inicio',
    heading: '¡Bienvenido!',
    message: 'Gestor de pedidos para productos de maíz.',
  });
});

// Ruta para mostrar los pedidos
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

// Ruta para registrar un nuevo pedido
app.post('/pedidos', async (req, res) => {
  const { cliente, producto, cantidad } = req.body;

  try {
    const productoEncontrado = await Producto.findByPk(producto);

    if (!productoEncontrado || cantidad > productoEncontrado.cantidad) {
      return res.status(400).send('Cantidad inválida o producto no disponible');
    }

    await Pedido.create({
      cel_cliente: cliente,
      id_producto: producto,
      cantidad,
      estado: 'Pendiente',
    });

    // Reducir la cantidad disponible del producto
    productoEncontrado.cantidad -= cantidad;
    await productoEncontrado.save();

    res.redirect('/pedidos');
  } catch (err) {
    console.error('Error al registrar pedido:', err);
    res.status(500).send('Error al registrar pedido');
  }
});

// Ruta para mostrar el formulario de edición de un pedido
app.get('/pedidos/editar/:cel_cliente/:id_producto', async (req, res) => {
  const { cel_cliente, id_producto } = req.params;

  try {
    const pedido = await Pedido.findOne({
      where: { cel_cliente, id_producto },
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
      ],
    });

    const clientes = await Cliente.findAll();
    const productos = await Producto.findAll();

    if (!pedido) {
      return res.status(404).send('Pedido no encontrado');
    }

    res.render('editarPedido', { pedido, clientes, productos });
  } catch (err) {
    console.error('Error al cargar el formulario de edición:', err);
    res.status(500).send('Error al cargar el formulario de edición');
  }
});

// Ruta para procesar la edición de un pedido
app.post('/pedidos/editar/:cel_cliente/:id_producto', async (req, res) => {
  const { cel_cliente, id_producto } = req.params;
  const { cliente, producto, cantidad, estado } = req.body;

  try {
    const pedido = await Pedido.findOne({
      where: { cel_cliente, id_producto },
    });

    if (!pedido) {
      return res.status(404).send('Pedido no encontrado');
    }

    const productoEncontrado = await Producto.findByPk(producto);
    if (!productoEncontrado || cantidad > productoEncontrado.cantidad) {
      return res.status(400).send('Cantidad inválida o producto no disponible');
    }

    // Actualizar la cantidad disponible del producto anterior
    const productoAnterior = await Producto.findByPk(pedido.id_producto);
    productoAnterior.cantidad += pedido.cantidad;
    await productoAnterior.save();

    // Actualizar el pedido
    pedido.cel_cliente = cliente;
    pedido.id_producto = producto;
    pedido.cantidad = cantidad;
    pedido.estado = estado;

    await pedido.save();

    // Reducir la cantidad disponible del nuevo producto
    productoEncontrado.cantidad -= cantidad;
    await productoEncontrado.save();

    res.redirect('/pedidos');
  } catch (err) {
    console.error('Error al editar pedido:', err);
    res.status(500).send('Error al editar pedido');
  }
});

// Ruta para eliminar un pedido
app.post('/pedidos/eliminar/:cel_cliente/:id_producto', async (req, res) => {
  const { cel_cliente, id_producto } = req.params;

  try {
    const pedido = await Pedido.findOne({
      where: { cel_cliente, id_producto },
    });

    if (!pedido) {
      return res.status(404).send('Pedido no encontrado');
    }

    // Devolver la cantidad al inventario del producto
    const producto = await Producto.findByPk(pedido.id_producto);
    producto.cantidad += pedido.cantidad;
    await producto.save();

    await pedido.destroy();

    res.redirect('/pedidos');
  } catch (err) {
    console.error('Error al eliminar pedido:', err);
    res.status(500).send('Error al eliminar pedido');
  }
});

// Puerto en el que se ejecutará la aplicación
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
