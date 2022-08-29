import PropTypes from 'prop-types'

function Link({ active, children, onClick }) {
  return (
    // eslint-disable-next-line react/button-has-type
    <button
        onClick={onClick}
        disabled={active}
        style={{
      marginLeft: '4px'
    }}>
      {children}
    </button>
  )
}

Link.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired
}

export default Link
