
import {NerdGraphQuery} from 'nr1'

import nrdbQuery from './nrdb-query'

/**
 * look across all the accounts the user has access to, scoped to the provided
 * event type, and find any accounts that have a match on the provided where clause.
 * Useful for connecting entities/guids etc across account boundaries. 
 * 
 * As an optimization, we only query accounts that have event data of the provided type.
 * Beware that for customers with lots of accounts and a common event type (e.g. Transaction)
 * this could take a while. By default we use a short time window to keep queries light.
 * 
 * Run account queries in parallel (limited by the browser's capacity for parallel requests)
 * and invoke a the for every account that has a match.
 */
export default async function findRelatedAccountWith({eventType, where, timeWindow}, callback) {
  timeWindow = timeWindow || "SINCE 2 minutes ago"

  const gql = `{actor {accounts {name id reportingEventTypes(filter:["${eventType}"])}}}`
  let result = await NerdGraphQuery.query({query: gql}) 

  const accounts = result.data.actor.accounts.filter(a => a.reportingEventTypes.length > 0)
  const nrql = `SELECT count(*) FROM ${eventType} WHERE ${where} ${timeWindow}`
  accounts.forEach(account => {
    return nrdbQuery(account.id, nrql).then(results => {
      if(results[0].count > 0) {
        callback(account)
      }
    })
  })
}
