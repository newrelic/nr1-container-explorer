import { Stack, StackItem, Dropdown, DropdownItem } from "nr1"
import PLOTS from '../../lib/plots'


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

function PlotPicker({ group, counts, plot, setPlot }) {
  if (group || ( counts && counts.containers > 500) ) {
    return <Dropdown label="Plot" title={plot.title}>
      {PLOTS.map(p => {
        return <DropdownItem onClick={() => setPlot(p)} key={p.title}>
          {p.title}
        </DropdownItem>
      })}

    </Dropdown>
  }
  return null;
}

export default function Header(props) {
  const { counts } = props
  return (
    <div className="header">
      <Stack fullWidth className="options-bar" verticalType={Stack.VERTICAL_TYPE.CENTER}>
        <StackItem>
          <Stack verticalType={Stack.VERTICAL_TYPE.CENTER}>
            <StackItem><AccountPicker {...props} /></StackItem>
            <StackItem className="plot-picker-stack-item"><PlotPicker {...props}></PlotPicker></StackItem>
          </Stack>
        </StackItem>

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
