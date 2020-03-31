import React from 'react';
import PropTypes from 'prop-types';
import HeatMap from '../../components/heat-map';

import bytesToSize from '../../lib/bytes-to-size';
import getProcessSamplePeriod from '../shared/get-process-sample-period';

const HEAT_MAPS = [
  {
    title: 'Response Time (ms)',
    eventType: 'Transaction',
    select: 'average(duration)*1000',
    max: Math.round,
    formatValue: (value) => `${Math.round(value)}ms`,
  },
  {
    title: 'Throughput',
    eventType: 'Transaction',
    select: 'rate(count(*), 1 minute)',
    max: Math.ceil,
    formatValue: (value) => `${Math.round(value)} rpm`,
  },
  /* note for infra data, we are assuming 1 event per process per 15 seconds.
   * since we are running a 1 minute query, divide the values by 4 for accuracy.*/
  {
    title: 'CPU',
    eventType: 'ProcessSample',
    select: 'sum(cpuPercent)/4',
    max: (max) => Math.ceil(max / 100) * 100,
    formatValue: (value) => `${Math.round(value)}%`,
  },
  {
    title: 'Memory',
    eventType: 'ProcessSample',
    select: 'sum(memoryResidentSizeBytes)/4',
    max: Math.round,
    formatValue: bytesToSize,
  },
  {
    title: 'I/O',
    eventType: 'ProcessSample',
    select: 'sum(ioReadBytesPerSecond+ioWriteBytesPerSecond)/4',
    max: (value) => Math.round(Math.max(value, 1024)),
    formatValue: (value) => `${bytesToSize(value)}/s`,
  },
];

export default class ContainerHeatMap extends React.PureComponent {
  static propTypes = {
    entity: PropTypes.object,
    infraAccount: PropTypes.object,
    containerIds: PropTypes.array,
    selectContainer: PropTypes.func,
    containerId: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.reload();
  }

  componentDidUpdate({ entity, infraAccount }) {
    if (
      entity !== this.props.entity ||
      infraAccount !== this.props.infraAccount
    ) {
      this.reload();
    }
  }

  async reload() {
    const { infraAccount, containerIds } = this.props;

    const inClause = containerIds.map((c) => `'${c}'`).join(', ');
    const where = `containerId IN (${inClause})`;
    const samplePeriod = await getProcessSamplePeriod(infraAccount.id, where);
    const timeRange = `SINCE ${
      samplePeriod + 10
    } seconds ago until 10 seconds ago`;

    this.setState({ timeRange, where });
  }

  render() {
    const { entity, infraAccount, selectContainer, containerId } = this.props;
    const { timeRange, where } = this.state;

    if (!infraAccount || !timeRange) return <div />;
    return (
      <div>
        {HEAT_MAPS.map(({ title, select, formatValue, eventType, max }) => {
          let accountId = entity.accountId;

          // infra data could come from a different account than the entity
          // note: infraAccount may not be found in which case, don't show
          // a heatmap for infra metrics
          // ALSO need a different time window to get accurate values
          if (eventType === 'ProcessSample') {
            if (!infraAccount) return <div />;
            accountId = infraAccount.id;
          }

          const nrql = `SELECT ${select} FROM ${eventType}
            WHERE ${where} ${timeRange} FACET containerId LIMIT 2000`;

          return (
            <HeatMap
              title={title}
              accountId={accountId}
              key={title}
              max={max}
              query={nrql}
              formatLabel={(label) => label.slice(0, 6)}
              formatValue={formatValue}
              selection={containerId}
              // onClickTitle={console.log}
              onSelect={selectContainer}
            />
          );
        })}
      </div>
    );
  }
}
