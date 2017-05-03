import { sendEvent } from '../analytics'
import ScreenSorter from '../ScreenSorter'

export default function (context) {
  sendEvent(context, 'sortOnDevice', 'Sort on device')
  let screenSorter = new ScreenSorter(context)
  screenSorter.sort(ScreenSorter.DEVICE)
}
