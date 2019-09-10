import React from 'react'
import HeatMap from '../../components/heat-map'

import bytesToSize from '../../lib/bytes-to-size'

const HEAT_MAPS = [
  {
    title: "Response Time",
    eventType: 'Transaction',
    select: "average(duration)",
    max: 1,
    formatLabel: ({name, value}) => `${name.slice(0, 6)}: ${Math.round(value*100)}ms`
  },
  {
    title: "Throughput",
    eventType: 'Transaction',
    select: "rate(count(*), 1 minute)",
    formatLabel: ({name, value}) => `${name.slice(0, 6)}: ${Math.round(value)} rpm`
  },
  {
    title: "CPU",
    eventType: 'ProcessSample',
    select: "sum(cpuPercent)",
    formatLabel: ({name, value}) => `${name.slice(0, 6)}: ${value.toFixed(1)}%`,
  },
  {
    title: "Memory",
    eventType: 'ProcessSample',
    select: "sum(memoryResidentSizeBytes)",
    formatLabel: ({name, value}) => `${name.slice(0, 6)}: ${bytesToSize(value)}`,
  },
  {
    title: "I/O",
    eventType: 'ProcessSample',
    select: "sum(ioReadBytesPerSecond+ioWriteBytesPerSecond)",
    formatLabel: ({name, value}) => `${name.slice(0, 6)}: ${bytesToSize(value)}`,
  }
]

export default class ContainerHeatMap extends React.PureComponent {
  render() {
    let {entity, infraAccount, selectContainer, containerIds, containerId} = this.props
    if(!infraAccount) return <div/>

    // FIXME overriding time picker to do realtime so we can show accurate infra data
    const timeRange = "SINCE 90 seconds ago until 75 seconds ago"
    return <div>
      {HEAT_MAPS.map(({title, select, formatLabel, eventType, max}) => {
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
          <HeatMap title={title} accountId={accountId} max={max}
              nrql={nrql} formatLabel={formatLabel} 
              selection={containerId}
              onSelect={selectContainer}/>
        </div>
      })}
    </div>
    }
}