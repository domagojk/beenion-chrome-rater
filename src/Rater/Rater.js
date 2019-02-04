import { h, Component } from 'preact'
import { BeenionLink } from '../BeenionLink'
import './Rater.css'
import './inputslider.css'

export class Rater extends Component {
  getRateSection(rating) {
    if (!this.props.touched) {
      return {
        rating: null,
        color: '#ccc',
        desc: 'Your rating?'
      }
    }
    if (rating < 30) {
      return {
        rating: 1,
        color: '#ea5b0c',
        desc: 'crap'
      }
    }
    if (rating >= 30 && rating < 50) {
      return {
        rating: 2,
        color: '#f28d4f',
        desc: 'bad'
      }
    }
    if (rating >= 50 && rating < 70) {
      return {
        rating: 3,
        color: '#24cefb',
        desc: 'moderate'
      }
    }
    if (rating >= 70 && rating < 90) {
      return {
        rating: 4,
        color: '#00cf86',
        desc: 'good'
      }
    }
    if (rating >= 90 && rating <= 100) {
      return {
        rating: 5,
        color: '#00de00',
        desc: 'awesome'
      }
    }
  }

  handleTagAdd(val) {
    if (
      val &&
      !val.match(/[ !@#$%^&*()+=\[\]{};':"\\|,.<>\/?]/) &&
      !this.props.tags.includes(val)
    ) {
      this.props.onTagAdded(val)
      return true
    }
    return false
  }

  handleRangleSlider(e) {
    this.props.onRatingChanged(e.target.valueAsNumber)
  }

  render(props) {
    return (
      <div>
        <BeenionLink
          favicon={this.props.favicon}
          url={this.props.url}
          title={this.props.title}
        />

        <div>
          <div
            className="label-text"
            style={{
              fontFamily: `PingFang SC, Arial`
            }}
          >
            Your rating?
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={this.props.rating}
            style={{
              margin: '0 auto',
              width: 120
            }}
            onInput={this.handleRangleSlider.bind(this)}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: 80,
              height: 80,
              lineHeight: '80px',
              background: this.getRateSection(this.props.rating).color,
              borderRadius: '50%',
              color: '#fff',
              textAlign: 'center',
              margin: '6px auto',
              fontSize: 18
            }}
          >
            {this.props.touched ? this.props.rating : '?'}
          </div>
          <div className="done">
            {this.props.changedRating && (
              <button className="btn" onClick={this.props.onDone}>
                {this.props.doneLabel}
              </button>
            )}
          </div>
        </div>
        <div className="tags">
          <div className="taglist">
            {this.props.tags.map(tag => (
              <span key={tag} className="tag label label-info">
                {tag}
                <span
                  data-role="remove"
                  onClick={e => this.props.onTagRemoved(tag)}
                />
              </span>
            ))}
          </div>
          <input
            type="text"
            onKeyDown={e => {
              if (e.keyCode === 13 || e.keyCode === 32) {
                e.preventDefault()
                const val = e.target.value
                if (this.handleTagAdd(val)) {
                  e.target.value = ''
                }
              }
            }}
            onBlur={e => {
              const val = e.target.value
              if (this.handleTagAdd(val)) {
                e.target.value = ''
              }
            }}
            placeholder="add a tag"
          />
        </div>
        <div className="footer">
          <div className="username">
            @{this.props.username} (
            <span className="footer-link" onClick={this.props.onLogOut}>
              Log out
            </span>
            )
          </div>
        </div>
      </div>
    )
  }
}
