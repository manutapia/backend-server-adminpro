const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const Usuario = require('../models/usuario')

const SEED = require('../config/config').SEED;

const CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
/**
 * Autenticación por Google.
 */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}
app.post('/google', async(req, res) => {

    const token = req.body.token;
    const googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                mensaje: "Token no válido"
            })
        })


    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            })
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe usar su autenticación normal',
                    })
                }
            } else {
                const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: '4h' })

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB._id
                });
            }
        } else {
            // EL usuario no existe... hayque crearlo.
            const usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ":)"

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al guardar usuario',
                    })
                }
                const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: '4h' })

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB._id
                });
            })
        }
    })
})

/**
 * Autenticación normal
 */
app.post('/', (req, res) => {
    const body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            })
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            })
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            })
        }
        usuarioDB.password = ':)'
        const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: '4h' })

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token,
            id: usuarioDB._id
        });
    })

})

module.exports = app;