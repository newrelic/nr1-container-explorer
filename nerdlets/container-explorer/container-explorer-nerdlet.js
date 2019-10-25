import React from 'react';
import { Spinner } from 'nr1'

import quote from '../../lib/quote'
import nrdbQuery from '../../lib/nrdb-query'
import findRelatedAccountsWith from '../../lib/find-related-account-with'

import ContainerExplorer from './container-explorer'
import Header from './header'

import PLOTS from '../../lib/plots'

export default class ContainerExplorerNerdlet extends React.Component {
  constructor(props) {
    super(props)

    this.addFilter = this.addFilter.bind(this)
    this.removeFilter = this.removeFilter.bind(this)
    this.setAccount = this.setAccount.bind(this)
    this.setPlot = this.setPlot.bind(this);
    this.setGroup = this.setGroup.bind(this);

    this.state = {
      filters: [],
      plot: PLOTS[0],
    }    
  }

  async componentDidMount() {
    const find = {eventType: "ProcessSample", where: "containerId IS NOT NULL", 
        timeWindow: "SINCE 1 minute ago"}
    const accounts = await findRelatedAccountsWith(find)
    await this.setState({accounts, account: accounts[0]})

    if(accounts.length > 0) {
      this.countProcesses()      
    }
  }

  async addFilter(name, value) {
    const {filters} = this.state
    filters.push({name, value})
    await this.setFilters(filters)
  }

  async removeFilter(name, value) {
    let {filters} = this.state
    
    filters = filters.filter(f => !(f.name == name && f.value == value))
    this.setFilters(filters)
  }

  async setFilters(filters) {
    let where = null
    if(filters != null && filters.length > 0) {
      where = filters.map(({name, value}) => `${quote(name)} = '${value}'`).join(" AND ")
    }

    await this.setState({filters, where})
    this.countProcesses()
  }

  async setAccount(account) {    
    await this.setState({account, filters: [], where: null, counts: null})
    this.countProcesses()
  }

  async setPlot(plot) {
    await this.setState({ plot })
  }

  async setGroup(group) {
    await this.setState({ group })
  }
  
  async countProcesses() {
    this.setState({counts: null})

    const timeWindow = "SINCE 30 seconds ago"
    const {account, where} = this.state

    if(!account) return

    const whereClause = where ? `WHERE ${where}` : ""
    const select = `uniqueCount(entityAndPid) as processes, uniqueCount(entityGuid) as hosts, uniqueCount(containerId) AS containers`
    const nrql = `SELECT ${select} FROM ProcessSample ${whereClause} ${timeWindow}`
    const counts = (await nrdbQuery(account.id, nrql))[0]
    this.setState({counts})
  }

  render() {
    const {account, counts, accounts} = this.state
    if(!account) return <Spinner/>
    if(accounts.length == 0) return <div>
      <h1>No Data</h1>
      <p>
        Could not find any infrastructure data with container instrumentation. 
        Install New Relic Infrastructure today!
      </p>
    </div>

    return <div style={{height: "100%"}}>
      <Header {...this.state} setAccount={this.setAccount} 
          showFacetPicker={this.showFacetPicker} removeFilter={this.removeFilter} setPlot={this.setPlot}/>
      {counts && <ContainerExplorer {...this.state} addFilter={this.addFilter} removeFilter={this.removeFilter} setPlot={this.setPlot} setGroup={this.setGroup} />}
    </div>
  }
}
