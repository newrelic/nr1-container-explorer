import React from 'react';

import { Tabs, TabsItem, Button, navigation } from 'nr1'

import ContainerAttributes from './container-attributes'
import Charts from './container-charts'
import ProcessTable from './process-table'
import RelatedApps from './related-apps'
import LinkedEntity from './linked-entity'

import nrdbQuery from '../../lib/nrdb-query'


function Header(props) {
  const {hostname, containerId, apmApplicationNames, entityGuid, onClose} = props
  const title = `${hostname}: ${containerId.slice(0, 6)}`

  const entity = {
    guid: entityGuid,
    domain: 'INFRA',
    type: 'HOST'
  }
  return <div className="header">
    <Button 
      size="small"
      type="plain"
      onClick={onClose}
      className="close-button" 
      iconType="interface_sign_times_v-alternate"/>
    <h3>{title}</h3>
    <LinkedEntity title="Host" entity={entity} name={hostname}
        icon="hardware-&-software_hardware_server"/>
    <RelatedApps apmApplicationNames={apmApplicationNames}/>
  </div>
}


export default class ContainerPanel extends React.Component {
  componentDidMount() {
    this.load()
  }

  componentDidUpdate({ containerId }) {
    if (containerId != this.props.containerId) {
      this.load()
    }
  }

  async load() {
    this.setState({})
    const { account, containerId } = this.props
    const accountId = account.id

    const where = `containerId = '${containerId}'`
    const timeWindow = 'SINCE 1 minutes ago'
    const nrql = `SELECT entityGuid, hostname, apmApplicationNames from ProcessSample WHERE ${where} LIMIT 1 ${timeWindow}`
    
    const results = (await nrdbQuery(accountId, nrql))[0]

    this.setState({ ...results })
  }

  render() {
    const { entityGuid } = this.state || {}
    if (!entityGuid) return <div />

    const {onSelectAttribute} = this.props

    return <div className="container-panel">
      <Header {...this.props} {...this.state} />
      <Tabs>
        <TabsItem value="summary" label="Tags">
          <ContainerAttributes {...this.props} onSelectAttribute={onSelectAttribute}/>
        </TabsItem>
        <TabsItem value="processes" label="Processes">
          <ProcessTable {...this.props}/>
        </TabsItem>
        <TabsItem value="charts" label="Charts">
          <Charts {...this.props} />
        </TabsItem>
      </Tabs>
    </div>
  }
}