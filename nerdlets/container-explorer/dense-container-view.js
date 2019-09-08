import React from 'react';
import {Dropdown, DropdownItem} from 'nr1'
import _ from 'underscore'

import heatMapColor from '../../lib/heat-map-color'
import ContainerGrid from './container-grid'

function ValueSpectrum() {
  const values = []
  for (var i = 0; i < 1; i += 0.005) {
    values.push(i)
  }
  return <div className="value-spectrum">
    {values.map((value, index) => {
      const style = { backgroundColor: heatMapColor(value) }
      return <div key={index} className="slice" style={style} />
    })}
  </div>
}

function Legend({ title, max }) {
  return <div className="legend">
    <span>{title}:</span>
    <span>0</span>
    <ValueSpectrum />
    <span>{max}</span>
  </div>
}

function GroupByDropDown({ groups, group, selectGroup }) {
  return <Dropdown title={group || "None"}>
    <DropdownItem key="__none" onClick={() => selectGroup(null)}>
      None
    </DropdownItem>
    {groups.map(g => {
      return <DropdownItem key={g.name} onClick={() => selectGroup(g.name)}>
        {g.name} ({g.count})
      </DropdownItem>
    })}
  </Dropdown>
}

export default class DenseContainerView extends React.Component {
  render() {
    let {containerData, groups} = this.props
    const {group} = this.state || {group: "kernelVersion"}
    
    containerData = containerData.sort((d1, d2) => d1.containerId.localeCompare(d2.containerId))
    const groupedData = group ? 
      _.groupBy(containerData, (c => c[group] || "<No Value>")) : 
      {"All": containerData}

    // calulate max CPU rounded to nearest 100%
    const values = containerData.map(d => d.cpuPercent)
    const max = Math.floor(Math.max(...values)/100+1)*100

    return <div>
      <Legend title="CPU" max={`${Math.round(max)}%`}/>
      <div>
        Group By: 
        <GroupByDropDown groups={groups} group={group} 
          selectGroup={(group) => this.setState({group})}/>
      </div>
      {_.keys(groupedData).map((groupName) => {
          return <ContainerGrid 
              containerData={groupedData[groupName]} 
              title={groupName}
              maxValue={max}/>
      })}    
    </div>

  }
}