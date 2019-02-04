import { h, Component } from 'preact'
import { clientId } from '../config'
import { defaultTags } from '../defaultTags'
import { Rater } from '../Rater/Rater'
import { LogIn } from '../LogIn/LogIn'
import md5 from 'md5'
import './global.css'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url: '',
      favicon: '',
      title: '',
      doneLabel: 'send',
      changedRating: false,
      checkingLogin: true,
      loggedIn: false,
      username: '',
      accessToken: null,
      touched: false,
      rating: 0,
      tags: [],
      unseen: null
    }
  }

  componentDidMount() {
    chrome.storage.local.get(['authData', 'unseen'], ({ authData, unseen }) => {
      if (authData) {
        if (authData.expires > Date.now()) {
          this.setState({
            unseen,
            accessToken: authData.accessToken,
            username: authData.username,
            checkingLogin: false,
            loggedIn: true
          })
        } else {
          fetch('https://cognito-idp.us-east-1.amazonaws.com', {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/x-amz-json-1.1',
              'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
            },
            body: JSON.stringify({
              ClientId: clientId,
              AuthFlow: 'REFRESH_TOKEN_AUTH',
              AuthParameters: {
                REFRESH_TOKEN: authData.refreshToken
              }
            })
          })
            .then(response => response.json())
            .then(res => {
              const newTokenData = {
                accessToken: res.AuthenticationResult.AccessToken,
                expires: Date.now() + res.AuthenticationResult.ExpiresIn * 1000,
                refreshToken: authData.refreshToken,
                username: authData.username,
                name: authData.name
              }
              chrome.storage.local.set({ authData: newTokenData }, () => {
                this.setState({
                  unseen,
                  username: authData.username,
                  accessToken: newTokenData.accessToken,
                  checkingLogin: false,
                  loggedIn: true
                })
              })
            })
            .catch(err => {
              this.setState({
                authData: null,
                checkingLogin: false,
                loggedIn: false
              })
            })
        }
      } else {
        this.setState({
          authData: null,
          checkingLogin: false,
          loggedIn: false
        })
      }
    })

    setTimeout(this.setUrlData.bind(this), 0)
  }

  setUrlData() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
      const { url, title, favIconUrl } = tabs[0]
      const urlHash = md5(this.state.username + '_' + url)

      chrome.storage.local.get(urlHash, res => {
        if (res[urlHash]) {
          this.setState({
            url,
            title,
            favicon: favIconUrl,
            touched: true,
            tags: res[urlHash].tags || [],
            rating:
              res[urlHash].rating !== undefined
                ? parseInt(res[urlHash].rating)
                : null
          })
        } else {
          this.setState({
            url,
            title,
            tags: defaultTags(url),
            favicon: favIconUrl
          })
        }
      })
    })
  }

  saveInStorage() {
    this.setState({
      doneLabel: 'Thank you!'
    })
    chrome.storage.local.set(
      {
        [md5(this.state.username + '_' + this.state.url)]: {
          username: this.state.username,
          url: this.state.url,
          title: this.state.title,
          image: this.state.favicon,
          rating: this.state.rating,
          tags: this.state.tags
        }
      },
      () => {
        setTimeout(() => {
          window.close()
        }, 300)
      }
    )
  }

  onRatingChanged(rating) {
    this.setState({
      rating,
      changedRating: true,
      touched: true
    })
  }

  onLogOut() {
    chrome.storage.local.remove('authData', () => {
      chrome.tabs.create({ url: 'https://beenion.com/logout' })
      window.location.reload()
    })
  }

  onTagAdded(addedTag) {
    this.setState({
      tags: [...this.state.tags, addedTag]
    })
  }

  onTagRemoved(removedTag) {
    this.setState({
      tags: this.state.tags.filter(tag => tag !== removedTag)
    })
  }

  render(props) {
    return this.state.checkingLogin ? (
      <div>loading...</div>
    ) : this.state.loggedIn ? (
      <div>
        {this.state.url.startsWith('http') ? (
          <Rater
            touched={this.state.touched}
            changedRating={this.state.changedRating}
            rating={this.state.rating}
            tags={this.state.tags}
            onRatingChanged={this.onRatingChanged.bind(this)}
            onLogOut={this.onLogOut.bind(this)}
            onTagAdded={this.onTagAdded.bind(this)}
            onTagRemoved={this.onTagRemoved.bind(this)}
            onDone={this.saveInStorage.bind(this)}
            doneLabel={this.state.doneLabel}
            username={this.state.username}
            favicon={this.state.favicon}
            title={this.state.title}
            url={this.state.url}
          />
        ) : (
          <div
            style={{
              padding: '30px 20px',
              fontFamily: 'arial'
            }}
          >
            Only "https" or "http" pages can be rated.
          </div>
        )}
        <div>
          {this.state.unseen ? (
            <a
              target="_blank"
              href="https://beenion.com"
              style={{
                display: 'block',
                textDecoration: 'none',
                paddingTop: 11,
                fontFamily: 'arial',
                color: '#56c0e0',
                paddingBottom: 5
              }}
            >
              (1) new rating from <b>{this.state.unseen.username}</b>
            </a>
          ) : (
            <a
              target="_blank"
              href="https://beenion.com"
              style={{
                display: 'block',
                textDecoration: 'none',
                paddingTop: 8,
                fontFamily: 'arial',
                color: '#56c0e0',
                textAlign: 'right',
                paddingRight: 15,
                borderTop: '1px solid #e6e6e6'
              }}
            >
              show my feed
            </a>
          )}
        </div>
      </div>
    ) : (
      <LogIn
        favicon={this.state.favicon}
        title={this.state.title}
        url={this.state.url}
      />
    )
  }
}
