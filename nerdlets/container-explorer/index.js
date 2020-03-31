import React from 'react';
import { PlatformStateContext, NerdletStateContext } from 'nr1';
import ContainerExplorerNerdlet from './container-explorer-nerdlet';

export default class Wrapper extends React.PureComponent {
  render() {
    return (
      <PlatformStateContext.Consumer>
        {(launcherUrlState) => (
          <NerdletStateContext.Consumer>
            {(nerdletUrlState) => (
              <ContainerExplorerNerdlet
                launcherUrlState={launcherUrlState}
                nerdletUrlState={nerdletUrlState}
              />
            )}
          </NerdletStateContext.Consumer>
        )}
      </PlatformStateContext.Consumer>
    );
  }
}
