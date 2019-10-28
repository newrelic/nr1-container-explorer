import { Button, navigation } from 'nr1'

export default function LinkedEntity({ entity, icon }) {
  return (
    <div className="section">
      <Button
        sizeType={Button.SIZE_TYPE.SMALL}
        type={Button.TYPE.PLAIN}
        onClick={() => navigation.openStackedEntity(entity.guid)}
        className="entity-explorer-modal-link"
      >
        View in Modal
      </Button>
      <Button
        sizeType={Button.SIZE_TYPE.SMALL}
        type={Button.TYPE.PLAIN}
        onClick={() => navigation.openEntity(entity.guid)}
        className="entity-explorer-ee-link"
      >
        View in Entity Explorer
      </Button>
    </div>
  )
}