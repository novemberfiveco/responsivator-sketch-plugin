import { sendEvent } from '../analytics'
import ScreenSorter from '../ScreenSorter'

export default function (context) {
  sendEvent(context, 'sortOnSection', 'Sort on section')
  let screenSorter = new ScreenSorter(context)
  screenSorter.sort(ScreenSorter.SECTION)
}
