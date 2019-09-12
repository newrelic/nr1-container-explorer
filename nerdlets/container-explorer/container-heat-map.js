import React from 'react'
import { Dropdown, DropdownItem } from 'nr1'

import quote from '../../lib/quote'
import Heatmap from '../../components/heat-map'
import bytesToSize from '../../lib/bytes-to-size'

const PLOTS = [
  {
    select: 'sum(cpuPercent) AS cpu',
    title: "CPU",
    formatValue: (value) => `${value.toFixed(1)}%`,
    max: 100,
  },
  {
    select: 'sum(memoryResidentSizeBytes) AS memory',
    title: "Memory",
    formatValue: (value) => bytesToSize(value)
  },
  {
    select: 'sum(ioReadBytesPerSecond+ioWriteBytesPerSecond) AS io',
    title: "I/O",
    formatValue: (value) => `${bytesToSize(value)}/s`
  }
]

function PlotPicker({ plot, setPlot }) {

  return <Dropdown title={plot.title} label="Plot">
    {PLOTS.map(p => {
      return <DropdownItem onClick={() => setPlot(p)} key={p.title}>
        {p.title}
      </DropdownItem>
    })}

  </Dropdown>
}

export default class ContainerHeatMap extends React.Component {
  getNrql(select) {
    const { group, where } = this.props
    const facet = group ? `${quote(group)}, containerId` : "containerId"
    return `SELECT ${select} FROM ProcessSample WHERE ${where || "true"}
          SINCE 30 seconds ago UNTIL 15 seconds ago FACET ${facet} LIMIT 2000`

  }
  renderHeatMap(plot) {
    const { account, setFacetValue, selectContainer, containerId, max, group } = this.props
    const nrql = this.getNrql(plot.select)

    // if the uesr clicks on a title (facet value) when viewing as a group, then 
    // add to the filter.
    const onClickTitle = group && ((value) => setFacetValue(value))

    return <Heatmap accountId={account.id} query={nrql}
      title={plot.title}
      formatLabel={(c) => c.slice(0, 6)}
      formatValue={plot.formatValue}
      selection={containerId}
      max={max}
      onSelect={(containerId) => selectContainer(containerId)}
      onClickTitle={onClickTitle}
    />
  }

  render() {
    const { group, counts } = this.props
    const { plot } = this.state || { plot: PLOTS[0] }

    if (group || counts.containers > 500) {
      return <div>
        <div className="plot-picker-container">
          <PlotPicker plot={plot} setPlot={(plot) => this.setState({ plot })} />
          {counts.containers > 2000 && <span className="limit-info">
            Showing Top 2000 Containers by {plot.title}
          </span>}
        </div>
        {this.renderHeatMap(plot)}
      </div>
    }
    else {
      return PLOTS.map(plot => {
        return this.renderHeatMap(plot)
      })
    }
  }

}