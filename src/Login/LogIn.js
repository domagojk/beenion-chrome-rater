import { h, Component } from 'preact'
import './Login.css'
import { BeenionLink } from '../BeenionLink'

export class LogIn extends Component {
  render(props) {
    return (
      <div>
        <BeenionLink
          favicon={this.props.favicon}
          url={this.props.url}
          title={this.props.title}
        />
        <a target="_blank" class="btn btn-login" href="https://beenion.com">
          Log In / Sign up
        </a>
      </div>
    )
  }
}
