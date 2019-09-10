import React from 'react';
import PropTypes from 'prop-types';

import {EntityByGuidQuery, NerdGraphQuery, Grid, GridItem, Spinner} from 'nr1'

import nrdbQuery from '../../lib/nrdb-query'
import timePickerNrql from '../../lib/time-picker-nrql'
import findRelatedAccountWith from '../../lib/find-related-account-with'

import ContainerTable from './container-table'
import ContainerPanel from './container-panel'
import ContainerHeatMap from './heat-maps'

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
        const where = `containerId = '${containerIds[0]}'`
        find = {eventType: 'ProcessSample', where}
        findRelatedAccountWith(find, (infraAccount) => {
          console.log("Infra Account", infraAccount)
          this.setState({infraAccount})
        })
      }      

      await this.setState({containerIds, entity, timeRange})      
    }

    render() {
      // workaround for bug
      if(this.props.timeRange) return <div/>
      
      const {infraAccount, containerId, entity, timeRange} = this.state

      if(!entity) return <Spinner fillContent style={{width: "100%", height: "100%"}}/>
      return <div id="root">
        <Grid style={{height: "100%"}}>
          <GridItem columnSpan={7}>
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
