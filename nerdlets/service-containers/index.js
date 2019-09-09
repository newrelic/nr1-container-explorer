import React from 'react';
import PropTypes from 'prop-types';

import {EntityByGuidQuery, NerdGraphQuery, Grid, GridItem, Spinner} from 'nr1'

import nrdbQuery from '../../lib/nrdb-query'
import timePickerNrql from '../../lib/time-picker-nrql'
import ContainerTable from './container-table'
import ContainerPanel from './container-panel'
import ContainerHeatMap from './container-heat-map'

export default class ServiceContainers extends React.Component {
    static propTypes = {
        nerdletUrlState: PropTypes.object,
        launcherUrlState: PropTypes.object,
        width: PropTypes.number,
        height: PropTypes.number,
    };

    constructor(props) {
      super(props)
      
      this._selectContainer = this._selectContainer.bind(this)
      this.state = {}
    }

    _selectContainer(containerId) {
      this.setState({containerId})
    }

    async componentDidMount() {
      // workaround for bug
      if(this.props.timeRange) return

      const {entityGuid} = this.props.nerdletUrlState || {}
      console.log("Guid", entityGuid, this.props)

      const timeRange = timePickerNrql(this.props)

      let result
      result = await EntityByGuidQuery.query({entityGuid})

      const entity = result.data.actor.entities[0]
      const nrql = `SELECT uniques(containerId) FROM Transaction 
        WHERE entityGuid = '${entityGuid}' ${timeRange}`

      // get the container id's that this app runs in
      result = await nrdbQuery(entity.accountId, nrql) 
      const containerIds = result.map(r => r.member)

      if(containerIds && containerIds.length > 0) {
        this.findAccountWithContainerInfraData(containerIds[0])
      }

      await this.setState({containerIds, entity, timeRange})      
    }

    async findAccountWithContainerInfraData(containerId) {

      // find the accounts with SystemSample Data reporting
      const gql = `{actor {accounts {name id reportingEventTypes(filter:["ProcessSample"])}}}`
      let result = await NerdGraphQuery.query({query: gql})
      // console.log("GQL Result", JSON.stringify(result))
      const accounts = result.data.actor.accounts.filter(a => a.reportingEventTypes.length > 0)

      // run these (low impact 1 minute) queries in parallel to find
      // which account has data for this container
      const nrql = `SELECT count(*) FROM ProcessSample WHERE containerId = '${containerId}' SINCE 1 minute ago`
      accounts.forEach(account => {
        return nrdbQuery(account.id, nrql).then(results => {
          if(results[0].count > 0) {
            this.setState({infraAccount: account})
          }
        })
      })
    }

    render() {
      // workaround for bug
      if(this.props.timeRange) return <div/>
      
      const {infraAccount, containerId, entity, timeRange} = this.state

      if(!entity) return <Spinner fillContent style={{width: "100%", height: "100%"}}/>
      return <div id="root">
        <h1>Containers</h1>        
        <Grid style={{height: "100%"}}>
          <GridItem className="content" columnSpan={7}>
            {/* <ContainerTable {...this.state} selectContainer={this._selectContainer} timeRange={timeRange}/> */}
            <ContainerHeatMap {...this.state} selectContainer={infraAccount && this._selectContainer} />
          </GridItem>
          <GridItem className="content" columnSpan={5}>
            {infraAccount && containerId && 
              <ContainerPanel account={infraAccount} containerId={containerId} timeRange={timeRange}/>
            }
          </GridItem>
        </Grid>
      </div>
    }
}
