import { Button, navigation } from 'nr1'

export default function LinkedEntity({ title, entity, name, icon }) {
  return <a className="entity-explorer-link" href="#" onClick={() => navigation.openStackedEntity(entity.guid)}>View in Entity Explorer</a>
}