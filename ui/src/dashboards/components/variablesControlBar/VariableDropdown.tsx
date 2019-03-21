// Libraries
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import _ from 'lodash'

// Components
import {Dropdown, DropdownMenuColors} from 'src/clockface'

// Utils
import {
  getValuesForVariable,
  getSelectedValueForVariable,
} from 'src/variables/selectors'

// Styles
import 'src/dashboards/components/variablesControlBar/VariableDropdown.scss'

// Types
import {AppState} from 'src/types/v2'

interface StateProps {
  values: string[]
  selectedValue: string
}

interface OwnProps {
  variableID: string
  dashboardID: string
  onSelect: (variableID: string, value: string) => void
}

type Props = StateProps & OwnProps

class VariableDropdown extends PureComponent<Props> {
  render() {
    const {selectedValue} = this.props

    return (
      <Dropdown
        selectedID={selectedValue}
        onChange={this.handleSelect}
        widthPixels={140}
        customClass="variable-dropdown--dropdown"
        menuColor={DropdownMenuColors.Amethyst}
      >
        {this.dropdownItems}
      </Dropdown>
    )
  }

  private get dropdownItems(): JSX.Element[] {
    const {values} = this.props

    return values.map(v => {
      return (
        <Dropdown.Item key={v} id={v} value={v}>
          {v}
        </Dropdown.Item>
      )
    })
  }

  private handleSelect = (value: string) => {
    const {variableID, onSelect} = this.props
    onSelect(variableID, value)
  }
}

const mstp = (state: AppState, props: OwnProps): StateProps => {
  const {dashboardID, variableID} = props

  const values = getValuesForVariable(state, variableID, dashboardID)

  const selectedValue = getSelectedValueForVariable(
    state,
    variableID,
    dashboardID
  )

  return {values, selectedValue}
}

export default connect<StateProps, {}, OwnProps>(
  mstp,
  null
)(VariableDropdown)
