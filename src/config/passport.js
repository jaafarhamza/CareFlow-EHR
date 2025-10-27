import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import crypto from 'crypto';
import config from './index.js';
import userRepo from '../repositories/user.repository.js';
import User from '../models/user.model.js';
import logger from './logger.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const firstName = profile.name.givenName;
        const lastName = profile.name.familyName;

        let user = await userRepo.findOne({ email });

        if (!user) {
          const passwordHash = await User.hashPassword(
            crypto.randomBytes(32).toString('hex')
          );
          user = await userRepo.create({
            email,
            firstName,
            lastName,
            passwordHash,
            role: 'patient',
          });
          logger.info(`New user created via Google OAuth: ${email}`);
        } else {
          logger.info(`Existing user logged in via Google OAuth: ${email}`);
        }

        return done(null, user);
      } catch (error) {
        logger.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

export default passport;
