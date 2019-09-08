
import React from 'react';
import hsl from 'hsl-to-hex'

import {Tooltip} from 'nr1'

function Node(props) {
  const {value} = props

  const h = Math.round((1-value) * 80+10, 2)
  const s = 100
  const l = Math.round(value * 50+15, 2)
  
  const color = hsl(h,s,l)


  const toolTip = `${props.hostname}: CPU ${Math.round(props.cpuPercent)}%`

  return <Tooltip text={toolTip}>
      <div className="node" style={{backgroundColor: color}}/>
    </Tooltip>
}

export default function ContainerGrid({containerData}) {
  containerData=containerData.sort((d1, d2) => d1.containerId.localeCompare(d2.containerId))
  
  const values = containerData.map(d => d.cpuPercent)
  const max = Math.max(...values)

  return <div className="container-grid">
    {containerData.map(container => {
      const value = Math.max(container.cpuPercent, 0)/max
      return <Node key={container.containerId} value={value} {...container}/>
    })}  
  </div>
}