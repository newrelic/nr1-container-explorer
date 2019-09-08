import React from 'react'
import { Spinner, Grid, GridItem } from 'nr1'

import getCardinality from '../../lib/get-cardinality'


import FacetTable from './facet-table'

const OMIT_KEYS = {
  systemMemoryBytes: true,
  apmApplicationIds: true,
  containerId: true,
  commandLine: true,
  commandName: true,  
  processId: true
}

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

    let facet = "containerImageName"
    let facets = await getCardinality({accountId: account.id, 
      eventType: "ProcessSample",
      where, timeWindow
    })
    facets = facets.filter(facet => {
    
      return facet.count > 1 && facet.count < 10000 && !OMIT_KEYS[facet.name]
    })

    facets.sort((f1, f2) => f1.name.localeCompare(f2.name))
    this.setState({ facets, facet })
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