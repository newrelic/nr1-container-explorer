import React from 'react';
import { Grid, GridItem } from 'nr1'
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


function GroupList({ groups, group, selectGroup }) {  
  return <ul className="facet-list">
    <li className='facet' key="__none" onClick={() => selectGroup(null)}>
      None
    </li>
    {groups.map(g => {
      const className = `facet ${g.name == group && 'selected'}`
      return <li className={className} key={g.name} onClick={() => selectGroup(g.name)}>
        {g.name} ({g.count})
      </li>
    })}
  </ul>
}

export default class DenseContainerView extends React.Component {
  render() {
    let { containerData, groups, addFilter } = this.props
    const { group } = this.state || {group: "containerImageName"}

    containerData = containerData.sort((d1, d2) => d1.containerId.localeCompare(d2.containerId))
    const groupedData = group ?
      _.groupBy(containerData, (c => c[group] || "<No Value>")) :
      { "All": containerData }

    // calulate max CPU rounded to nearest 100%
    const values = containerData.map(d => d.cpuPercent)
    const max = Math.floor(Math.max(...values) / 100 + 1) * 100

    return <Grid>
      <GridItem columnSpan={3}>
        <GroupList groups={groups} group={group}
          selectGroup={(group) => this.setState({ group })} />
      </GridItem>
      <GridItem columnSpan={9}>
        <Legend title="CPU" max={`${Math.round(max)}%`} />
        {_.keys(groupedData).map((groupName) => {
          return <ContainerGrid
            containerData={groupedData[groupName]}
            title={groupName}
            addToFilter={() => addFilter(group, groupName)}
            maxValue={max} />
        })}
      </GridItem>
    </Grid>

  }
}