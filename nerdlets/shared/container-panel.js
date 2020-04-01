import React from 'react';
import PropTypes from 'prop-types';

import { Tabs, TabsItem, Button, Icon } from 'nr1';

import ContainerAttributes from './container-attributes';
import Charts from './container-charts';
import ProcessTable from './process-table';
import RelatedApps from './related-apps';
import LinkedEntity from './linked-entity';

import nrdbQuery from '../../lib/nrdb-query';

class Header extends React.Component {
  static propTypes = {
    hostname: PropTypes.string,
    containerId: PropTypes.string,
    apmApplicationNames: PropTypes.array,
    entityGuid: PropTypes.string,
    onClose: PropTypes.func,
    showRelatedApps: PropTypes.bool,
    toggleDetailPanel: PropTypes.func,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {
      hostname,
      containerId,
      apmApplicationNames,
      entityGuid,
      onClose,
      showRelatedApps,
    } = this.props;
    const title = `${hostname}: ${containerId.slice(0, 6)}`;

    const entity = {
      guid: entityGuid,
      domain: 'INFRA',
      type: 'HOST',
    };
    return (
      <div className="header">
        <Button
          size="small"
          type={Button.TYPE.PLAIN}
          onClick={onClose}
          className="close-button"
          iconType={Button.ICON_TYPE.INTERFACE__SIGN__TIMES__V_ALTERNATE}
        />
        <h3>{title}</h3>
        <LinkedEntity title="Host" entity={entity} name={hostname} />
        {showRelatedApps && (
          <RelatedApps apmApplicationNames={apmApplicationNames} />
        )}
        <span
          className="minimize-button"
          onClick={() => this.props.toggleDetailPanel()}
        >
          <Icon
            type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT__WEIGHT_BOLD}
            color="#000E0E"
            sizeType={Icon.SIZE_TYPE.SMALL}
          />
        </span>
      </div>
    );
  }
}

export default class ContainerPanel extends React.Component {
  static propTypes = {
    account: PropTypes.object,
    containerId: PropTypes.string,
    onSelectAttribute: PropTypes.func,
  };

  componentDidMount() {
    this.load();
  }

  componentDidUpdate({ containerId }) {
    if (containerId !== this.props.containerId) {
      this.load();
    }
  }

  async load() {
    this.setState({});
    const { account, containerId } = this.props;
    const accountId = account.id;

    const where = `containerId = '${containerId}'`;
    const timeWindow = 'SINCE 1 minutes ago';
    const nrql = `SELECT entityGuid, hostname, apmApplicationNames from ProcessSample WHERE ${where} LIMIT 1 ${timeWindow}`;

    const results = (await nrdbQuery(accountId, nrql))[0];

    this.setState({ ...results });
  }

  render() {
    const { entityGuid } = this.state || {};
    if (!entityGuid) return <div />;

    const { onSelectAttribute } = this.props;

    return (
      <div className="container-panel">
        <Header {...this.props} {...this.state} />
        <Tabs>
          <TabsItem value="summary" label="Tags">
            <ContainerAttributes
              {...this.props}
              onSelectAttribute={onSelectAttribute}
            />
          </TabsItem>
          <TabsItem
            className="process-table-tab"
            value="processes"
            label="Processes"
          >
            <ProcessTable {...this.props} />
          </TabsItem>
          <TabsItem className="charts-tab" value="charts" label="Charts">
            <Charts {...this.props} />
          </TabsItem>
        </Tabs>
      </div>
    );
  }
}
