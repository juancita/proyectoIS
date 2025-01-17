const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Configuración del motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/miapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión:'));
db.once('open', () => {
  console.log('Conectado a la base de datos');
});

// Definir esquema y modelo de usuario
const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
  nombre: String,
  email: String,
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Rutas
// Ruta principal
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Inicio',
    heading: '¡Bienvenido!',
    message: 'Esta es una página dinámica renderizada con EJS.',
  });
});

// Ruta "Acerca de nosotros"
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Ruta "Contacto"
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

// Ruta para mostrar usuarios desde la base de datos
app.get('/users', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.render('users', { usuarios });
  } catch (error) {
    res.status(500).send('Error obteniendo usuarios');
  }
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
