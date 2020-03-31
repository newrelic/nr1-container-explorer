import React from 'react';
import { PlatformStateContext, NerdletStateContext, AutoSizer } from 'nr1';
import ContainerExplorerNerdlet from './container-explorer-nerdlet';

export default class Wrapper extends React.PureComponent {
  render() {
    return (
      <PlatformStateContext.Consumer>
        {(launcherUrlState) => (
          <NerdletStateContext.Consumer>
            {(nerdletUrlState) => (
              <AutoSizer>
                {({ width, height }) => (
                  <ContainerExplorerNerdlet
                    launcherUrlState={launcherUrlState}
                    nerdletUrlState={nerdletUrlState}
                    width={width}
                    height={height}
                  />
                )}
              </AutoSizer>
            )}
          </NerdletStateContext.Consumer>
        )}
      </PlatformStateContext.Consumer>
    );
  }
}
