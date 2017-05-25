import { h, render, Component } from 'preact'
import Portal from './Portal'
import pluginCall from 'sketch-module-web-view/client'

/** @jsx h */
class Preferences extends Component {
  constructor(props) {
    super(props)
    this.state = {
      preferences: window.preferences || {},
      ready: window.ready
    }
    if (!window.ready) {
      const interval = setInterval(() => {
        if (window.ready) {
          this.setState({
            preferences: window.preferences || {},
            ready: window.ready
          })
          clearInterval(interval)
        }
      }, 100)
    }
  }

  render (props, { ready, preferences }) {
    return (
      <div>
        <Portal>
          <button onClick={() => pluginCall('savePreferences', preferences)} className='save'>
            Save Preferences
          </button>
        </Portal>
        {!ready && 'loading...'}
        <h2>General preferences</h2>
        <div className='form'>
          <label htmlFor='paddingHorizontal'>Horizontal Padding</label>
          <input type='number' value={preferences.paddingHorizontal} id='paddingHorizontal' onInput={this.linkState('preferences.paddingHorizontal')} />
        </div>
        <div className='form'>
          <label htmlFor='paddingVertical'>Vertical Padding</label>
          <input type='number' value={preferences.paddingVertical} id='paddingVertical' onInput={this.linkState('preferences.paddingVertical')} />
        </div>
        <div className='form'>
          <label htmlFor='paddingHorizontalDevice'>Horizontal Device Padding</label>
          <input type='number' value={preferences.paddingHorizontalDevice} id='paddingHorizontalDevice' onInput={this.linkState('preferences.paddingHorizontalDevice')} />
        </div>
        <div className='form'>
          <label htmlFor='paddingVerticalDevice'>Vertical Device Padding</label>
          <input type='number' value={preferences.paddingVerticalDevice} id='paddingVerticalDevice' onInput={this.linkState('preferences.paddingVerticalDevice')} />
        </div>
        <div className='form'>
          <label htmlFor='defaultSort'>Default sort</label>
          <select id='defaultSort' name='defaultSort' onInput={this.linkState('preferences.defaultSort')} value={preferences.defaultSort}>
            <option value='0'>Large -> Small</option>
            <option value='1'>Small -> Large</option>
          </select>
        </div>
        <div className='form'>
          <input type='checkbox' checked={preferences.sendAnalytics} id='sendAnalytics' onChange={this.linkState('preferences.sendAnalytics')} />
          <label htmlFor='sendAnalytics'> Send anonymous usage data to improve the plugin</label>
        </div>
      </div>
    )
  }
}

render(<Preferences />, document.getElementById('container'))
