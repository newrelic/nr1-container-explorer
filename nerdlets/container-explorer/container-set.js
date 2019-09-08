import React from 'React'

import ContainerChart from './container-chart'
import ContainerGrid from './container-grid'

import {Grid, GridItem, Tabs, TabsItem, Spinner} from 'nr1' 

import nrdbQuery from '../../lib/nrdb-query'
import bytesToSize from '../../lib/bytes-to-size'
import getCardinality from '../../lib/get-cardinality'

function groupProcessData(processData, groupBy) {
  const tableData = processData.reduce((groups, row) => {
    const group = groups[row[groupBy]]
    if(!group) {
      groups[row[groupBy]] = row
      row.processCount = 1
    }
    else {
      group.cpuPercent += row.cpuPercent
      group.memoryResidentSizeBytes += row.memoryResidentSizeBytes
      group.processCount += 1
    }
    return groups
  }, {})

  return Object.values(tableData)
}

function SummaryTable(props) {
  const {containerData} = props

  return <table className="container-table">
    <thead>
      <tr>
        <th>Container</th>
        <th>CPU</th>
        <th>Memory</th>
      </tr>
    </thead>
    <tbody>
      {containerData.map(row => {
        return <tr key={row.containerId}>
          <td>{row.name}</td>
          <td>{row.cpuPercent.toFixed(1)}%</td>
          <td>{bytesToSize(row.memoryResidentSizeBytes)}</td>
        </tr>
      })}
    </tbody>
  </table>
}

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
    this.setState({conatinerData: null})
    const {where, account} = this.props
    const timeWindow = "SINCE 3 minutes ago"
    const nrql = `SELECT sum(cpuPercent) AS sortValue,
          latest(hostname) as hostname,
          latest(containerId) as containerId
      FROM ProcessSample FACET containerId LIMIT 2000
      ${timeWindow} WHERE ${where || "true"}`

    const results = await nrdbQuery(account.id, nrql)

    const containers = {}
    results.forEach(c => {
      c.name = `${c.hostname}:${c.containerId.slice(0,6)}`
      c.cpuPercent = 0
      containers[c.facet] = c
    })
    const inClause = results.map(c => `'${c.facet}'`).join(', ')
    const containerWhere = `containerId IN (${inClause})`

    const facets = await getCardinality({
      eventType: 'ProcessSample',
      accountId: account.id,
      where: containerWhere,
      timeWindow
    })
    const groups = facets.filter(facet => facet.count > 1 && facet.count < results.length *.6)
    console.log("Groups", groups)

    await this.setState({containers, containerWhere, groups}, () => this.update())
  }

  /*
   * ProcessSample data arrives every 15 seconds, so aggregate CPU, etc
   * by containerId with the assumption that we get one sample per process
   */
  async update() {
    if(!this.state.containers) {
      this.reload()()
      return
    }

    const {account} = this.props
    const select = [
      "sum(cpuPercent) AS cpuPercent",
      "sum(memoryResidentSizeBytes) AS memoryResidentSizeBytes",
      "count(*) AS processCount",
      "latest(hostname) AS hostname",
      "latest(entityGuid) AS entityGuid"
    ].join(", ")

    const timeWindow = "SINCE 30 seconds ago until 15 seconds ago"
    const {containers, containerWhere} = this.state

    const nrql = `SELECT ${select} FROM ProcessSample 
      WHERE ${containerWhere}
      ${timeWindow} FACET containerId LIMIT 2000`
    const results = await nrdbQuery(account.id, nrql)
    
    results.forEach(result => {
      const container = containers[result.facet]
      container.cpuPercent = result.cpuPercent      
      container.memoryResidentSizeBytes = result.memoryResidentSizeBytes
    })    

    console.log(containers)

    await this.setState({containerData: Object.values(containers)})
  }

  render() {
    const {containerData} = this.state || {}

    if(!containerData) return <Spinner fillContent/>
    const defaultTab = containerData.length > 40 ? "grid" : "table"

    return <div>
      <Grid>
        <GridItem columnSpan={7}>
          <Tabs defaultSelectedItem={defaultTab}>
            <TabsItem itemKey="table" label="Table">
              <SummaryTable containerData={containerData}/>
            </TabsItem>
            <TabsItem itemKey="grid" label="Grid">
              <ContainerGrid containerData={containerData}/>
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