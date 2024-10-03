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
  origin: ['https://thepoint.netlify.app'], // Permite solicitudes desde el dominio de tu frontend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite estos encabezados
  credentials: true, // Permitir envío de cookies o autenticación basada en tokens
}));

// Middleware para manejar solicitudes preflight (OPTIONS)
app.options('*', cors());

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
