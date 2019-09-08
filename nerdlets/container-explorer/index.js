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

    // TODO add an account picker
    this.state = {
      account: { id: 686435, name: "Container Fabric" },
      filters: []
    }    
  }

  componentDidMount() {
    this.countProcesses()
  }

  addFilter(name, value) {
    const {filters} = this.state
    filters.push({name, value})
    this.setFilters(filters)
  }

  removeFilter(name, value) {
    const {filters} = this.state
    
    this.setFilters(filters.filter(f => !(f.name == name && f.value == value)))
  }

  setFilters(filters) {
    if(filters == null || filters.length == 0) {
      this.setState({filters, where: null})
    }
    else {
      const where = filters.map(({name, value}) => `${quote(name)} = '${value}'`).join(" AND ")
      this.setState({filters, where}, () => this.countProcesses())
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
    const showFacetPicker = true

    return <div>
      <FilterHeader filters={filters} removeFilter={this.removeFilter}/>
      <CountsHeader {...counts}/>
      {showFacetPicker && <FacetPicker {...this.state} addFilter={this.addFilter}/>}
    </div>
  }
}
