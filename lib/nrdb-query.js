import {NerdGraphQuery} from 'nr1'

export default async function nrdbQuery(accountId, nrql) {
  nrql = nrql.replace(/\n/g, " ")
  const gql = `{
    actor {
      account(id: ${accountId}) {
        nrql(query: "${nrql}") {
          results
        }
      }
    }
  }`

  try {
    const {data, error} = await NerdGraphQuery.query({query: gql})
    if(error) {
      throw "Bad NRQL Query: " + nrql + ": " + errror
    }
    return data.actor.account.nrql.results
  }
  catch(e) {
    console.log("NRDB Query Error", nrql,e)
    throw e
  }
}