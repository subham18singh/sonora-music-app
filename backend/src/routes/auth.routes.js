const express = require('express');
const authController = require('../controllers/auth.controller')
const validate = require('../middlewares/validate.middleware')
const { registerValidator, loginValidator } = require('../validators/auth.validator')

const router = express.Router()

router.post('/register',registerValidator , validate , authController.registerUser)

router.post('/login',loginValidator , validate , authController.loginUser)

router.post('/logout' , authController.logoutUser)

module.exports = router