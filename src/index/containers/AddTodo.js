import { connect } from 'react-redux'
import { addTodo } from '../actions'

// eslint-disable-next-line react/prop-types
function AddTodo({ dispatch }) {
  let input

  return (
    <div>
      <form
          onSubmit={(e) => {
          e.preventDefault()
          if (!input.value.trim()) 
            return
          
          dispatch(addTodo(input.value))
          input.value = ''
        }}>
        <input ref={(node) => {
          input = node
          return input
        }} />
        <button type="submit">Add Todo</button>
      </form>
    </div>
  )
}

export default connect()(AddTodo)
