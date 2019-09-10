import { NrqlQuery, Tooltip } from 'nr1'
import PropTypes from 'prop-types';
import _ from 'underscore'

import heatMapColor from '../lib/heat-map-color'

/**
 * # Heatmap
 * 
 * component that makes it super easy to visualize a large number data set
 * with a singler faceted NRQL query.
 * 
 * # Examples
 * ```js
 * // single heatmap of Transaction throughput across all hosts
 * <HeatMap accountId={1} nrql={"SELECT count(*) FROM PageView facet host LIMIT 2000"}/>
 *
 * // list of heatmaps of Transaction throughput for all hosts grouped by appName
 * <HeatMap accountId={1} nrql={"SELECT count(*) FROM PageView facet host, appName LIMIT 2000"}/>
 * ```
 * 
 * If 2 facets are provided, a list of grouped heatmaps will be rendered.
 */
export default class Heatmap extends React.Component {
  static propTypes = {
    /**
     * accountId for the data to be presented
     */
    accountId: PropTypes.number.isRequired,

    /**
     * query MUST select a single numerical value
     * and facet by one or two dimensions. If 2
     * dimensions are provided, a list of heatmaps
     * will be presented, grouped by the first dimension.
     * 
     * Examples:
     *  ```js
     *  // single heatmap with one cell per hostname
     *  nrql="SELECT count(*) FROM Transaction facet hostname"
     * 
     *  // list of heatmaps grouped by appName, then showing
     *  // one map for every appId, and one cell for each hostname
     *  nrql="SELECT count(*) FROM Transaction facet appName, hostname"
     *  ```
     */
    nrql: PropTypes.string.isRequired,

    /**
     * title for the heatmap. If a 2 dimensional query is provided,
     * this is ignored and each nested map will use the facet's value
     * as its title.
     */
    title: PropTypes.string,

    /**
     * default max value for "100%". If any value returned by the query exceeds this,
     * then max is bumped up to that maximum.
     */
    max: PropTypes.number,

    /**
     * callback when a node is selected, with that node's value (facet name)
     */
    onSelect: PropTypes.func,

    /**
     * selected node (facet name). caller to manage selection state. 
     */
    selection: PropTypes.string,

    /**
     * callback for formatting the tooltip that appears over a node. Example
     * ```js
     * formatLabel=({name, value} => `${name}: ${Math.round(value*100)}%`)
     * ```
     */
    formatLabel: PropTypes.func,
  }

  render() {
    let { accountId, nrql, max } = this.props

    return <NrqlQuery accountId={accountId} query={nrql}
              formatType={NrqlQuery.FORMAT_TYPE.RAW}>
      {({ loading, error, data }) => {
        if (loading) return <div />
        if (error) return <pre>{error}</pre>
        if (!data.facets) {
          console.log("Bad result", nrql, error, data)
        }
  
        const preparedData = prepare({data, max})
        
        // if facet is a string, then render a single heatmap;
        // otherwise render a group of them
        if(!preparedData.isMultiFacet) {
          return <SingleHeatmap {...this.props} {...preparedData}/>
        }
        else {
          return <GroupedHeatMap {...this.props} {...preparedData}/>
        }
      }}
    </NrqlQuery>
  }
}


function Node(props) {
  const { name, value, max, selected, onClick, formatLabel } = props

  const normalizedValue = Math.max(Math.min(value / max, 1), 0)
  const color = heatMapColor(normalizedValue)
  const toolTipText = formatLabel ? formatLabel({ name, value }) : `${name}: ${value}`
  const className = `node ${selected && 'selected'}`

  return <Tooltip text={toolTipText}>
    <div className={className} style={{ backgroundColor: color }} onClick={onClick} />
  </Tooltip>
}

function SingleHeatmap(props) {
  const { title, formatLabel, selection, onSelect, data, max } = props

  return <div className="heat-map">
    <div className="header">
      <div className="title">
        {title}
      </div>
    </div>
    <div className="grid">
      {data.map(datum => {        
        const selected = datum.name == selection
        return <Node formatLabel={formatLabel} {...datum} selected={selected}
          max={max} onClick={() => onSelect(datum.name)} />
      })}
    </div>
  </div>
}

function GroupedHeatMap(props) {
  const { data } = props

  const groups = _.groupBy(data, 'group')
  const groupNames = _.keys(groups).sort()

  return <div>
    {groupNames.map(groupName => {
      const group = groups[groupName]
      return <SingleHeatmap {...props} data={group} title={groupName}/>
    })}
  </div>
}

function prepare({data, max}) {
  max = max || 0
  const isMultiFacet = Array.isArray(data.metadata.facet)

  data = data.facets.map(facet => {
    const value = Object.values(facet.results[0])[0]
    if(value > max) max = value

    let name = isMultiFacet ? facet.name[1] : facet.name
    if(!name) name = "<N/A>"
    const dataPoint = {name, value}

    if(isMultiFacet) {
      dataPoint.group = facet.name[0]
    }
    return dataPoint    
  })
  data = _.sortBy(data, "name")
  return {data, max, isMultiFacet}
}

