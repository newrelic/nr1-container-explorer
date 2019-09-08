import React from 'React'
import {Grid, GridItem, Tabs, TabsItem, Spinner} from 'nr1' 

import nrdbQuery from '../../lib/nrdb-query'
import getCardinality from '../../lib/get-cardinality'
import quote from '../../lib/quote'

import DenseContainerView from './dense-container-view'
import ContainerTable  from './container-table'

export default class ContainerSet extends React.Component {
  async componentDidMount() {
    await this.reload()
    this.interval = setInterval(() => {this.update()}, 15000)
  }

  componentWillMount() {
    clearInterval(this.interval)
  }

  async componentDidUpdate({where, account}) {
    if(where != this.props.where || account != this.props.account) {
      await this.reload()
    }
  }

  async reload() {
    this.setState({containerData: null})
    const {where, account} = this.props
    const timeWindow = "SINCE 3 minutes ago"

    const facets = await getCardinality({
      eventType: 'ProcessSample',
      accountId: account.id,
      where,
      timeWindow
    })
    const groups = facets.filter(facet => facet.count > 1 && facet.count < 2000)
    const select = groups.map(group => `latest(${quote(group.name)}) AS '${group.name}'`)

    const nrql = `SELECT sum(cpuPercent) AS sortValue,
          latest(hostname) as hostname,
          latest(containerId) as containerId,
          ${select.join(', ')}
      FROM ProcessSample FACET containerId LIMIT 2000
      ${timeWindow} WHERE ${where || "true"}`

    const results = await nrdbQuery(account.id, nrql)

    const containers = {}
    results.forEach(c => {
      c.name = `${c.hostname}:${c.containerId.slice(0,6)}`
      c.cpuPercent = 0
      containers[c.facet] = c
    })


    await this.setState({containers, groups}, () => this.update())
  }

  /*
   * ProcessSample data arrives every 15 seconds, so aggregate CPU, etc
   * by containerId with the assumption that we get one sample per process
   */
  async update() {
    if(!this.state.containers) {
      this.reload()
      return
    }
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

    const results = await nrdbQuery(account.id, nrql)
    
    results.forEach(result => {
      const container = containers[result.facet]
      if(!container) {
        console.log("Missing Container", container)
      }
      if(container) {
        container.cpuPercent = result.cpuPercent      
        container.memoryResidentSizeBytes = result.memoryResidentSizeBytes
      }      
    })    

    await this.setState({containerData: Object.values(containers)})
  }

  render() {
    const {containerData, groups} = this.state || {}

    if(!containerData) return <Spinner fillContent/>
    const defaultTab = containerData.length > 40 ? "grid" : "table"

    return <div>
      <Grid>
        <GridItem columnSpan={7}>
          <Tabs defaultSelectedItem={defaultTab}>
            <TabsItem itemKey="table" label="Table">
              <ContainerTable containerData={containerData}/>
            </TabsItem>
            <TabsItem itemKey="grid" label="Grid">
              <DenseContainerView groups={groups} containerData={containerData}/>
            </TabsItem>
          </Tabs>
        </GridItem>
        <GridItem columnSpan={5}>
          <h2>Select a Container</h2>
        </GridItem>
      </Grid>
    </div>
  }

}