import { Stack, StackItem, Dropdown, DropdownItem } from "nr1"


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
  const { counts, removeFilter } = props
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
    </div>
  )
}
