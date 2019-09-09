import React from 'React'
import {Grid, GridItem, Spinner} from 'nr1' 
import _ from 'underscore'

import nrdbQuery from '../../lib/nrdb-query'
import getCardinality from '../../lib/get-cardinality'
import quote from '../../lib/quote'

import DenseContainerView from './dense-container-view'
import ContainerTable  from './container-table'

const OMIT_KEYS = {
  systemMemoryBytes: true,
  apmApplicationIds: true,
  containerId: true,
  commandLine: true,
  commandName: true,  
  processId: true
}


export default class ContainerExplorer extends React.Component {
  async componentDidMount() {
    await this.reload()    
  }

  componentWillMount() {
    if(this.interval) clearInterval(this.interval)
  }

  async componentDidUpdate({where, account}) {
    if(where != this.props.where || account != this.props.account) {
      console.log("Reload", {where, account}, this.props)
      await this.reload()
    }
  }

  async reload() {
    clearInterval(this.interval)
    this.interval = null

    const startTime = new Date()
    function logTime(message) {
      const elapsed = new Date() - startTime
      console.log("Reload", message, elapsed)
    }
    logTime("Start Reload")

    this.setState({containerData: null, containers: null})
    const {where, account, counts} = this.props
    const timeWindow = "SINCE 3 minutes ago"

    const facets = await getCardinality({
      eventType: 'ProcessSample',
      accountId: account.id,
      where,
      timeWindow
    })
    logTime("getCardinality")

    const groups = facets.filter(facet => {
      return facet.count > 1 && facet.count < counts.containers * .6 && !OMIT_KEYS[facet.name]
    })
    const select = groups.map(group => `latest(${quote(group.name)}) AS '${group.name}'`)

    const nrql = `SELECT sum(cpuPercent) AS sortValue,
          latest(hostname) as hostname,
          latest(containerId) as containerId,
          ${select.join(', ')}
      FROM ProcessSample FACET containerId LIMIT 2000
      ${timeWindow} WHERE ${where || "true"}`
    logTime("buildNrql")

    const results = await nrdbQuery(account.id, nrql)
    logTime("getContainers")

    const containers = {}
    results.forEach(c => {
      c.name = `${c.hostname}:${c.containerId.slice(0,6)}`
      c.cpuPercent = 0
      containers[c.facet] = c
    })

    logTime("setup data")

    await this.setState({containers, groups: _.sortBy(groups, 'name')})
    this.interval = setInterval(() => {this.update()}, 15000)
  }

  /*
   * ProcessSample data arrives every 15 seconds, so aggregate CPU, etc
   * by containerId with the assumption that we get one sample per process
   */
  async update() {
    if(!this.state.containers) {
      return
    }
    const startTime = new Date()
    function logTime(message) {
      const elapsed = new Date() - startTime
      console.log("Update", message, elapsed)
    }
    logTime("Started at" + new Date().toLocaleTimeString())

    const {account, where} = this.props
    const select = [
      "sum(cpuPercent) AS cpuPercent",
      "sum(memoryResidentSizeBytes) AS memoryResidentSizeBytes",
      "count(*) AS processCount",
      "latest(hostname) AS hostname",
      "latest(entityGuid) AS entityGuid"
    ].join(", ")

    const timeWindow = "SINCE 30 seconds ago until 15 seconds ago"
    const {containers} = this.state

    const nrql = `SELECT ${select} FROM ProcessSample 
      WHERE ${where || "true"}
      ${timeWindow} FACET containerId LIMIT 2000`

    logTime("buildNrql")
    const results = await nrdbQuery(account.id, nrql)

    logTime("fetchResults")
    logTime("I mean it!")
    
    results.forEach(result => {
      const container = containers[result.facet]
      if(!container) {
        // console.log("Missing Container", result.facet)
      }
      if(container) {
        container.cpuPercent = result.cpuPercent      
        container.memoryResidentSizeBytes = result.memoryResidentSizeBytes
      }      
    })    
    logTime("buildContainers")

    await this.setState({containerData: Object.values(containers)})
  }

  render() {
    const {addFilter} = this.props
    const {containerData, groups, container} = this.state || {}


    if(!containerData) return <Spinner fillContainer/>
    const defaultTab = containerData.length > 40 ? "grid" : "table"

    return <div className='content'>
      <Grid>
        <GridItem columnSpan={container ? 8 : 12}>
          <DenseContainerView groups={groups} 
                containerData={containerData} addFilter={addFilter}/>
        </GridItem>
        {container && <GridItem columnSpan={4}>
          <h2>Select a Container</h2>
        </GridItem>}
      </Grid>
    </div>
  }

}