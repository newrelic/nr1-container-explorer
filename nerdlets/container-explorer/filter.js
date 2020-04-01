import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from 'nr1';

export default function Filter(props) {
  const { name, value, removeFilter } = props;

  return (
    <div className="filter">
      <span className="filter-name">{name}: </span>
      <span className="filter-value">{value}</span>
      <span
        className="filter-remove-btn"
        onClick={() => removeFilter(name, value)}
      >
        <Icon type={Icon.TYPE.INTERFACE__SIGN__CLOSE} />
      </span>
    </div>
  );
}
Filter.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  removeFilter: PropTypes.func,
};
