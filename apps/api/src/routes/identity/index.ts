// Module identity de l'API : /v1/auth (connexion GitHub, déconnexion) et /v1/users/me (profil, documents).
import type { FastifyPluginAsync } from 'fastify';
import auth from './auth.js';
import me from './me.js';

const identity: FastifyPluginAsync = async (app) => {
  await app.register(auth);
  await app.register(me);
};

export default identity;
