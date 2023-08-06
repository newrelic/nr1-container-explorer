import React from 'react';
import PropTypes from 'prop-types';
import { BlockText } from 'nr1';

export default function NoInfrastructureData({ entity }) {
  return (
    <div style={{ marginLeft: '12px', marginTop: '12px' }}>
      <h2>No Container Data</h2>
      <BlockText type="paragraph">
        We couldn't find any containerized data correlated with{' '}
        <strong>{entity.name}</strong>. This could be because this service is
        not running inside a container, or possibly you do not have visibility
        into a separate New Relic account that has the related infrastructure
        data.
      </BlockText>
    </div>
  );
}
NoInfrastructureData.propTypes = {
  entity: PropTypes.object,
};
