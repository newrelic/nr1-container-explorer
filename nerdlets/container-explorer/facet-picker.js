import React from 'react'
import { Spinner, Grid, GridItem } from 'nr1'

import nrdbQuery from '../../lib/nrdb-query'
import quote from '../../lib/quote'

import FacetTable from './facet-table'

function FacetList({ facets, facet, setFacet }) {
  return <div className="facet-picker-container">
    <h3>Segment</h3>
    <div>
      <ul className="facet-list">
        {facets.map(f => {
          const className = f.name == facet ? "selected" : ""
          return <li key={f.name} className={className} onClick={() => setFacet(f.name)}>
            {f.name} ({f.count})
          </li>
        })}
      </ul>
    </div>
  </div>
}

export default class FacetPicker extends React.Component {
  constructor(props) {
    super(props)

    this.setFacet = this.setFacet.bind(this)
    this.setFacetValue = this.setFacetValue.bind(this)
  }

  setFacet(facet) {
    this.setState({ facet })
  }

  setFacetValue(facetValue) {
    const {facet} = this.state
    this.props.addFilter(facet, facetValue)
    this.setState({facet: null})
  }

  componentDidMount() {
    this.loadFacets()
  }

  componentDidUpdate({account, where}) {
    if(account != this.props.account || where != this.props.where) {
      this.loadFacets()
    }
  }

  async loadFacets() {
    this.setState({facets: null})
    const timeWindow = "SINCE 30 seconds ago"
    const { account, where } = this.props
    const whereClause = where ? "WHERE " + where : ''
    const keySet = (await nrdbQuery(account.id, `SELECT keySet() FROM ProcessSample ${whereClause} ${timeWindow}`))
      .filter(key => key.type == 'string')//.slice(0, 30)

    const batchSize = 50
    const facets = []
    for (var i = 0; i < keySet.length; i += batchSize) {
      const batch = keySet.slice(i, i + batchSize)
      const select = batch.map(key => `uniqueCount(${quote(key.key)}) AS '${key.key}'`)
      const nrql = `SELECT ${select} FROM ProcessSample ${whereClause} ${timeWindow}`

      const uniqueCounts = (await nrdbQuery(account.id, nrql))[0]
      Object.keys(uniqueCounts).forEach(key => {
        const count = uniqueCounts[key]
        if (count > 1 && count < 5000 && key != "systemMemoryBytes") {
          facets.push({ name: key, count })
        }
      })
    }
    facets.sort((f1, f2) => f1.name.localeCompare(f2.name))
    this.setState({ facets })
  }

  render() {
    const { facets, facet } = this.state || {}
    if (!facets) return <Spinner fillContainer />

    return <Grid className="fillHeight">
      <GridItem columnSpan={3} className="fillHeight">
        <FacetList facets={facets} facet={facet} setFacet={this.setFacet} />
      </GridItem>
      <GridItem columnSpan={9} className="fillHeight">
        {facet && <FacetTable {...this.props} facet={facet} setFacetValue={this.setFacetValue}/>}
      </GridItem>
    </Grid>
  }
}