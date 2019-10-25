import React from 'react'

import quote from '../../lib/quote'
import Heatmap from '../../components/heat-map'
import getProcessSamplePeriod from '../shared/get-process-sample-period'

import PLOTS from '../../lib/plots'

export default class ContainerHeatMap extends React.Component {

  componentDidMount() {
    this.reload()
  }
  
  componentDidUpdate({group, where}) {
    if(group != this.props.group || where != this.props.where) {
      this.reload()
    }
  }

  getNrql(select) {
    const { group, where } = this.props
    const {timeRange} = this.state || {
      timeRange: "SINCE 30 seconds ago UNTIL 15 seconds ago"
    }

    const facet = group ? `${quote(group)}, containerId` : "containerId"
    return `SELECT ${select} FROM ProcessSample WHERE ${where || "true"}
          ${timeRange} FACET ${facet} LIMIT 2000`

  }

  async reload() {
    let {account, where} = this.props

    const samplePeriod = await getProcessSamplePeriod(account.id, where)
    const timeRange = `SINCE ${samplePeriod+10} seconds ago UNTIL 10 seconds ago`

    this.setState({samplePeriod, timeRange})    
  }

  renderHeatMap(plot) {
    const { account, setFacetValue, selectContainer, containerId, group } = this.props
    const nrql = this.getNrql(plot.select)

    // if the user clicks on a title (facet value) when viewing as a group, then 
    // add to the filter.
    const onClickTitle = group && ((value) => setFacetValue(value))

    return <Heatmap accountId={account.id} query={nrql}
      key={plot.title}
      title={plot.title}
      formatLabel={(c) => c.slice(0, 6)}
      formatValue={plot.formatValue}
      selection={containerId}
      max={plot.max}
      onSelect={(containerId) => selectContainer(containerId)}
      onClickTitle={onClickTitle}
    />
  }

  render() {
    const { group, counts, plot } = this.props
    const { timeRange } = this.state || {}

    if(!timeRange) return <div/>

    if (group || counts.containers > 500) {
      return <div>
        <div className="plot-picker-container">
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