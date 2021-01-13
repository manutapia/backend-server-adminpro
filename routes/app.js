// Rutas
const express = require('express');
let app = express();

app.get('/', (req, res) => {
    res.status(403).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
})

module.exports = app;