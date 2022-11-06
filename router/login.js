const { Router } = require('express');
const { check } = require('express-validator');
const { login, googleSignIn } = require('../controller');
const { validar } = require('../middlewares');

const router = Router();

router.post('/',[

    check('correo','El correo no se ha enviado').not().isEmpty(),
    check('correo','El correo no es valido').isEmail(),
    check('pass','El password no se ha enviado').not().isEmpty(),
    check('pass','El password no es valido').isLength({min:5}),
    validar
    
], login);

router.post('/google',[

    check('id_token','El token es necesario').not().isEmpty(),
    validar
    
], googleSignIn);

module.exports = router;
