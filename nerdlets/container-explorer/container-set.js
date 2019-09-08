import React from 'React'

import ContainerChart from './container-chart'
import {Grid, GridItem} from 'nr1' 

import nrdbQuery from '../../lib/nrdb-query'


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
  const {processData, groupBy, title} = props

  const rows = groupProcessData(processData, groupBy)

  return <table>
    <thead>
      <tr>
        <th>{title}</th>
        <th>Processes</th>
        <th>CPU</th>
        <th>Memory</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(row => {
        return <tr key={row[groupBy]}>
          <td>{row[groupBy]}</td>
          <td>{row.processCount}</td>
          <td>{Math.round(row.cpuPercent)}%</td>
          <td>{row.memoryResidentSizeBytes}</td>
        </tr>
      })}
    </tbody>
  </table>

}

export default class ContainerSet extends React.Component {

  componentDidMount() {
    this.load()
  }

  async load() {
    const {where, account} = this.props
        
    const select = [
      'cpuPercent', 'memoryResidentSizeBytes', 'entityGuid', 'hostname', 'containerId'
    ].map(s => `latest(${s}) AS ${s}`).join(', ')

    const nrql = `SELECT ${select} FROM ProcessSample WHERE ${where} AND (cpuPercent > 0 OR memoryResidentSizeBytes > 0)  SINCE 30 seconds ago FACET entityAndPid LIMIT max`
    console.log(nrql)
    const processData = await nrdbQuery(account.id, nrql)

    this.setState({processData})
  }

  render() {
    const {facet, facetValue} = this.props
    const {processData} = this.state || {}

    if(!processData) return <div/>

    return <div>
      <p className="facet-name">{facet}</p>
      <h2>{facetValue}</h2>
      {/* <Grid>
        <SummaryChart {...this.props} 
          title="CPU" select="latest(cpuPercent) AS CPU"/>
        <SummaryChart {...this.props} 
          title="Memory" select="latest(memoryResidentSizeBytes) AS Memory"/>
      </Grid> */}
      <SummaryTable title="Host" groupBy="hostname" processData={processData}/>
    </div>
  }

}