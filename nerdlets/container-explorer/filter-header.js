import { Stack, StackItem, Button } from 'nr1'

function Filter({ name, value, removeFilter }) {
  return <StackItem className="filter">
    <Stack alignmentType="center">
      <StackItem>
        <p className="name">{name}</p>
        <p className="value">{value}</p>
      </StackItem>
      <StackItem>
        <Button type="plain" iconType="interface_sign_close"
          sizeType="slim" onClick={() => removeFilter(name, value)} />
      </StackItem>
    </Stack>
  </StackItem>
}
export default function FilterHeader({ filters, removeFilter }) {
  return <Stack>
    {filters.map(filterProps => {
      console.log(filterProps)
      return <Filter key={filterProps.name} {...filterProps} removeFilter={removeFilter} />
    })}
  </Stack>
}