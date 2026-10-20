// Commande d'exploitation : rôle administrateur provisoire (autorisation de gouvernance jusqu'à TH-104).
// Aucune interface ne l'attribue ; chaque changement est inscrit au journal d'audit. La cible se désigne de
// préférence par son identifiant numérique GitHub (https://api.github.com/users/<login>, champ id).
//   docker compose exec api node apps/api/dist/cli/admin.js grant --github-id <id>
//   … grant <login-github>   (refusé si plusieurs comptes portent ce login)
//   … revoke --github-id <id> | revoke <login-github>   … list
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { translate } from '@tokenhood/i18n';
import { connect } from '@tokenhood/db';
import { isDomainError, systemClock } from '@tokenhood/core/common';
import { listAdmins, setAdmin, type AdminTarget } from '@tokenhood/core/identity';

export const USAGE = 'Usage : admin.js grant|revoke --github-id <id> | grant|revoke <login-github> | list';

function targetOf(args: string[]): AdminTarget | null {
  if (args[0] === '--github-id') return args[1] && /^[0-9]+$/.test(args[1]) ? { githubId: args[1] } : null;
  return args[0] && !args[0].startsWith('-') ? { githubLogin: args[0] } : null;
}

export async function run(
  args: string[],
  env: NodeJS.ProcessEnv,
  out: (line: string) => void,
): Promise<number> {
  const [command, ...rest] = args;
  const target = targetOf(rest);
  if (!command || !['grant', 'revoke', 'list'].includes(command) || (command !== 'list' && !target)) {
    out(USAGE);
    return 2;
  }
  if (!env.DATABASE_URL) {
    out('DATABASE_URL est requise.');
    return 2;
  }
  const { db, close } = connect(env.DATABASE_URL, { max: 1 });
  try {
    if (command === 'list') {
      for (const admin of await listAdmins({ db }))
        out(`${admin.login ?? '?'}\t${admin.githubId ?? '?'}\t${admin.userId}`);
      return 0;
    }
    const granted = command === 'grant';
    const { userId, changed } = await setAdmin({ db, clock: systemClock }, target!, granted);
    const label = 'githubId' in target! ? `GitHub ${target.githubId}` : target!.githubLogin;
    out(
      changed
        ? `${label} (${userId}) : rôle administrateur ${granted ? 'attribué' : 'retiré'}.`
        : `${label} (${userId}) : aucun changement.`,
    );
    return 0;
  } catch (error) {
    if (isDomainError(error)) {
      out(`Erreur ${error.code} : ${translate('fr', error.key, error.values)}`);
      return 1;
    }
    throw error;
  } finally {
    await close();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  process.exitCode = await run(process.argv.slice(2), process.env, (line) => console.log(line));
}
