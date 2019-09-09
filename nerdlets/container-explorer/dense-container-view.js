import React from 'react';
import { Spinner } from 'nr1'
import _ from 'underscore'

import quote from '../../lib/quote'
import nrdbQuery from '../../lib/nrdb-query'
import heatMapColor from '../../lib/heat-map-color'

import ContainerGrid from './container-grid'

function ValueSpectrum() {
  const values = []
  for (var i = 0; i < 1; i += 0.005) {
    values.push(i)
  }
  return <div className="value-spectrum">
    {values.map((value, index) => {
      const style = { backgroundColor: heatMapColor(value) }
      return <div key={index} className="slice" style={style} />
    })}
  </div>
}

function Legend({ title, max }) {
  return <div className="legend">
    <span>{title}:</span>
    <span>0</span>
    <ValueSpectrum />
    <span>{max}</span>
  </div>
}


export default class DenseContainerView extends React.Component {
  constructor(props) {
    super(props)

    this.state={}
  }
  
  componentDidMount() {
    this.reload()
  }

  componentWillUnmount() {
    if(this.interval) clearInterval(this.interval)
  }

  componentDidUpdate({where, account}) {
    if(where != this.props.where || account != this.props.account) {
      this.reload()
    }
  }

  async reload() {
    clearInterval(this.interval)
    const {groups, where, account} = this.props

    const startTime = new Date()
    function logTime(message) {
      const elapsed = new Date() - startTime
      console.log("Reload", message, elapsed)
    }
    logTime("Started at " + new Date().toLocaleTimeString())

    const select = groups.map(group => `latest(${quote(group.name)}) AS '${group.name}'`)
    select.unshift("latest(hostname) as hostname")
    select.unshift("latest(containerId) as containerId")
    select.unshift("sum(cpuPercent) AS sortValue")

    const timeWindow = "SINCE 3 minutes ago"
    const nrql = `SELECT ${select.join(', ')}
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
    this.update()
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
    logTime("Started at " + new Date().toLocaleTimeString())

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
    let { group, addFilter, selectContainer, containerId } = this.props
    let { containerData } = this.state || {}

    if(!containerData) return <Spinner fillContent/>

    containerData = containerData.sort((d1, d2) => d1.containerId.localeCompare(d2.containerId))
    const groupedData = group ?
      _.groupBy(containerData, (c => c[group] || "<No Value>")) :
      { "All": containerData }

    // calulate max CPU rounded to nearest 100%
    const values = containerData.map(d => d.cpuPercent)
    const max = Math.floor(Math.max(...values) / 100 + 1) * 100

    return <>
      <Legend title="CPU" max={`${Math.round(max)}%`} />
      <div className="heat-map-list">
        {_.keys(groupedData).map((groupName) => {
          return <ContainerGrid
            containerData={groupedData[groupName]}
            containerId={containerId}
            title={groupName}
            selectContainer={selectContainer}
            addToFilter={() => addFilter(group, groupName)}
            maxValue={max} />
        })}
      </div>
    </>

  }
}