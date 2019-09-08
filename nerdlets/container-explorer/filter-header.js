import {Stack, StackItem} from 'nr1'

function Filter({name, value, removeFilter}) {
  return <StackItem className="filter" onClick={() => removeFilter(name, value)}>
    <p className="name">{name}</p>
    <p className="value">{value}</p>
  </StackItem>
}
export default function FilterHeader({filters, removeFilter}) {
  return <Stack>
    {filters.map(filterProps => {
      console.log(filterProps)
      return <Filter key={filterProps.name} {...filterProps} removeFilter={removeFilter}/>
    })}
  </Stack>
}