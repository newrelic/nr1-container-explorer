import React from 'react'
import {Spinner} from 'nr1'

import nrdbQuery from '../../lib/nrdb-query'
import getCardinality from '../../lib/get-cardinality'

/*
 * these attributes are omitted for one of the following reasons:
 *  - applies to a specific process, not the whole conatiner
 *  - appears in summary header already
 *  - needless duplicate(hostname, entityname, fqdn, etc.)
 */
const OMIT_ATTRIBUTES = {
  "agentName": true,
  "criticalViolationCount": true,
  "parentProcessId": true,
  "nr.entityType": true,
  "processDisplayName": true,  
  "entityAndPid": true,
  "commandLine": true,
  "commandName": true,

  "entityKey": true,
  "entityName": true
}

function Attribute({name, value}) {
  return <li>
    <span className="name">{name}</span>
    <span className="value">{value}</span>
  </li>
}

export default class ContainerAttributes extends React.Component {
  componentDidMount() {
    this.load()
  }

  componentDidUpdate({containerId}) {
    if(containerId != this.props.containerId) {
      this.load()
    }
  }

  async load() {
    this.setState({attributes: null})
    const {account, containerId} = this.props
    const accountId = account.id

    const where = `containerId = '${containerId}'`
    const timeWindow = 'SINCE 15 minutes ago'
    const facets = await getCardinality({accountId, where, timeWindow, eventType: 'ProcessSample'})

    const attributes = facets.filter(f => f.count == 1 && !OMIT_ATTRIBUTES[f.name])
    const nrql = `SELECT * from ProcessSample WHERE ${where} LIMIT 1 ${timeWindow}`
    const results = (await nrdbQuery(accountId, nrql))[0]
    
    attributes.forEach(attr => {
      attr.value = results[attr.name]
    })
    this.setState({attributes})
  }

  render() {
    const {attributes} = this.state || {}
    if(!attributes) return <Spinner fillContent/>

    return <div className="container-summary-view">
      <h3>{name}</h3>
      <ul className='tags'>
        {attributes.map(attr => {
          return <Attribute key={attr.name} {...attr}/>
        })}
      </ul>
    </div>
  }
}
