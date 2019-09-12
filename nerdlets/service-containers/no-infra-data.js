
import {BlockText} from 'nr1'

export default function NoInfrastructureData({ accounts, entity }) {
  return <div style={{marginLeft: "12px", marginTop: "12px"}}>
    <h2>No Container Data</h2>
    <BlockText type="paragraph">
      We couldn't find any infrastructure data correlated with this app. This could be 
      because this service is not running inside a container, or possibly you do not
      have visibility into a separate New Relic account that has the related infrastructure data.
    </BlockText>
  </div>
}
