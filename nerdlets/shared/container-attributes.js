import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'nr1';

import nrdbQuery from '../../lib/nrdb-query';
import getCardinality from '../../lib/get-cardinality';

/*
 * these attributes are omitted for one of the following reasons:
 *  - applies to a specific process, not the whole conatiner
 *  - appears in summary header already
 *  - needless duplicate(hostname, entityname, fqdn, etc.)
 */
const OMIT_ATTRIBUTES = {
  agentName: true,
  criticalViolationCount: true,
  parentProcessId: true,
  'nr.entityType': true,
  processDisplayName: true,
  entityAndPid: true,
  commandLine: true,
  commandName: true,
  entityKey: true,
  entityName: true,
};

function Attribute({ name, value, onSelectAttribute }) {
  const onClick = onSelectAttribute && (() => onSelectAttribute(name, value));
  const isClickable = onClick ? 'clickable' : '';
  return (
    <li onClick={onClick}>
      <span className="name">{name}</span>
      <span className={`value ${isClickable}`}>{value}</span>
    </li>
  );
}
Attribute.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  onSelectAttribute: PropTypes.func,
};

export default class ContainerAttributes extends React.Component {
  static propTypes = {
    account: PropTypes.object,
    containerId: PropTypes.string,
    onSelectAttribute: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      attributes: [],
    };
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate({ containerId }) {
    if (containerId !== this.props.containerId) {
      this.load();
    }
  }

  async load() {
    this.setState({ attributes: [] });
    const { account, containerId } = this.props;
    const accountId = account.id;

    const where = `containerId = '${containerId}'`;
    const timeWindow = 'SINCE 15 minutes ago';
    const facets = await getCardinality({
      accountId,
      where,
      timeWindow,
      eventType: 'ProcessSample',
    });

    let attributes = facets.filter(
      (f) => f.count === 1 && !OMIT_ATTRIBUTES[f.name]
    );
    attributes = attributes.sort((x, y) => x.name.localeCompare(y.name));
    const nrql = `SELECT * from ProcessSample WHERE ${where} LIMIT 1 ${timeWindow}`;
    const results = (await nrdbQuery(accountId, nrql))[0];

    attributes.forEach((attr) => {
      attr.value = results[attr.name];
    });
    this.setState({ attributes });
  }

  render() {
    const { attributes } = this.state;
    if (attributes.length === 0) return <Spinner fillContent />;

    const { onSelectAttribute } = this.props;

    return (
      <div className="container-summary-view">
        <h3>{name}</h3>
        <ul className="tags">
          {attributes.map((attr) => {
            return (
              <Attribute
                key={attr.name}
                {...attr}
                onSelectAttribute={onSelectAttribute}
              />
            );
          })}
        </ul>
      </div>
    );
  }
}
