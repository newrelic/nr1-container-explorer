import React from 'react';
import PropTypes from 'prop-types';

import {EntityByGuidQuery, Grid, GridItem, Spinner, NerdGraphQuery, EntityStorageQuery, EntityStorageMutation} from 'nr1'

import nrdbQuery from '../../lib/nrdb-query'
import timePickerNrql from '../../lib/time-picker-nrql'
import findRelatedAccountsWith from '../../lib/find-related-account-with'


import ContainerPanel from '../shared/container-panel'
import ContainerHeatMap from './heat-maps'

function NoInfrastructureData({accounts}) {
  <div id="root">
  <h3>No Container Data Found</h3>
  <p>
    No container data found after searching across all accounts that this
    package has access to.  Be sure you've deployed the infrastructure Agent
    and that this NerdPack has visibility into that account.
  </p>
  <p>
    We searched the follwing accounts:
  </p>
  <ul>
    {accounts.map(account => {
      return <li key={account.id}>{account.name}</li>
    })}
  </ul>
</div>
}

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
      // workaround for bug in NR1 platform
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
      this.setState({containerIds})

      // look up the infrastucture account(s) that are associated with this entity.
      // cache for performance.
      const storageQuery = {collection: "GLOBAL", entityGuid, documentId: "infraAccounts"}
      const storageResult = await EntityStorageQuery.query(storageQuery)
      let infraAccounts = storageResult.data.actor.entity.nerdStorage.document
      console.log("Cached", infraAccounts)

      // find the account(s) that are monitoring these containers. Hopefully there's exactly
      // one, but not, take the account with the most matches.
      if(!infraAccounts && containerIds && containerIds.length > 0) {
        const where = `containerId IN (${containerIds.map(cid => `'${cid}'`).join(',')})`
        find = {eventType: 'ProcessSample', where}

        infraAccounts = await findRelatedAccountsWith(find)

        // cache in entity storage
        storageQuery.document = infraAccounts
        storageQuery.actionType = EntityStorageMutation.ACTION_TYPE.WRITE_DOCUMENT

        await EntityStorageMutation.mutate(storageQuery)
      }      

      if(!infraAccounts || infraAccounts.lengh == 0) {
        console.log("not found")
        const {data} = await NerdGraphQuery.query({query: `{actor {accounts { name id }}}`}) 
        console.log(data)
        this.setState({accountDataNotFound: true, searchedAccounts: data.actor.accounts})
      }

      // use the infra account with the most hits as the primary for this entity, and then
      // store the others otherInfraAccounts so we can show an info box.
      this.setState({infraAccount: infraAccounts.shift(), otherInfraAccounts: infraAccounts})
      await this.setState({containerIds, entity, timeRange})      
    }

    render() {
      // workaround for bug
      if(this.props.timeRange) return <div/>
      
      const {infraAccount, containerId, entity, timeRange, accountDataNotFound, searchedAccounts} = this.state

      if(accountDataNotFound) {
        return <NoInfrastructureData accounts={searchedAccounts}/>
      }

      if(!entity || !infraAccount) return <Spinner fillContent style={{width: "100%", height: "100%"}}/>
      
      return <div id="root">
        <Grid style={{height: "100%"}}>
          <GridItem columnSpan={7}>
            {/* <ContainerTable {...this.state} selectContainer={this._selectContainer} timeRange={timeRange}/> */}
            <ContainerHeatMap {...this.state} selectContainer={infraAccount && this._selectContainer} />
          </GridItem>
          <GridItem className="content" columnSpan={5}>
            {infraAccount && containerId && <ContainerPanel 
              account={infraAccount} 
              containerId={containerId} 
              onClose={() => this.setState({containerId: null})}
              timeRange={timeRange}/>}
          </GridItem>
        </Grid>
      </div>
    }
}
