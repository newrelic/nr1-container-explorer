import React from 'react';
import PropTypes from 'prop-types';

import { TableChart } from 'nr1';

export default function ContainerTable(props) {
  const { entity, timeRange, selectContainer } = props;
  const nrql = `SELECT rate(count(*), 1 minute) AS 'RPM', 
    average(duration) AS 'R/T', 
    percentage(count(*), WHERE error IS true) AS 'Err %'
    FROM Transaction WHERE entityGuid = '${entity.guid}' 
    FACET containerId LIMIT MAX ${timeRange}`.replace(/\n /g, ' ');

  // only provide a click handler on the table after we have been
  // provided a callback (this happens lazily as it can take a while
  // to find the infrastructure account which is required for a drillDown)
  const onClickTable =
    selectContainer &&
    function (ignored, row) {
      selectContainer(row.containerId);
    };

  return (
    <TableChart
      accountId={entity.accountId}
      query={nrql}
      onClickTable={onClickTable}
    />
  );
}
ContainerTable.propTypes = {
  entity: PropTypes.object,
  timeRange: PropTypes.string,
  selectContainer: PropTypes.func,
};
