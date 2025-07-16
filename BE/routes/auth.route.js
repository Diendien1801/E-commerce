const express = require('express');
const { register, verifyEmail, loginWithEmail, requestPasswordReset, resetPassword } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/register', register);
router.get('/verify', verifyEmail);
router.post('/login', loginWithEmail);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;