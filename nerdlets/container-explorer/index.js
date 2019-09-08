import React from 'react';
import PropTypes from 'prop-types';
import quote from '../../lib/quote'
import nrdbQuery from '../../lib/nrdb-query'

import FacetPicker from './facet-picker'
import FacetTable from './facet-table'
import ContainerSet from './container-set'
import FilterHeader from './filter-header'
import CountsHeader from './counts-header'

export default class ContainerExplorer extends React.Component {
  static propTypes = {
    nerdletUrlState: PropTypes.object,
    launcherUrlState: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
  };

  constructor(props) {
    super(props)

    this.addFilter = this.addFilter.bind(this)
    this.removeFilter = this.removeFilter.bind(this)

    // TODO add an account picker
    this.state = {
      account: { id: 686435, name: "Container Fabric" },
      filters: []
    }    
  }

  async componentDidMount() {
    // FIXME remove
    await this.addFilter("containerImageName", "cf-registry.nr-ops.net/browser/browser-monitoring-service:release-373")
    this.countProcesses()
  }

  async addFilter(name, value) {
    const {filters} = this.state
    filters.push({name, value})
    await this.setFilters(filters)
  }

  async removeFilter(name, value) {
    let {filters} = this.state
    
    filters = filters.filter(f => !(f.name == name && f.value == value))
    console.log("rremove", filters)
    this.setFilters(filters)
  }

  async setFilters(filters) {
    if(filters == null || filters.length == 0) {
      await this.setState({filters, where: null})
      await this.countProcesses()
    }
    else {
      const where = filters.map(({name, value}) => `${quote(name)} = '${value}'`).join(" AND ")
      await this.setState({filters, where})
      await this.countProcesses()
    }
  }

  async countProcesses() {
    this.setState({counts: {}})
    const timeWindow = "SINCE 30 seconds ago"
    const {where, account} = this.state
    const whereClause = where ? `WHERE ${where}` : ""
    const select = `uniqueCount(entityAndPid) as processes, uniqueCount(entityGuid) as hosts, uniqueCount(containerId) AS containers`
    const nrql = `SELECT ${select} FROM ProcessSample ${whereClause} ${timeWindow}`
    console.log(nrql)
    const counts = (await nrdbQuery(account.id, nrql))[0]
    this.setState({counts})
  }

  render() {
    const { filters, counts } = this.state
    const showFacetPicker = counts && counts.processes > 2000  

    return <div>
      <FilterHeader filters={filters} removeFilter={this.removeFilter}/>
      <CountsHeader {...counts}/>
      {showFacetPicker && <FacetPicker {...this.state} addFilter={this.addFilter}/>}
      {!showFacetPicker && <ContainerSet {...this.state}/>}
    </div>
  }
}
