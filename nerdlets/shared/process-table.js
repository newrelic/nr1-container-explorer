import React from 'react';
import PropTypes from 'prop-types';

import nrdbQuery from '../../lib/nrdb-query';
import bytesToSize from '../../lib/bytes-to-size';

function Table({ processData }) {
  return (
    <table className="process-table">
      <thead>
        <tr>
          <th>PID</th>
          <th>Command</th>
          <th>CPU</th>
          <th>Memory</th>
          <th>I/O</th>
        </tr>
      </thead>
      <tbody>
        {processData.map((process) => {
          return (
            <tr key={process.facet[0]}>
              <td className="right">{process.facet[0]}</td>
              <td className="left">{process.facet[1].slice(0, 18)}</td>
              <td className="right">{process.cpu.toFixed(1)}%</td>
              <td className="right">{bytesToSize(process.memory)}</td>
              <td className="right">{bytesToSize(process.io)}/s</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
Table.propTypes = {
  processData: PropTypes.array,
};

export default class ProcessTable extends React.Component {
  static propTypes = {
    containerId: PropTypes.string,
    account: PropTypes.object,
    entityGuid: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  componentDidMount() {
    // refresh every 15 seconds
    this.load();
    this.interval = setInterval(() => this.load(), 15000);
  }

  componentDidUpdate({ containerId, entityGuid }) {
    if (
      containerId !== this.props.containerId ||
      entityGuid !== this.props.entityGuid
    ) {
      this.load();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  async load() {
    const { containerId, account } = this.props;
    const nrql = `SELECT latest(cpuPercent) as cpu, 
        latest(memoryResidentSizeBytes) as memory, 
        latest(ioReadBytesPerSecond+ioWriteBytesPerSecond) as io
        FROM ProcessSample where containerId = '${containerId}'
        FACET processId, processDisplayName
        SINCE 1 minute ago`;
    const results = await nrdbQuery(account.id, nrql);
    this.setState({ processData: results });
  }

  render() {
    const { processData } = this.state;
    if (!processData) return <div />;
    return <Table processData={processData} />;
  }
}
