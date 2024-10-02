import express from 'express';
import cors from 'cors';
import routerPagos from './src/Routes/Pagos/index.js'; 
import routerProductos from './src/Routes/Productos/index.js';
import morgan from 'morgan';
import { dbConnect } from './src/database/config.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS
app.use(cors({
  origin: ['https://thepoint.netlify.app/'], // Actualiza la URL de ngrok si cambia
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true, 
}));

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' https://thepointback-03939a97aeeb.herokuapp.com; script-src 'self'; style-src 'self';"
  );
  next();
});

app.use(morgan('dev'));

// Montar rutas
app.use('/Pagos', routerPagos);
app.use('/Productos', routerProductos);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Conectar a la base de datos
dbConnect()
  .then(() => {
    console.log('Estoy listo y conectado a la base de datos');
  })
  .catch(error => {
    console.error('Error al conectar con la base de datos:', error);
  });
