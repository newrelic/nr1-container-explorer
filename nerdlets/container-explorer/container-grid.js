
import React from 'react';

import { Tooltip, Button } from 'nr1'
import heatMapColor from '../../lib/heat-map-color'


function Node(props) {
  const { value } = props

  const color = heatMapColor(value)
  const toolTip = `${props.name}: CPU ${Math.round(props.cpuPercent)}%`

  return <Tooltip text={toolTip}>
    <div className="node" style={{ backgroundColor: color }} />
  </Tooltip>
}

export default class ContainerGrid extends React.Component {
  render() {
    const { title, containerData, maxValue, addToFilter } = this.props

    return <div className="heat-map">
      <div className="header">
        <span className="title">{title}</span>
        {title != "<No Value>" && <Button
          onClick={addToFilter}
          sizeType="slim"
          type="plain"
          iconType={"interface_operations_filter_a-add"}
        />}
      </div>
      <div className="container-grid">
        {containerData.map(container => {
          const value = Math.max(container.cpuPercent, 0) / maxValue
          return <Node key={container.containerId} value={value} {...container} />
        })}
      </div>
    </div>
  }
}