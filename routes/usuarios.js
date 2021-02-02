const express = require('express');
const bcrypt = require('bcrypt');

const mdAutenticacion = require('../middlewares/autenticacion');

const app = express();
const Usuario = require('../models/usuario')

app.get('/', (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde)
    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuario',
                    errors: err
                })
            }
            Usuario.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    usuarios,
                    total: conteo
                });
            })

        })
})

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            })
        };
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con el id: ' + id,
                errors: { message: 'no existe ningun usuario con ese id' }
            })
        };

        usuarioDB.nombre = body.nombre;
        usuarioDB.email = body.email;
        usuarioDB.role = body.role;

        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                })
            };

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            })
        })
    })
})

// mdAutenticacion.verificaToken
app.post('/', (req, res) => {
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