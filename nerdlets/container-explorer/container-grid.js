
import React from 'react';

import { Tooltip } from 'nr1'
import heatMapColor from '../../lib/heat-map-color'


function Node(props) {
  const { value } = props

  const color = heatMapColor(value)
  const toolTip = `${props.name}: CPU ${Math.round(props.cpuPercent)}%`

  return <Tooltip text={toolTip}>
    <div className="node" style={{ backgroundColor: color }} />
  </Tooltip>
}


export default function ContainerGrid({ title, containerData, maxValue }) {
  return <div>
    <h3>{title}</h3>
    <div className="container-grid">
      {containerData.map(container => {
        const value = Math.max(container.cpuPercent, 0) / maxValue
        return <Node key={container.containerId} value={value} {...container} />
      })}
    </div>    
  </div>

}