import React from 'react';
import PropTypes from 'prop-types';
import { Button, navigation, Tooltip } from 'nr1';

const entityTypeToIcon = function (entityType) {
  const map = {
    APPLICATION: Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION,
    HOST: Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__HARDWARE__SERVER,
    SERVICE: Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__SERVICE,
  };

  const defaultIcon = map.HOST;
  const icon = map[entityType] || defaultIcon;

  if (!map[entityType]) {
    // eslint-disable-next-line no-console
    console.warn(`No icon found for Entity Type: ${entityType}`);
  }

  return icon;
};

export default function LinkedEntity({ entity, name }) {
  return (
    <div className="section">
      <Tooltip text="View in Modal">
        <Button
          sizeType={Button.SIZE_TYPE.SMALL}
          iconType={entityTypeToIcon(entity.type)}
          onClick={() => navigation.openStackedEntity(entity.guid)}
          className="entity-explorer-modal-link"
        >
          {name}
        </Button>
      </Tooltip>
      <Tooltip text="View in Entity Explorer">
        <Button
          sizeType={Button.SIZE_TYPE.SMALL}
          iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__DRAG}
          onClick={() => navigation.openEntity(entity.guid)}
          className="entity-explorer-ee-link"
        />
      </Tooltip>
    </div>
  );
}

LinkedEntity.propTypes = {
  entity: PropTypes.object,
  name: PropTypes.string,
};
