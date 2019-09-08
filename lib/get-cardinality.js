
import quote from './quote'
import nrdbQuery from './nrdb-query'

/* 
 * return the cardinality (# unique values) for every facet in the given
 * event type, filtered by the given where clause and time window
 */
export default async function getCardinality(props) {
  let {accountId, eventType, where, timeWindow} = props

  eventType = quote(eventType)
  where = where || "true"
  timeWindow = timeWindow || "SINCE 1 hour ago"
  let keySet = await nrdbQuery(accountId, 
      `SELECT keySet() FROM ${eventType} WHERE ${where} ${timeWindow}`)
  keySet = keySet.filter(key => key.type == 'string')

  const batchSize = 50
  const facets = []
  for (var i = 0; i < keySet.length; i += batchSize) {
    const batch = keySet.slice(i, i + batchSize)
    const select = batch.map(key => `uniqueCount(${quote(key.key)}) AS '${key.key}'`)
    const nrql = `SELECT ${select} FROM ${eventType} WHERE ${where} ${timeWindow}`

    const uniqueCounts = (await nrdbQuery(accountId, nrql))[0]
    Object.keys(uniqueCounts).forEach(key => {
      const count = uniqueCounts[key]
      facets.push({ name: key, count })
    })
  }

  return facets  
}