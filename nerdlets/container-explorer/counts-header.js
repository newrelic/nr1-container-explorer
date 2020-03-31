import React from 'react';
import PropTypes from 'prop-types';
import { Grid, GridItem } from 'nr1';

function Count({ title, count }) {
  return (
    <GridItem columnSpan={4} className="count">
      <h1>
        {count} {title}
      </h1>
    </GridItem>
  );
}
Count.propTypes = {
  title: PropTypes.string,
  count: PropTypes.number,
};
export default function CountsHeader({ containers, hosts, processes }) {
  return (
    <Grid className="counts-header">
      <Count title="Hosts" count={hosts} />
      <Count title="Containers" count={containers} />
      <Count title="Processes" count={processes} />
    </Grid>
  );
}
CountsHeader.propTypes = {
  containers: PropTypes.array,
  hosts: PropTypes.array,
  processes: PropTypes.array,
};
