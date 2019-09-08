
import React from 'react';
import hsl from 'hsl-to-hex'

import { Tooltip } from 'nr1'

function valueColor(value) {
  const h = (1 - value) * 80
  const s = 100
  const l = 40

  return hsl(h, s, l)
}

function Node(props) {
  const { value } = props

  const color = valueColor(value)
  const toolTip = `${props.name}: CPU ${Math.round(props.cpuPercent)}%`

  return <Tooltip text={toolTip}>
    <div className="node" style={{ backgroundColor: color }} />
  </Tooltip>
}

function ValueSpectrum({ maxValue }) {
  const values = []
  for (var i = 0; i < 1; i += 0.005) {
    values.push(i)
  }
  return <div className="value-spectrum">
    {values.map((value, index) => {
      const style = { backgroundColor: valueColor(value) }
      return <div key={index} className="slice" style={style} />
    })}
  </div>
}

function Legend({title, maxValue, maxStr}) {
  return <div className="legend">
    <span>{title}:</span>
    <span>0</span>
    <ValueSpectrum maxValue={maxValue}/>
    <span>{maxStr}</span>
  </div>
}
export default function ContainerGrid({ containerData }) {
  containerData = containerData.sort((d1, d2) => d1.containerId.localeCompare(d2.containerId))

  // calulate max CPU rounded to nearest 100%
  const values = containerData.map(d => d.cpuPercent)
  const max = Math.floor(Math.max(...values)/100+1)*100

  return <div>
    <Legend title="CPU" maxValue={max} maxStr={`${Math.round(max)}%`}/>
    <div className="container-grid">
      {containerData.map(container => {
        const value = Math.max(container.cpuPercent, 0) / max
        return <Node key={container.containerId} value={value} {...container} />
      })}
    </div>
  </div>
}