import { NerdGraphQuery } from 'nr1';

export default async function nrdbQuery(accountIds, nrql) {
  if (!nrql) {
    // eslint-disable-next-line no-console
    console.warn('You probably forgot to provide an accountIds', accountIds);
    throw nrql;
  }

  nrql = nrql.replace(/\n/g, ' ');
  const gql = `{
    actor {
      account(id: ${accountIds}) {
        nrql(query: "${nrql}") {
          results
        }
      }
    }
  }`;

  try {
    const { data, error } = await NerdGraphQuery.query({ query: gql });
    if (error || !data.actor.account.nrql) {
      throw new Error(`Bad NRQL Query: ${nrql}: ${error}`);
    }

    return data.actor.account.nrql.results;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('NRDB Query Error', nrql, e);
    throw e;
  }
}
