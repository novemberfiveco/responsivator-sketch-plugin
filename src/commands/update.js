import update from 'sketch-module-update'
import { setIconForAlert } from '../helpers'

const repoFullName = 'novemberfiveco/responsivator-sketch-plugin'

const options = {
  title: 'A new Responsivator plugin version is available!',
  customizeAlert: setIconForAlert
}

export default update(repoFullName, options)
