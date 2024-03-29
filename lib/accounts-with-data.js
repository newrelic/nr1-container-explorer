import { NerdGraphQuery } from 'nr1';

/**
 * For building account pickers, etc. Get the list of all visible accounts that have
 * data for the given event type. For example, if you send `SystemSample` you'll get
 * a list of all accounts with Infrastructure installed.  Clean up those account menus!
 */
export default async function accountsWithData(eventType) {
  const gql = `{actor {accounts {name id reportingEventTypes(filter:["${eventType}"])}}}`;
  const result = await NerdGraphQuery.query({ query: gql });

  if (result.error) {
    // eslint-disable-next-line no-console
    console.warn(
      "Can't get reporting event types because NRDB is grumpy at NerdGraph.",
      result.error
    );
    // eslint-disable-next-line no-console
    console.warn(
      JSON.stringify(result.error?.graphQLErrors.slice(0, 5), null, 2)
    );

    /**
     * Filter out errors tied to the lack of reportingEventTypes since we filter
     * the results below on the presence of reportingEventTypes
     */
    const filteredErrors =
      result.error?.graphQLErrors.filter(
        (e) => e.message === 'Failed to retrieve event types'
      ) ?? [];

    if (filteredErrors.length > 1) {
      return [];
    }
  }

  return result.data.actor.accounts.filter(
    (a) => a.reportingEventTypes.length > 0
  );
}
