
import React from 'react';

import { Tooltip, Button } from 'nr1'
import heatMapColor from '../../lib/heat-map-color'

import ContainerPanel from './container-panel'

function Node(props) {
  const { value, onClick, selected } = props

  const color = heatMapColor(value)
  const toolTip = `${props.name}: CPU ${Math.round(props.cpuPercent)}%`
  const className = `node ${selected && 'selected'}`

  return <Tooltip text={toolTip}>
    <div className={className} style={{ backgroundColor: color }} onClick={onClick}/>
  </Tooltip>
}

export default class ContainerGrid extends React.Component {
  render() {
    const { title, containerData, containerId, maxValue, addToFilter, selectContainer } = this.props

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
          const selected = containerId == container.containerId
          return <Node key={container.containerId} value={value} {...container} 
              selected={selected} onClick={() => selectContainer(container.containerId)}/>
        })}
      </div>
    </div>
  }
}