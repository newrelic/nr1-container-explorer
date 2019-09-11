import {NerdGraphQuery} from 'nr1'


/**
 * For building account pickers, etc. Get the list of all visible accounts that have
 * data for the given event type. For examlpe, if you send `SystemSample` you'll get
 * a list of all accounts with Infratructure installed.  Clean up those account menus!
 */
export default async function accountsWithData(eventType) {
  const gql = `{actor {accounts {name id reportingEventTypes(filter:["${eventType}"])}}}`
  let result = await NerdGraphQuery.query({query: gql}) 
  if(result.errors) {
    console.log("NRDB is unhappy", result.errors)
    console.log(JSON.stringify(result, 0, 2))
    return []
  }

  return result.data.actor.accounts.filter(a => a.reportingEventTypes.length > 0)
}