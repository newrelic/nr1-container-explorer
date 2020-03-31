import React from 'react';

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

export default class ProcessTable extends React.Component {
  componentDidMount() {
    // refresh every 15 seconds
    this.load();
    this.interval = setInterval(() => this.load(), 15000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  componentDidUpdate({ containerId, entityGuid }) {
    if (
      containerId != this.props.containerId ||
      entityGuid != this.props.entityGuid
    ) {
      this.load();
    }
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
    const { processData } = this.state || {};
    if (!processData) return <div />;
    return <Table processData={processData} />;
  }
}
