import React from 'react';
import { LineChart, NrqlQuery, ChartGroup } from 'nr1';

// roll up all of the facet data into a single summarized series.
function summarizeFacets(data) {
  if (!data || data.length == 0) return [];

  let summary = data.shift();
  data.forEach(series => {
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
        if (error) console.log(error);
        if (loading) return <div className="chart" />;

        return <LineChart data={summarizeFacets(data)} className="chart" />;
      }}
    </NrqlQuery>
  );
}

export default function Charts({ containerId, account, timeRange }) {
  return (
    <ChartGroup>
      <h4 className="chart-header">CPU</h4>
      <Chart
        containerId={containerId}
        account={account}
        timeRange={timeRange}
        select={"average(cpuPercent) AS 'CPU'"}
      />
      <h4 className="chart-header">Memory</h4>
      <Chart
        containerId={containerId}
        account={account}
        timeRange={timeRange}
        select={"average(memoryResidentSizeBytes) AS 'Memory'"}
      />
      <h4 className="chart-header">Disk I/O</h4>
      <Chart
        containerId={containerId}
        account={account}
        timeRange={timeRange}
        select={
          "average(ioReadBytesPerSecond+ioWriteBytesPerSecond) AS 'Disk I/O'"
        }
      />
    </ChartGroup>
  );
}
