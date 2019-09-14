import { Button, navigation } from 'nr1'

export default function LinkedEntity({ title, entity, name, icon }) {
  return <div className="section">
    {/* <span className="title">{title}</span> */}
    <Button sizeType={Button.SIZE_TYPE.SMALL} type={Button.TYPE.PLAIN}
      iconType={icon}
      onClick={() => navigation.openStackedEntity(entity.guid)}>
      {name}
    </Button>
    <Button sizeType={Button.SIZE_TYPE.SMALL} type={Button.TYPE.PLAIN}
      iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__DRAG}
      onClick={() => navigation.openEntity(entity.guid)} />
  </div>
}