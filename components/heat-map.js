import {NrqlQuery, Tooltip} from 'nr1'
import _ from 'underscore'

import heatMapColor from '../lib/heat-map-color'

function Node(props) {
  const {name, value, max, selected, onClick, formatLabel} = props

  const normalizedValue = Math.max(Math.min(value/max, 1), 0)
  const color = heatMapColor(normalizedValue)
  const toolTipText = formatLabel ? formatLabel({name, value}) : `${name}: ${value}`
  const className = `node ${selected && 'selected'}`

  return <Tooltip text={toolTipText}>
    <div className={className} style={{ backgroundColor: color }} onClick={onClick}/>
  </Tooltip>
}


function prepare(rawNrdbData) {
  const data = rawNrdbData.facets.map(facet => {
    const value = Object.values(facet.results[0])[0]
    return {
      name: facet.name,
      value
    }
  })
  return _.sortBy(data, "name")
}

export default function Heatmap(props) {
  let {title, accountId, nrql, max, formatLabel, selection, onSelect} = props

  return <NrqlQuery accountId={accountId} query={nrql} 
        formatType={NrqlQuery.FORMAT_TYPE.RAW}>
    {({loading, error, data}) => {
      if(loading) return <div/>
      if(error) return <pre>{error}</pre>
      if(!data.facets) {
        console.log("Bad result", nrql, JSON.stringify(rawNrdbData, 0, 2))
      }

      data = prepare(data)
      max = max || Math.max(...data.map(d => d.value))

      return <div className="heat-map">
        <div className="header">
          <div className="title">
            {title}
          </div>
        </div>
        <div className="grid">
          {data.map(datum => {
            const selected = datum.name == selection
            return <Node formatLabel={formatLabel} {...datum} selected={selected}   
                max={max} onClick={() => onSelect(datum.name)}/>
          })}
        </div>
      </div>

    }}
  </NrqlQuery>
}