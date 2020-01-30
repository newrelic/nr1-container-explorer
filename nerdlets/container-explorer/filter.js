import React from 'react';

import { Icon, Button } from 'nr1';

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
