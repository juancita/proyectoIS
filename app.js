const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); // Middleware para manejar datos del cuerpo de solicitudes POST
const sequelize = require('./db'); // Conexión a la base de datos
const Pedido = require('./models/Pedido'); // Modelo Pedido
const Cliente = require('./models/Cliente'); // Modelo Cliente
const Producto = require('./models/producto'); // Modelo Producto

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

    // Registrar el pedido
    await Pedido.create({ cel_clien: cliente, id_producto: producto, estado: 'Pendiente', cantidad: cantidad, total: total });

    /* Actualizar la cantidad disponible en el inventario
    await Producto.update(
      { cantidad: prod.cantidad - cantidad },
      { where: { id: producto } }
    );
    
    */

    res.redirect('/pedidos');
  } catch (err) {
    console.error('Error al registrar el pedido:', err);
    res.status(500).send('Error al registrar el pedido');
  }
});

// Ruta para editar un pedido
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

    if (!pedido) {
      return res.status(404).send('Pedido no encontrado');
    }

    res.render('editarPedido', { pedido, clientes, productos });
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
    await Producto.create({ nombre, cantidad, valor_uni });
    res.redirect('/productos');
  } catch (err) {
    console.error('Error al agregar producto:', err);
    res.status(500).send('Error al agregar producto');
  }
});

// 📌 Editar la cantidad de un producto
app.post('/productos/editar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;
    await Producto.update({ cantidad }, { where: { id } });
    res.redirect('/productos');
  } catch (err) {
    console.error('Error al actualizar inventario:', err);
    res.status(500).send('Error al actualizar inventario');
  }
});

// 📌 Eliminar un producto del inventario
app.post('/productos/eliminar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Producto.destroy({ where: { id } });
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
