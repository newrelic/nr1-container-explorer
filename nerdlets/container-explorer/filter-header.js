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
export default function FilterHeader(props) {
  const { counts, filters, removeFilter, showFacetPicker } = props
  console.log(props)
  return <Stack>
    <StackItem>
      <h2>
        {counts.containers} Containers<br/> 
        {counts.hosts} Hosts
      </h2>
    </StackItem>
    {filters.map(filterProps => {
      console.log(filterProps)
      return <Filter key={filterProps.name} {...filterProps} removeFilter={removeFilter} />
    })}
    <StackItem>
      <Button iconType="interface_operations_filter_a-add" onClick={showFacetPicker}>
        Add A Filter
      </Button>
    </StackItem>
  </Stack>
}