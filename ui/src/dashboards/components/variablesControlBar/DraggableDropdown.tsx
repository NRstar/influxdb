// Libraries
import * as React from 'react'
import {findDOMNode} from 'react-dom'
import {
  DragSource,
  DropTarget,
  ConnectDropTarget,
  ConnectDragSource,
  DropTargetMonitor,
  DropTargetConnector,
  DragSourceConnector,
  DragSourceMonitor,
} from 'react-dnd'
import {XYCoord} from 'dnd-core'
import classnames from 'classnames'

// Components
import VariableDropdown from './VariableDropdown'

// Constants
const dropdownType = 'dropdown'

const dropdownSource = {
  beginDrag(props: Props) {
    return {
      id: props.id,
      index: props.index,
    }
  },
}

interface Props {
  id: string
  index: number
  name: string
  moveDropdown: (dragIndex: number, hoverIndex: number) => void
  dashboardID: string
  onSelect: (variableID: string, value: string) => void
}

interface DropdownSourceCollectedProps {
  isDragging: boolean
  connectDragSource: ConnectDragSource
}

interface DropdownTargetCollectedProps {
  connectDropTarget?: ConnectDropTarget
}

const dropdownTarget = {
  hover(props: Props, monitor: DropTargetMonitor, component: Dropdown | null) {
    if (!component) {
      return null
    }
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return
    }

    // Determine rectangle on screen
    const hoverBoundingRect = (findDOMNode(
      component
    ) as Element).getBoundingClientRect()

    // Get horizontal middle
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2

    // Determine mouse position
    const clientOffset = monitor.getClientOffset()

    // Get pixels to the right
    const hoverClientX = (clientOffset as XYCoord).x - hoverBoundingRect.right

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging left
    if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
      return
    }

    // Dragging right
    if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
      return
    }

    // Time to actually perform the action
    props.moveDropdown(dragIndex, hoverIndex)

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex
  },
}

class Dropdown extends React.Component<
  Props & DropdownSourceCollectedProps & DropdownTargetCollectedProps
> {
  public render() {
    const {
      name,
      id,
      dashboardID,
      onSelect,
      isDragging,
      connectDragSource,
      connectDropTarget,
      index,
    } = this.props

    const className = classnames('variable-dropdown', {
      'variable-dropdown__dragging': isDragging,
    })

    return connectDragSource(
      connectDropTarget(
        <div className={className}>
          {/* TODO: Add variable description to title attribute when it is ready */}
          <div className="variable-dropdown--label">
            <div className="customizable-field--drag">
              <span className="hamburger" />
            </div>
            <span>
              {name}
              {index}
            </span>
          </div>
          <div className="variable-dropdown--placeholder" />
          <VariableDropdown
            variableID={id}
            dashboardID={dashboardID}
            onSelect={onSelect}
          />
        </div>
      )
    )
  }
}

export default DropTarget<Props & DropdownTargetCollectedProps>(
  dropdownType,
  dropdownTarget,
  (connect: DropTargetConnector) => ({
    connectDropTarget: connect.dropTarget(),
  })
)(
  DragSource<Props & DropdownSourceCollectedProps>(
    dropdownType,
    dropdownSource,
    (connect: DragSourceConnector, monitor: DragSourceMonitor) => ({
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging(),
    })
  )(Dropdown)
)
