import React from 'react';
import PropTypes from 'prop-types';
import quote from '../../lib/quote';

import { TableChart } from 'nr1';

export default function FacetTable(props) {
  const { account, group, setFacetValue, where } = props;
  const whereClause = where ? `WHERE ${where}` : '';
  const nrql = `SELECT uniqueCount(containerId) as 'Containers', 
    uniqueCount(entityGuid) as 'Hosts'  
    FROM ProcessSample ${whereClause} FACET ${quote(group)} 
    LIMIT 2000 SINCE 30 seconds ago`.replace(/\n/g, '');

  const onClickTable =
    setFacetValue &&
    function (ignored, row) {
      setFacetValue(row[group]);
    };

  return (
    <div className="facet-table">
      <p>{group}</p>
      <TableChart
        fullWidth
        fullHeight
        accountId={account.id}
        query={nrql}
        onClickTable={onClickTable}
      />
    </div>
  );
}
FacetTable.propTypes = {
  account: PropTypes.object,
  group: PropTypes.string,
  setFacetValue: PropTypes.func,
  where: PropTypes.string,
};
