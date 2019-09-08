import React from 'react';

import { NrqlQuery, LineChart} from 'nr1'

function summarizeFacets(data) {
  if(!data || data.length == 0) return []
  
  let summary = data.shift()
  data.forEach(series => {
    series.data.forEach((datum, index) => {
      summary.data[index].y += datum.y
    })
  })

  const {metadata} = summary
  metadata.label = metadata.alias || metadata.attribute
  metadata.presentation.name = metadata.label

  return [summary]
}


export default function ContainerChart(props) {
  return <NrqlQuery {...props}>
    {({data, loading, error}) => {
      if(error) return <div>{error}</div>
      if(loading) return <div className="chart"/>
      
      return <LineChart data={summarizeFacets(data)}/>
    }}
  </NrqlQuery>
}