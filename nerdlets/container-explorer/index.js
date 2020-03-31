import React from 'react';
import { nerdlet } from 'nr1';
import ContainerExplorerNerdlet from './container-explorer-nerdlet';

export default class Wrapper extends React.PureComponent {
  constructor(props) {
    super(props);
    nerdlet.setConfig({ timePicker: false });
  }

  render() {
    return <ContainerExplorerNerdlet />;
  }
}
