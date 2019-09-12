import React from 'React'
import {Grid, GridItem, Spinner} from 'nr1' 
import _ from 'underscore'

import getCardinality from '../../lib/get-cardinality'
import timePickerNrql from '../../lib/time-picker-nrql'

import FacetTable from './facet-table'
import ContainerPanel from '../shared/container-panel'
import ContainerHeatMap from './container-heat-map'

const OMIT_KEYS = {
  systemMemoryBytes: true,
  apmApplicationIds: true,
  containerId: true,
  commandLine: true,
  commandName: true,  
  processId: true
}

function GroupList({ groups, group, selectGroup, showNone }) {  
  return <div className="facet-list">
    <h3>Group By</h3>
    <ul>
    {showNone && <li className='facet' key="__none" onClick={() => selectGroup(null)}>
      <em>None: Show CPU, Disk and IO</em>
    </li>}    
    {groups.map(g => {
      const className = `facet ${g.name == group && 'selected'}`
      return <li className={className} key={g.name} onClick={() => selectGroup(g.name)}>
        {g.name} ({g.count})
      </li>
    })}
  </ul>
  </div>
}

export default class ContainerExplorer extends React.Component {
  constructor(props) {
    super(props)

    this.selectContainer = this.selectContainer.bind(this)
  }

  async componentDidMount() {
    await this.reload()    
  }

  componentWillUnmount() {
    if(this.interval) clearInterval(this.interval)
  }

  async componentDidUpdate({where, account}) {
    if(where != this.props.where || account != this.props.account) {
      await this.reload()
    }
  }

  async reload() {
    clearInterval(this.interval)
    this.interval = null

    const startTime = new Date()
    function logTime(message) {
      const elapsed = new Date() - startTime
      // console.log("Reload", message, elapsed)
    }
    logTime("Start Reload")

    this.setState({groups: null})
    const {where, account, counts} = this.props
    const timeWindow = "SINCE 3 minutes ago"

    const facets = await getCardinality({
      eventType: 'ProcessSample',
      accountId: account.id,
      where,
      timeWindow
    })
    logTime("getCardinality")

    const groups = facets.filter(facet => {
      return facet.count > 1 && facet.count < counts.containers * .6 && !OMIT_KEYS[facet.name]      
    })

    this.setState({groups: _.sortBy(groups, 'name')})
  }

  selectContainer(containerId) {
    this.setState({containerId})
  }

  render() {
    const {addFilter, counts, account} = this.props
    const {groups, group, containerId} = this.state || {}
    const tooMany = counts.containers > 2000

    if(!groups) return <Spinner fillContainer/>
    const timeRange = timePickerNrql(this.props)

    return <div className='content'>
      <Grid>
        <GridItem columnSpan={8}>
          {!tooMany && groups && <ContainerHeatMap {...this.props} {...this.state} 
            selectContainer={this.selectContainer}
            setFacetValue={(value) => addFilter(group, value)}
            />}
          {tooMany && <FacetTable 
              group="containerImageName"  // if none provided, default to this. state will override.
              {...this.props} {...this.state}
            setFacetValue={(value) => addFilter(group || "containerImageName", value)}/>}
        </GridItem>
        <GridItem columnSpan={4}>
          {containerId && <ContainerPanel account={account} containerId={containerId} timeRange={timeRange}
              showRelatedApps onClose={() => this.setState({containerId: null})}/>}
          {!containerId && groups && <GroupList groups={groups} group={group} showNone={!tooMany}
            selectGroup={(group)=> this.setState({group})}/>}
        </GridItem>
      </Grid>
    </div>
  }

}