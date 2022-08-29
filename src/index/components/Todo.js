import PropTypes from 'prop-types'

function Todo({ onClick, completed, text }) {
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <li
        onClick={onClick}
        style={{
      textDecoration: completed ? 'line-through' : 'none'
    }}>
      {text}
    </li>
  )
}

Todo.propTypes = {
  onClick: PropTypes.func.isRequired,
  completed: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
}

export default Todo
