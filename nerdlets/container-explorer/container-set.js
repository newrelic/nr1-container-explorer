import React from 'React'

import ContainerChart from './container-chart'
import ContainerGrid from './container-grid'

import {Grid, GridItem, Tabs, TabsItem} from 'nr1' 

import nrdbQuery from '../../lib/nrdb-query'
import bytesToSize from '../../lib/bytes-to-size'


function SummaryChart(props) {
  const {title, where, select, account } = props
  const nrql = `SELECT ${select} FROM ProcessSample WHERE ${where} TIMESERIES FACET entityAndPid LIMIT max`
  console.log(nrql)
  return <GridItem columnSpan={4}>
    <h3>{title}</h3>
    <ContainerChart className={"summary-chart"} accountId={account.id} query={nrql}/>
  </GridItem>
}

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
        <th>Host</th>
        <th>Container</th>
        <th>CPU</th>
        <th>Memory</th>
      </tr>
    </thead>
    <tbody>
      {containerData.map(row => {
        return <tr key={row.containerId}>
          <td>{row.hostname}</td>
          <td>{row.containerId.slice(0, 6)+"..."}</td>
          <td>{Math.round(row.cpuPercent)}%</td>
          <td>{bytesToSize(row.memoryResidentSizeBytes)}</td>
        </tr>
      })}
    </tbody>
  </table>
}

export default class ContainerSet extends React.Component {
  componentDidMount() {
    this.interval = setInterval(() => {this.load()}, 15000)
  }

  componentWillMount() {
    clearInterval(this.interval)
  }

  componentDidUpdate({where, account}) {
    if(where != this.props.where || account != this.props.account) {
      this.load()
    }
  }

  async load() {
    const {where, account} = this.props        
    const select = [
      'cpuPercent', 'memoryResidentSizeBytes', 'entityGuid', 'hostname', 'containerId'
    ].map(s => `latest(${s}) AS ${s}`).join(', ')

    const nrql = `SELECT ${select} FROM ProcessSample WHERE ${where} AND (cpuPercent > 0 OR memoryResidentSizeBytes > 0) SINCE 1 minute ago FACET entityAndPid LIMIT max`
    const processData = await nrdbQuery(account.id, nrql)

    await this.setState({processData})
  }

  render() {
    const {processData} = this.state || {}

    if(!processData) return <div/>
    const containerData = groupProcessData(processData, 'containerId')
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