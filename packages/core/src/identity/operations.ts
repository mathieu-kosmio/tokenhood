// Opérations du module identity. Toutes sont ouvertes pendant le parcours d'inscription et fermées aux agents :
// un acteur agent ne modifie jamais un profil, n'accepte aucun document et ne ferme aucune session.
import { operation } from '../common/actor.js';

export const identityOperations = {
  readProfile: operation('identity.profile.read', { humans: 'registering' }),
  updateProfile: operation('identity.profile.update', { humans: 'registering' }),
  acceptDocument: operation('identity.document.accept', { humans: 'registering' }),
  listAcceptances: operation('identity.document.list', { humans: 'registering' }),
  signOut: operation('identity.session.revoke', { humans: 'registering' }),
};
