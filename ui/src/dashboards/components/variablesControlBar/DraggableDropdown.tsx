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
import VariableDropdown from './VariableDropdown'

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
    } = this.props
    // const opacity = isDragging ? 0 : 1

    return connectDragSource(
      connectDropTarget(
        <div>
          <VariableDropdown
            name={name}
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
