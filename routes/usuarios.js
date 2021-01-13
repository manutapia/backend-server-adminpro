const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const mdAutenticacion = require('../moddlewares/autenticacion')
const SEED = require('../config/config').SEED;

const app = express();
const Usuario = require('../models/usuario')

app.get('/', (req, res) => {

    Usuario.find({}, 'nombre email img role').exec((err, usuarios) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuario',
                errors: err
            })
        }
        res.status(200).json({
            ok: true,
            usuarios
        });
    })
})

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const body = req.body;
    console.log(body);
    const usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        role: body.role
    });

    usuario.save((err, usuarioActualizado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar usuario',
                errors: err
            })
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioActualizado
        })
    })
})

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    const body = req.body;
    console.log(body);
    const usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            })
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        })
    })
})

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;
    Usuario.findOneAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            })
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'no existe ningun usuario con ese id' }
            })
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        })
    })
})

module.exports = app;