import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { createRoot } from 'react-dom/client'
import App from './components/App'
import rootReducer from './reducers'

const store = createStore(rootReducer)

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
)
