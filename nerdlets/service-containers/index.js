import React from 'react';
import { PlatformStateContext, NerdletStateContext } from 'nr1';
import ServiceContainers from './service-containers';

export default class Wrapper extends React.PureComponent {
  render() {
    return (
      <PlatformStateContext.Consumer>
        {(launcherUrlState) => (
          <NerdletStateContext.Consumer>
            {(nerdletUrlState) => (
              <ServiceContainers
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
