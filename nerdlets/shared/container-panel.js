import React from 'react';

import { Tabs, TabsItem, Button, navigation } from 'nr1'

import ContainerAttributes from './container-attributes'
import Charts from './container-charts'
import nrdbQuery from '../../lib/nrdb-query'


function Header(props) {
  const {hostname, containerId, entityGuid, onClose} = props
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
    <div className="section">
      <span className="title">Host</span>
      <Button sizeType="small" type="plain" 
          iconType="hardware-&-software_hardware_server" 
          onClick={() => navigation.openStackedEntity(entity)}>
        {hostname}
      </Button>
      <Button sizeType="small" type="plain" 
          iconType="interface_operations_drag" 
          onClick={() => navigation.openEntity(entity)}/>
    </div>
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
    const nrql = `SELECT entityGuid, hostname from ProcessSample WHERE ${where} LIMIT 1 ${timeWindow}`
    const results = (await nrdbQuery(accountId, nrql))[0]

    this.setState({ ...results })
  }

  render() {
    const { entityGuid } = this.state || {}
    if (!entityGuid) return <div />

    return <div className="container-panel">
      <Header {...this.props} {...this.state} />
      <Tabs>
        <TabsItem value="summary" label="Tags">
          <ContainerAttributes {...this.props} />
        </TabsItem>
        <TabsItem value="processes" label="Processes">
          <h2>Processes</h2>
        </TabsItem>
        <TabsItem value="charts" label="Charts">
          <Charts {...this.props} />
        </TabsItem>
      </Tabs>
    </div>
  }
}