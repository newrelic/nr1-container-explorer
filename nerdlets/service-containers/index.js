import React from 'react';
import { PlatformStateContext, NerdletStateContext, AutoSizer } from 'nr1';
import ServiceContainers from './service-containers';

export default class Wrapper extends React.PureComponent {
  render() {
    return (
      <PlatformStateContext.Consumer>
        {(launcherUrlState) => (
          <NerdletStateContext.Consumer>
            {(nerdletUrlState) => (
              <AutoSizer>
                {({ width, height }) => (
                  <ServiceContainers
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
