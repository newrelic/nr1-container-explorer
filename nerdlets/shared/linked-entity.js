import { Button, navigation } from 'nr1'

export default function LinkedEntity({ title, entity, name, icon }) {
  return <div className="section">
    {/* <span className="title">{title}</span> */}
    <Button sizeType="small" type="plain"
      iconType={icon}
      onClick={() => navigation.openStackedEntity(entity)}>
      {name}
    </Button>
    <Button sizeType="small" type="plain"
      iconType="interface_operations_drag"
      onClick={() => navigation.openEntity(entity)} />
  </div>
}