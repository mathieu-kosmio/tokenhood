// Acteurs et autorisations de la couche métier. Toute opération est déclarée par son module ; par défaut,
// elle est réservée aux humains dont l'inscription est complète et refusée à tout acteur agent.
import { DomainError } from './errors.js';

export interface HumanActor {
  kind: 'human';
  userId: string;
  // Rôle administrateur provisoire (gouvernance jusqu'à TH-104), attribué par commande d'exploitation.
  admin: boolean;
  // Inscription complète : profil renseigné et documents acceptés dans leur version courante.
  registered: boolean;
  sessionId: string | null;
}

// Agent agissant pour un utilisateur, par une autorisation (jetons d'agent : TH-109).
export interface AgentActor {
  kind: 'agent';
  agentId: string;
  authorizationId: string;
  userId: string;
}

export type Actor = HumanActor | AgentActor;

// registering : ouvert pendant le parcours d'inscription ; registered : inscription complète ; admin : rôle
// administrateur provisoire, inscription complète.
export type HumanAccess = 'registering' | 'registered' | 'admin';

export interface Operation<Agents extends boolean = boolean> {
  readonly id: string;
  readonly humans: HumanAccess;
  readonly agents: Agents;
}

export function operation(id: string, access?: { humans?: HumanAccess }): Operation<false>;
export function operation(id: string, access: { humans?: HumanAccess; agents: 'allowed' }): Operation<true>;
export function operation(id: string, access: { humans?: HumanAccess; agents?: 'allowed' } = {}): Operation {
  const humans = access.humans ?? 'registered';
  const agents = access.agents === 'allowed';
  if (agents && humans === 'admin')
    throw new Error(`${id} : une opération d'administration ne s'ouvre jamais aux agents.`);
  return { id, humans, agents };
}

export function authorize(actor: Actor | null | undefined, op: Operation<false>): HumanActor;
export function authorize(actor: Actor | null | undefined, op: Operation): Actor;
export function authorize(actor: Actor | null | undefined, op: Operation): Actor {
  if (!actor) throw new DomainError('unauthenticated', 401, 'errors.unauthenticated');
  if (actor.kind === 'agent') {
    if (!op.agents)
      throw new DomainError('agent_forbidden', 403, 'errors.agentForbidden', { operation: op.id });
    return actor;
  }
  if (op.humans === 'registering') return actor;
  if (!actor.registered)
    throw new DomainError('registration_incomplete', 403, 'errors.registrationIncomplete');
  if (op.humans === 'admin' && !actor.admin)
    throw new DomainError('admin_required', 403, 'errors.adminRequired');
  return actor;
}

// Ce que le journal d'audit retient de l'auteur d'un événement.
export function auditActor(actor: Actor | 'system'): {
  kind: 'human' | 'agent' | 'system';
  id: string | null;
} {
  if (actor === 'system') return { kind: 'system', id: null };
  return actor.kind === 'agent' ? { kind: 'agent', id: actor.agentId } : { kind: 'human', id: actor.userId };
}
