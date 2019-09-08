import React from 'react'
import quote from '../../lib/quote'

import {TableChart} from 'nr1'


export default function FacetTable(props) {
  const {account, facet, setFacetValue} = props
  const nrql = `SELECT uniqueCount(containerId) as 'Containers', 
    uniqueCount(entityGuid) as 'Hosts' 
    FROM ProcessSample FACET ${quote(facet)} LIMIT max SINCE 30 seconds ago`

  const onClickTable = setFacetValue && function (ignored, row) {
    setFacetValue(row[facet])
  }  
  return <TableChart accountId={account.id} query={nrql} onClickTable={onClickTable}/>
}