import React from 'react';
import PropTypes from 'prop-types';
import bytesToSize from '../../lib/bytes-to-size';

export default function ContainerTable(props) {
  const { containerData } = props;
  return (
    <table className="container-table">
      <thead>
        <tr>
          <th>Container</th>
          <th>CPU</th>
          <th>Memory</th>
        </tr>
      </thead>
      <tbody>
        {containerData.map((row) => {
          return (
            <tr key={row.containerId}>
              <td>{row.name}</td>
              <td>{row.cpuPercent.toFixed(1)}%</td>
              <td>{bytesToSize(row.memoryResidentSizeBytes)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
ContainerTable.propTypes = {
  containerData: PropTypes.array,
};
