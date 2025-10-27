import { Router } from 'express';
import passport from '../config/passport.js';
import googleAuthController from '../controllers/googleAuth.controller.js';

const router = Router();

router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/api/auth/google/failure'
  }),
  googleAuthController.googleCallback
);

router.get('/google/failure', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Google authentication failed',
  });
});

export default router;
