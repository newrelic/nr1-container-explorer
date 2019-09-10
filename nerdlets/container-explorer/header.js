import { Stack, StackItem, Button } from 'nr1'

function Filter({ name, value, removeFilter }) {
  return <StackItem className="filter">
    <Stack alignmentType="center">
      <StackItem className="name">
        {name}:{" "}
      </StackItem>
      <StackItem className="value">
        {value}
      </StackItem>
      <StackItem>
        <Button type="plain" iconType="interface_sign_close"
          sizeType="small" onClick={() => removeFilter(name, value)} />
      </StackItem>
    </Stack>
  </StackItem>
}

export default function Header(props) {
  const { counts, filters, removeFilter } = props
  return <div className="header">
    <h1>
      {counts.containers} Containers running on {counts.hosts} Hosts
    </h1>
    <Stack className="filter-bar">
      <StackItem>
      </StackItem>
      {filters.map(filterProps => {
        console.log(filterProps)
        return <Filter key={filterProps.name} {...filterProps} removeFilter={removeFilter} />
      })}
    </Stack>
  </div>

}