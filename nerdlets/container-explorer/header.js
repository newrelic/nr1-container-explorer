import { Stack, StackItem, Button, Dropdown, DropdownItem } from "nr1"

function Filter({ name, value, removeFilter }) {
  return (
    <StackItem className="filter">
      <Stack horizontalType={Stack.HORIZONTAL_TYPE.CENTER}>
        <StackItem className="name">{name}: </StackItem>
        <StackItem className="value">{value}</StackItem>
        <StackItem>
          <Button
            type={Button.TYPE.PLAIN}
            iconType={Button.ICON_TYPE.INTERFACE__SIGN__CLOSE}
            sizeType={Button.SIZE_TYPE.SMALL}
            onClick={() => removeFilter(name, value)}
          />
        </StackItem>
      </Stack>
    </StackItem>
  )
}

function AccountPicker({ accounts, account, setAccount }) {
  return (
    <Dropdown className="account-picker" label="Account" title={account.name}>
      {accounts.map(account => {
        return (
          <DropdownItem onClick={() => setAccount(account)} key={account.id}>
            {account.name}
          </DropdownItem>
        )
      })}
    </Dropdown>
  )
}

export default function Header(props) {
  const { counts, filters, removeFilter } = props
  return (
    <div className="header">
      <Stack fullWidth className="options-bar" verticalType={Stack.VERTICAL_TYPE.CENTER}>
        <StackItem><AccountPicker {...props} /></StackItem>
        
        {counts && (
          <StackItem>
            <span className="title">
              {counts.containers} Containers running on {counts.hosts} Hosts
            </span>
          </StackItem>
        )}
      </Stack>
      <Stack className="filter-bar">
        {filters.map(filterProps => {
          return (
            <Filter
              key={filterProps.name}
              {...filterProps}
              removeFilter={removeFilter}
            />
          )
        })}
      </Stack>
    </div>
  )
}
