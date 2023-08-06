import React from 'react';
import PropTypes from 'prop-types';
import { NerdGraphQuery } from 'nr1';

import LinkedEntity from './linked-entity';

export default function RelatedApps({ apmApplicationNames }) {
  if (!apmApplicationNames || apmApplicationNames.length < 2) return <div />;

  const split = apmApplicationNames.split('|');
  const appNames = split.slice(1, split.length - 1);
  const search = appNames.map((n) => `name = '${n}'`).join(' OR ');
  const gql = `{
    actor {
      entitySearch(query: "domain = 'APM' AND (${search})") {
        results {
          entities {
            name guid domain type
            ... on ApmApplicationEntityOutline {
              alertSeverity reporting
            }
          }
        }
      }
    }
  }`;

  return (
    <NerdGraphQuery query={gql}>
      {({ loading, data }) => {
        if (loading) return <div />;
        const { entities } = data.actor.entitySearch.results;
        return entities.map((entity) => {
          return (
            <LinkedEntity
              key={entity.guid}
              title="App"
              entity={entity}
              name={entity.name}
            />
          );
        });
      }}
    </NerdGraphQuery>
  );
}

RelatedApps.propTypes = {
  apmApplicationNames: PropTypes.array,
};
