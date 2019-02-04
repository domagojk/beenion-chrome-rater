import { h, render } from 'preact'
import App from './App/App'

const root = document.getElementById('app')

render(
  <App framework="Preact" bundler="parcel-bundler" name="Viewer" />,
  root,
  root.lastChild
)
