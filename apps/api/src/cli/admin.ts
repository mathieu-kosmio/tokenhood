// Commande d'exploitation : rôle administrateur provisoire (autorisation de gouvernance jusqu'à TH-104).
// Aucune interface ne l'attribue ; chaque changement est inscrit au journal d'audit.
//   docker compose exec api node apps/api/dist/cli/admin.js grant <login-github>
//   … revoke <login-github>   … list
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect } from '@tokenhood/db';
import { isDomainError, systemClock } from '@tokenhood/core/common';
import { listAdmins, setAdmin } from '@tokenhood/core/identity';

export const USAGE = 'Usage : admin.js grant <login-github> | revoke <login-github> | list';

export async function run(
  args: string[],
  env: NodeJS.ProcessEnv,
  out: (line: string) => void,
): Promise<number> {
  const [command, login] = args;
  if (!command || !['grant', 'revoke', 'list'].includes(command) || (command !== 'list' && !login)) {
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
      for (const admin of await listAdmins({ db })) out(`${admin.login ?? '?'}\t${admin.userId}`);
      return 0;
    }
    const granted = command === 'grant';
    const { userId, changed } = await setAdmin({ db, clock: systemClock }, { githubLogin: login! }, granted);
    out(
      changed
        ? `${login} (${userId}) : rôle administrateur ${granted ? 'attribué' : 'retiré'}.`
        : `${login} (${userId}) : aucun changement.`,
    );
    return 0;
  } catch (error) {
    if (isDomainError(error)) {
      out(`Erreur : ${error.code} (${login}).`);
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
