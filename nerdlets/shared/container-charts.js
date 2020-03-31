import React from 'react';
import PropTypes from 'prop-types';
import { PlatformStateContext, LineChart, NrqlQuery, ChartGroup } from 'nr1';
import { timeRangeToNrql } from '@newrelic/nr1-community';

// roll up all of the facet data into a single summarized series.
function summarizeFacets(data) {
  if (!data || data.length === 0) return [];

  const summary = data.shift();
  data.forEach((series) => {
    series.data.forEach((datum, index) => {
      summary.data[index].y += datum.y;
    });
  });

  // console.log("Data", JSON.stringify(summary, 0, 2))
  const { metadata } = summary;
  metadata.name = metadata.groups[0].displayName;

  return [summary];
}

function getNrql({ select, timeRange, containerId }) {
  return `SELECT ${select} FROM ProcessSample 
    WHERE containerId='${containerId}' FACET processId 
    TIMESERIES LIMIT MAX ${timeRange}`;
}

function Chart({ account, containerId, select, timeRange }) {
  const nrql = getNrql({ select, timeRange, containerId });
  return (
    <NrqlQuery accountId={account.id} query={nrql}>
      {({ loading, error, data }) => {
        // eslint-disable-next-line no-console
        if (error) console.log(error);
        if (loading) return <div className="chart" />;

        return <LineChart data={summarizeFacets(data)} className="chart" />;
      }}
    </NrqlQuery>
  );
}
Chart.propTypes = {
  account: PropTypes.object,
  containerId: PropTypes.string,
  select: PropTypes.string,
  timeRange: PropTypes.string,
};

export default function Charts({ containerId, account }) {
  return (
    <PlatformStateContext.Consumer>
      {(platformState) => {
        const { timeRange } = platformState;
        const timeRangeNrql = timeRangeToNrql({ timeRange });

        return (
          <ChartGroup>
            <h4 className="chart-header">CPU</h4>
            <Chart
              containerId={containerId}
              account={account}
              timeRange={timeRangeNrql}
              select={"average(cpuPercent) AS 'CPU'"}
            />
            <h4 className="chart-header">Memory</h4>
            <Chart
              containerId={containerId}
              account={account}
              timeRange={timeRangeNrql}
              select={"average(memoryResidentSizeBytes) AS 'Memory'"}
            />
            <h4 className="chart-header">Disk I/O</h4>
            <Chart
              containerId={containerId}
              account={account}
              timeRange={timeRangeNrql}
              select={
                "average(ioReadBytesPerSecond+ioWriteBytesPerSecond) AS 'Disk I/O'"
              }
            />
          </ChartGroup>
        );
      }}
    </PlatformStateContext.Consumer>
  );
}
Charts.propTypes = {
  account: PropTypes.object,
  containerId: PropTypes.string,
};
