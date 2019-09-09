import React from 'react'
import quote from '../../lib/quote'

import {TableChart} from 'nr1'


export default function FacetTable(props) {
  const {account, group, setFacetValue, where} = props
  const whereClause = where ? "WHERE " + where : ''
  const nrql = `SELECT uniqueCount(containerId) as 'Containers', 
    uniqueCount(entityGuid) as 'Hosts'  
    FROM ProcessSample ${whereClause} FACET ${quote(group)} 
    LIMIT 2000 SINCE 30 seconds ago`.replace(/\n/g, '')

  const onClickTable = setFacetValue && function (ignored, row) {
    setFacetValue(row[group])
  }  
  return <div style={{width: "100%", height: "100%"}}>
    <p>Too many containers to display them all. Select a segment.</p>
    <TableChart accountId={account.id} query={nrql} onClickTable={onClickTable}/>
  </div>
}