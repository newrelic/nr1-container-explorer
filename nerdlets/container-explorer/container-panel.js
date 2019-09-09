import React from 'react'

import nrdbQuery from '../../lib/nrdb-query'

export default class ContainerPanel extends React.Component {

  getNrql(select) {
    const {containerId} = this.props
    return `SELECT ${select} FROM ProcessSample WHERE containerId = '${containerId}'`
  }
  
  async componentDidMount() {
    const {account} = this.props

    const select = [
      'hostname',
      'entityGuid',
      'containerImageName'      
    ].map(s => `latest(${s}) AS '${s}'`).join(',')
    
    const results = await nrdbQuery(account.id, this.getNrql(select))
    console.log(results)
    this.setState({results})
  }

  render () {
    return <h1>{this.props.containerId.slice(0,6)}...</h1>
  }


}