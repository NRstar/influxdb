// Libraries
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import _ from 'lodash'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

// Components
import VariableDropdown from 'src/dashboards/components/variablesControlBar/VariableDropdown'
import {EmptyState, ComponentSize} from 'src/clockface'

// Utils
import {getVariablesForDashboard} from 'src/variables/selectors'

// Styles
import 'src/dashboards/components/variablesControlBar/VariablesControlBar.scss'

// Actions
import {selectValue} from 'src/variables/actions'

// Types
import {AppState} from 'src/types/v2'
import {Variable} from '@influxdata/influx'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'
import DraggableDropdown from './DraggableDropdown'

interface OwnProps {
  dashboardID: string
}

interface StateProps {
  variables: Variable[]
}

interface DispatchProps {
  selectValue: typeof selectValue
}

type Props = StateProps & DispatchProps & OwnProps

@ErrorHandling
class VariablesControlBar extends PureComponent<Props> {
  render() {
    const {dashboardID, variables} = this.props

    if (_.isEmpty(variables)) {
      return (
        <div className="variables-control-bar">
          <EmptyState
            size={ComponentSize.ExtraSmall}
            customClass="variables-control-bar--empty"
          >
            <EmptyState.Text text="To see variable controls here, use a variable in a cell query" />
          </EmptyState>
        </div>
      )
    }

    return (
      <div className="variables-control-bar">
        {variables.map((v, i) => {
          return (
            <DraggableDropdown
              key={v.id}
              name={v.name}
              id={v.id}
              index={i}
              dashboardID={dashboardID}
              onSelect={this.handleSelectValue}
              moveDropdown={this.handleMoveDropdown}
            />
            // <VariableDropdown
            //   key={v.id}
            //   name={v.name}
            //   variableID={v.id}
            //   dashboardID={dashboardID}
            //   onSelect={this.handleSelectValue}
            // />
            // moveDropdown: (dragIndex: number, hoverIndex: number) => void
          )
        })}
      </div>
    )
  }

  private handleMoveDropdown = (
    dragIndex: number,
    hoverIndex: number
  ): void => {
    console.log(dragIndex)
    console.log(hoverIndex)
  }

  private handleSelectValue = (variableID: string, value: string) => {
    const {selectValue, dashboardID} = this.props
    selectValue(dashboardID, variableID, value)
  }
}

const mdtp = {
  selectValue: selectValue,
}

const mstp = (state: AppState, props: OwnProps): StateProps => {
  return {variables: getVariablesForDashboard(state, props.dashboardID)}
}

export default DragDropContext(HTML5Backend)(
  connect<StateProps, DispatchProps, OwnProps>(
    mstp,
    mdtp
  )(VariablesControlBar)
)
