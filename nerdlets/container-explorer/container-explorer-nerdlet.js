import React from 'react';
import { EmptyState, Icon, nerdlet, Spinner } from 'nr1';

import { HelpModal, Messages } from '@newrelic/nr-labs-components';

import quote from '../../lib/quote';
import nrdbQuery from '../../lib/nrdb-query';
import findRelatedAccountsWith from '../../lib/find-related-account-with';

import ContainerExplorer from './container-explorer';
import Header from './header';

import PLOTS from '../../lib/plots';

export default class ContainerExplorerNerdlet extends React.Component {
  constructor(props) {
    super(props);

    this.addFilter = this.addFilter.bind(this);
    this.removeFilter = this.removeFilter.bind(this);
    this.setAccount = this.setAccount.bind(this);
    this.setPlot = this.setPlot.bind(this);
    this.setGroup = this.setGroup.bind(this);
    this.removeAllFilters = this.removeAllFilters.bind(this);

    this.state = {
      filters: [],
      plot: PLOTS[0],
      helpModalOpen: false,
    };
  }

  async componentDidMount() {
    nerdlet.setConfig({
      actionControls: true,
      actionControlButtons: [
        {
          label: 'Help',
          hint: 'Quick links to get support',
          type: 'primary',
          iconType: Icon.TYPE.INTERFACE__INFO__HELP,
          onClick: () => this.setHelpModalOpen(true),
        },
      ],
    });

    const find = {
      eventType: 'ProcessSample',
      where: 'containerId IS NOT NULL',
      timeWindow: 'SINCE 1 minute ago',
    };
    const accounts = await findRelatedAccountsWith(find);
    await this.setState({ accounts, account: accounts[0] });

    if (accounts.length > 0) {
      this.countProcesses();
    }
  }

  async addFilter(name, value) {
    const { filters } = this.state;
    filters.push({ name, value });
    await this.setFilters(filters);
  }

  async removeFilter(name, value) {
    let { filters } = this.state;

    filters = filters.filter((f) => !(f.name === name && f.value === value));
    this.setFilters(filters);
  }

  removeAllFilters() {
    this.setFilters([]);
  }

  async setFilters(filters) {
    let where = null;
    if (filters != null && filters.length > 0) {
      where = filters
        .map(({ name, value }) => `${quote(name)} = '${value}'`)
        .join(' AND ');
    }

    this.setState({ filters, where }, this.countProcesses);
  }

  async setAccount(account) {
    this.setState(
      { account, filters: [], where: null, counts: null },
      this.countProcesses
    );
  }

  async setPlot(plot) {
    this.setState({ plot });
  }

  async setGroup(group) {
    this.setState({ group });
  }

  async countProcesses() {
    this.setState({ counts: null });

    const timeWindow = 'SINCE 30 seconds ago';
    const { account, where } = this.state;

    if (!account) return;

    const whereClause = where ? `WHERE ${where}` : '';
    const select = `uniqueCount(entityAndPid) as processes, uniqueCount(entityGuid) as hosts, uniqueCount(containerId) AS containers`;
    const nrql = `SELECT ${select} FROM ProcessSample ${whereClause} ${timeWindow}`;
    const counts = (await nrdbQuery(account.id, nrql))[0];
    this.setState({ counts });
  }

  setHelpModalOpen = (helpModalOpen) => {
    this.setState({ helpModalOpen });
  };

  render() {
    const { counts, accounts, helpModalOpen } = this.state;

    if (!accounts) {
      return <Spinner />;
    }

    if (accounts.length === 0) {
      return (
        <EmptyState
          fullHeight
          iconType={EmptyState.ICON_TYPE.DATAVIZ__DATAVIZ__SERVICE_MAP_CHART}
          title="No Data"
          description="Could not find any infrastructure data with container instrumentation."
          additionalInfoLink={{
            label: 'Install New Relic Infrastructure today!',
            to: 'https://newrelic.com/products/infrastructure',
          }}
        />
      );
    }

    return (
      <div style={{ height: '100%' }}>
        <Messages repo="nr1-container-explorer" branch="main" />
        <Header
          {...this.state}
          setAccount={this.setAccount}
          showFacetPicker={this.showFacetPicker}
          removeFilter={this.removeFilter}
          removeAllFilters={this.removeAllFilters}
          setPlot={this.setPlot}
        />
        {counts && (
          <ContainerExplorer
            {...this.state}
            addFilter={this.addFilter}
            removeFilter={this.removeFilter}
            setPlot={this.setPlot}
            setGroup={this.setGroup}
          />
        )}
        <HelpModal
          isModalOpen={helpModalOpen}
          setModalOpen={this.setHelpModalOpen}
          urls={{
            docs: 'https://github.com/newrelic/nr1-container-explorer#readme',
            createIssue:
              'https://github.com/newrelic/nr1-container-explorer/issues/new?assignees=&labels=bug%2C+needs-triage&template=bug_report.md&title=',
            createFeature:
              'https://github.com/newrelic/nr1-container-explorer/issues/new?assignees=&labels=enhancement%2C+needs-triage&template=enhancement.md&title=',
            createQuestion:
              'https://github.com/newrelic/nr1-container-explorer/discussions/new/choose',
          }}
          ownerBadge={{
            logo: {
              src: 'https://drive.google.com/thumbnail?id=1BdXVy2X34rufvG4_1BYb9czhLRlGlgsT',
              alt: 'New Relic Labs',
            },
            blurb: {
              text: 'This is a New Relic Labs open source app.',
              link: {
                text: 'Take a look at our other repos',
                url: 'https://github.com/newrelic?q=nrlabs-viz&type=all&language=&sort=',
              },
            },
          }}
        />
      </div>
    );
  }
}
