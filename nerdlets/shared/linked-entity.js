import { Button, navigation, Tooltip } from 'nr1'

export default function LinkedEntity({ entity, name, title, icon }) {
  return (
    <div className="section">
      <Tooltip text={'View in Modal'}>
        <Button
          sizeType={Button.SIZE_TYPE.SMALL}
          iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__SERVICE}
          onClick={() => navigation.openStackedEntity(entity.guid)}
          className="entity-explorer-modal-link"
        >
          {name}
        </Button>
      </Tooltip>
      <Tooltip text={'View in Entity Explorer'}>
        <Button
          sizeType={Button.SIZE_TYPE.SMALL}
          iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__DRAG}
          onClick={() => navigation.openEntity(entity.guid)}
          className="entity-explorer-ee-link"
        >
        </Button>
      </Tooltip>
    </div>
  )
}