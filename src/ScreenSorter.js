import { sendEvent, sendError } from './analytics'
import { getUserPreferences } from './preferences'
import { createFailAlert, findPagesNamedLike, findArtboardsNamed, selectLayersFromList } from './helpers'

class ScreenSorter {
  static SECTION = 0
  static DEVICE = 1
  constructor(context) {
    this._context = context
    this._document = context.document
    this._command = context.command
    this._artboardPrefixRegex = /^([a-zA-Z]+)-(\d+)-(\d+)/
    this._paddingHorizontal = parseInt(getUserPreferences(this._context).paddingHorizontal)
    this._paddingHorizontalDevice = parseInt(getUserPreferences(this._context).paddingHorizontalDevice)
    this._paddingVertical = parseInt(getUserPreferences(this._context).paddingVertical)
    this._paddingVerticalDevice = parseInt(getUserPreferences(this._context).paddingVerticalDevice)
    this._defaultSort = parseInt(getUserPreferences(this._context).defaultSort)
    this._currentColumn = 0
  }

  sort (sortType) {
    this._sortType = sortType

    // Are there any screen pages
    let pages = findPagesNamedLike(this._document, 'screens*')

    if (pages.count() == 0) {
      sendError(this._context, 'Page screen doesn\'t exist')
      return createFailAlert(this._context, 'Missing page', 'Please make a page with the name "screens"')
    }

    this._screenPage = pages[0]

    // Get all artboards from the screens page
    this._artboards = this._screenPage.artboards()

    // Validate artboards
    this.validateArtboards()

    // Sort on specific type
    if (this._sortType == ScreenSorter.SECTION) {
      this.sortOnSection()
    } else {
      this.sortOnDevice()
    }
  }

  // We need to rename all the artboards to be able to sort correctly
  convertArtboardsToSortableDictionary () {
    let artboard
    let artboardInfo
    let artboardLoop = this._artboards.objectEnumerator()
    let customArtboards = NSMutableArray.new()

    while (artboard = artboardLoop.nextObject()) {
      artboardInfo = this._artboardPrefixRegex.exec(artboard.name())
      customArtboards.push(NSDictionary.dictionaryWithObjectsAndKeys(artboardInfo[2] + '-' + artboardInfo[3], 'name', artboard.frame().width(), 'width', artboard, 'artboard'))
    }

    return customArtboards
  }

  sortOnSection () {
    // Create a Sort Descriptor for artboard size and name
    let sortByName = NSSortDescriptor.sortDescriptorWithKey_ascending('name', 1)
    let sortedArtboards = this.convertArtboardsToSortableDictionary().sortedArrayUsingDescriptors([sortByName])
    let sortedArtboardLoop = sortedArtboards.objectEnumerator()
    let customArtboard

    // Loop through sorted layers
    while (customArtboard = sortedArtboardLoop.nextObject()) {
      this._screenPage.removeLayer(customArtboard.artboard)
      this.addArtboard(customArtboard.artboard)
    }
  }

  sortOnDevice () {
    // Create a Sort Descriptor for artboard name
    let sortBySize = NSSortDescriptor.sortDescriptorWithKey_ascending('width', this._defaultSort)
    let sortByName = NSSortDescriptor.sortDescriptorWithKey_ascending('name', 1)
    let sortedArtboards = this.convertArtboardsToSortableDictionary().sortedArrayUsingDescriptors([sortBySize, sortByName])
    let sortedArtboardLoop = sortedArtboards.objectEnumerator()
    let customArtboard

    // Loop through sorted layers
    while (customArtboard = sortedArtboardLoop.nextObject()) {
      this._screenPage.removeLayer(customArtboard.artboard)
      this.addArtboard(customArtboard.artboard)
    }
  }

  addArtboard (artboard) {
    let artboardFrame = artboard.frame()
    let previousArtboardFrame

    this._previousArtboardInfo = this._artboardInfo
    this._artboardInfo = this._artboardPrefixRegex.exec(artboard.name())

    if (this._artboardInfo && this._previousArtboardInfo) {
      previousArtboardFrame = this._previousArtboard.frame()

      if (this._previousArtboardInfo[2] !== this._artboardInfo[2] || (this._sortType == ScreenSorter.DEVICE && this._previousArtboardInfo[1] !== this._artboardInfo[1])) {
        this._currentRow++
        this._currentColumn = 0
      }
    }

    artboardFrame.constrainProportions = false
    if (this._currentColumn !== 0) {
      if (this._sortType == ScreenSorter.SECTION && this._previousArtboardInfo[3] !== this._artboardInfo[3]) {
        artboardFrame.setX(previousArtboardFrame.x() + previousArtboardFrame.width() + this._paddingHorizontalDevice)
      } else {
        artboardFrame.setX(previousArtboardFrame.x() + previousArtboardFrame.width() + this._paddingHorizontal)
      }
    } else {
      artboardFrame.setX(this._currentColumn * artboardFrame.width() + this._paddingHorizontal)
    }

    if (this._previousArtboard) {
      if (this._currentColumn === 0) {
        // Are we making a new row for a different screen size if so use device vertical padding
        if (this._artboardInfo[1] === this._previousArtboardInfo[1]) {
          artboardFrame.setY(previousArtboardFrame.y() + this._previousHighestHeight + this._paddingVertical)
        } else {
          artboardFrame.setY(previousArtboardFrame.y() + this._previousHighestHeight + this._paddingVerticalDevice)
        }
        // Reset height for calculation of new highest frame of the current row
        this._previousHighestHeight = 0
      } else {
        artboardFrame.setY(previousArtboardFrame.y())
      }

      // If there is a higher artboard change the height setting for next row
      this._previousHighestHeight = this._previousHighestHeight < artboardFrame.height() ? artboardFrame.height() : this._previousHighestHeight
    } else {
      artboardFrame.setY(0)
      this._previousHighestHeight = artboardFrame.height()
    }

    // Start new column
    ++this._currentColumn

    // This is for making sure we sort descending on the layer/artboard view
    if (this._previousArtboard) {
      this._screenPage.insertLayers_beforeLayer([artboard], this._previousArtboard)
    } else {
      this._screenPage.addLayers([artboard])
    }
    this._previousArtboard = artboard

    return artboard
  }

  validateArtboards () {
    let artboardLoop = this._artboards.objectEnumerator()
    let artboard

    // Check on artboard name
    while (artboard = artboardLoop.nextObject()) {
      // Check or there are multiple artboards with the same name
      let artboards = findArtboardsNamed(this._document, artboard.name(), this._screenPage)

      if (artboards.count() > 1) {
        selectLayersFromList(this._document, artboards)
        sendError(this._context, 'Duplicated artboard')
        return createFailAlert(this._context, 'Duplicated artboard', 'Please fix the artboard name of ' + artboard.name())
      }

      if (!this._artboardPrefixRegex.test(artboard.name())) {
        sendError(this._context, 'Incorrect artboard name')
        return createFailAlert(this._context, 'Incorrect artboard name', 'Please fix the artboard name of ' + artboard.name())
      }
    }
  }
}

export default ScreenSorter
