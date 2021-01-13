// Requires
let express = require("express");
let bodyParser = require('body-parser')
let mongoose = require("mongoose");

// Inicializar variables
let app = express();
let appRoutes = require('./routes/app');
let usuarioRoutes = require('./routes/usuarios');
let loginRoutes = require('./routes/login')

// Conexión a la base de datos
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true // OJO a producción (ver doc)
};
mongoose.connect('mongodb://localhost:27017/hospitalDB', options, (err, res) => {
    if (err) throw err;
    console.log('Base de datos:  \x1b[32m%s\x1b[0m', 'online');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rutas
app.use('/usuarios', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Escuchar peticiones.
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});