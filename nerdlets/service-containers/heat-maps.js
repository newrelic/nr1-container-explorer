import React from 'react'
import HeatMap from '../../components/heat-map'

import bytesToSize from '../../lib/bytes-to-size'

const HEAT_MAPS = [
  {
    title: "Response Time (ms)",
    eventType: 'Transaction',
    select: "average(duration)*1000",
    max: Math.round,
    formatValue: (value) => `${Math.round(value)}ms`
  },
  {
    title: "Throughput",
    eventType: 'Transaction',
    select: "rate(count(*), 1 minute)",
    max: Math.ceil,
    formatValue: (value) => `${Math.round(value)} rpm`
  },
  {
    title: "CPU",
    eventType: 'ProcessSample',
    select: "sum(cpuPercent)",
    max: (max) => Math.ceil(max/100)*100,
    formatValue: (value) => `${Math.round(value)}%`,
  },
  {
    title: "Memory",
    eventType: 'ProcessSample',
    select: "sum(memoryResidentSizeBytes)",
    max: Math.round,
    formatValue: bytesToSize
  },
  {
    title: "I/O",
    eventType: 'ProcessSample',
    select: "sum(ioReadBytesPerSecond+ioWriteBytesPerSecond)",
    max: Math.round,
    formatValue: (value) => `${bytesToSize(value)}`
  }
]

export default class ContainerHeatMap extends React.PureComponent {
  render() {
    let {entity, infraAccount, selectContainer, containerIds, containerId} = this.props
    if(!infraAccount) return <div/>

    // FIXME overriding time picker to do realtime so we can show accurate infra data
    const timeRange = "SINCE 90 seconds ago until 75 seconds ago"
    return <div>
      {HEAT_MAPS.map(({title, select, formatValue, eventType, max}) => {
        let accountId = entity.accountId
  
        // infra data could come from a different account than the entity
        // note: infraAccount may not be found in which case, don't show
        // a heatmap for infra metrics      
        // ALSO need a different time window to get accurate values
        if(eventType == 'ProcessSample') {
          if(!infraAccount) return <div/>
          accountId = infraAccount.id
        }
        
        const nrql = `SELECT ${select} FROM ${eventType}
            WHERE containerId IN (${containerIds.map(x => `'${x}'`).join(', ')})
            ${timeRange} FACET containerId LIMIT 2000`
  
        return <div>
          <HeatMap title={title} accountId={accountId} max={max} showLegend
              query={nrql} 
              formatLabel={(label) => label.slice(0,6)}
              formatValue={formatValue} 
              selection={containerId}
              onClickTitle={console.log}
              onSelect={selectContainer}/>
        </div>
      })}
    </div>
    }
}