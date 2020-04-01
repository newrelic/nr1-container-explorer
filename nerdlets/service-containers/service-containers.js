import React from 'react';
import PropTypes from 'prop-types';

import {
  EntityByGuidQuery,
  Grid,
  GridItem,
  Spinner,
  EntityStorageQuery,
  EntityStorageMutation,
} from 'nr1';

import nrdbQuery from '../../lib/nrdb-query';
import { timeRangeToNrql } from '@newrelic/nr1-community';
import findRelatedAccountsWith from '../../lib/find-related-account-with';
import accountsWithData from '../../lib/accounts-with-data';

import ContainerPanel from '../shared/container-panel';
import ContainerHeatMap from './heat-maps';
import NoInfrastructureData from './no-infra-data';

export default class ServiceContainers extends React.Component {
  static propTypes = {
    nerdletUrlState: PropTypes.object,
    launcherUrlState: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this._selectContainer = this._selectContainer.bind(this);
    this.state = {};
  }

  componentDidMount() {
    this.findInfraAccount();
  }

  componentDidUpdate({ nerdletUrlState }) {
    if (nerdletUrlState.entityGuid !== this.props.nerdletUrlState.entityGuid) {
      this.findInfraAccount();
    }
  }

  _selectContainer(containerId) {
    this.setState({ containerId });
  }

  async findInfraAccount() {
    const { entityGuid } = this.props.nerdletUrlState || {};
    const timeRange = timeRangeToNrql(this.props.launcherUrlState);

    let result = await EntityByGuidQuery.query({ entityGuid });
    const entity = result.data.entities[0];
    const nrql = `SELECT uniques(containerId) FROM Transaction 
        WHERE entityGuid = '${entityGuid}' ${timeRange}`;

    // get the container id's that this app runs in
    result = await nrdbQuery(entity.accountId, nrql);
    const containerIds = result.map((r) => r.member);
    this.setState({ containerIds });

    // look up the infrastucture account(s) that are associated with this entity.
    // cache for performance.
    const storageQuery = {
      collection: 'GLOBAL',
      entityGuid,
      documentId: 'infraAccountsData',
    };
    const storageResult = await EntityStorageQuery.query(storageQuery);

    let infraAccounts = storageResult.data && storageResult.data.infraAccounts;

    // find the account(s) that are monitoring these containers. Hopefully there's exactly
    // one, but not, take the account with the most matches.
    if (!infraAccounts && containerIds && containerIds.length > 0) {
      const where = `containerId IN (${containerIds
        .map((cid) => `'${cid}'`)
        .join(',')})`;
      const find = { eventType: 'ProcessSample', where };

      infraAccounts = await findRelatedAccountsWith(find);

      // cache in entity storage
      storageQuery.document = { infraAccounts };
      storageQuery.actionType =
        EntityStorageMutation.ACTION_TYPE.WRITE_DOCUMENT;

      await EntityStorageMutation.mutate(storageQuery);
    }

    if (!infraAccounts || infraAccounts.length === 0) {
      const searchedAccounts = await accountsWithData('ProcessSample');
      this.setState({ accountDataNotFound: true, searchedAccounts, entity });
    } else {
      // use the infra account with the most hits as the primary for this entity, and then
      // store the others otherInfraAccounts so we can show an info box.
      this.setState({
        infraAccount: infraAccounts[0],
        allInfraAccounts: infraAccounts,
        containerIds,
        entity,
        timeRange,
      });
    }
  }

  render() {
    const {
      infraAccount,
      containerId,
      entity,
      timeRange,
      accountDataNotFound,
    } = this.state;

    if (accountDataNotFound) {
      return <NoInfrastructureData entity={entity} />;
    }

    if (!entity || !infraAccount)
      return <Spinner fillContent style={{ width: '100%', height: '100%' }} />;

    return (
      <div id="root">
        <Grid style={{ height: '100%' }}>
          <GridItem columnSpan={7}>
            {/* <ContainerTable {...this.state} selectContainer={this._selectContainer} timeRange={timeRange}/> */}
            <ContainerHeatMap
              {...this.state}
              selectContainer={infraAccount && this._selectContainer}
            />
          </GridItem>
          <GridItem className="content" columnSpan={5}>
            {!infraAccount && <div />}
            {infraAccount && containerId && (
              <ContainerPanel
                account={infraAccount}
                containerId={containerId}
                onClose={() => this.setState({ containerId: null })}
                timeRange={timeRange}
              />
            )}
          </GridItem>
        </Grid>
      </div>
    );
  }
}
