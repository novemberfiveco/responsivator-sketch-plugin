function deselectAllLayers(document) {
  const selectedLayers = document.selectedLayers().layers()
  if (selectedLayers.count()) {
    selectedLayers.firstObject().select_byExpandingSelection(false, false)
  }
}

function findLayersMatchingPredicateInContainerFilterByType(
  document,
  predicate,
  container,
  layerType
) {
  let scope
  switch (layerType) {
    case 'MSPage':
      scope = document.pages()
      return scope.filteredArrayUsingPredicate(predicate)
    case 'MSArtboardGroup':
      if (typeof container !== 'undefined' && container != null) {
        if (container.className() == 'MSPage') {
          scope = container.artboards()
          return scope.filteredArrayUsingPredicate(predicate)
        }
      } else {
        // search all pages
        let filteredArray = NSArray.array()
        const loopPages = document.pages().objectEnumerator()
        let page
        while ((page = loopPages.nextObject())) {
          scope = page.artboards()
          filteredArray = filteredArray.arrayByAddingObjectsFromArray(
            scope.filteredArrayUsingPredicate(predicate)
          )
        }
        return filteredArray
      }
      break

    default:
      if (typeof container !== 'undefined' && container != null) {
        scope = container.children()
        return scope.filteredArrayUsingPredicate(predicate)
      }
      // search all pages
      let filteredArray = NSArray.array()
      const loopPages = document.pages().objectEnumerator()
      let page
      while ((page = loopPages.nextObject())) {
        scope = page.children()
        filteredArray = filteredArray.arrayByAddingObjectsFromArray(
          scope.filteredArrayUsingPredicate(predicate)
        )
      }
      return filteredArray
  }
  return NSArray.array() // Return an empty array if no matches were found
}

function findFirstLayerMatchingPredicateInContainerFilterByType(
  document,
  predicate,
  container,
  layerType
) {
  const filteredArray = findLayersMatchingPredicateInContainerFilterByType(
    document,
    predicate,
    container,
    layerType
  )
  return filteredArray.firstObject()
}

// Search for Layers by Name
// layerName parameter is required. container and layerType are optional.
function findLayersNamed(document, layerNames, container, layerType) {
  let predicate
  if (typeof layerNames == 'string') {
    predicate =
      typeof layerType === 'undefined' || layerType == null
        ? NSPredicate.predicateWithFormat('name == %@', layerNames)
        : NSPredicate.predicateWithFormat(
            'name == %@ && class == %@',
            layerNames,
            layerType
          )
  } else {
    predicate =
      typeof layerType === 'undefined' || layerType == null
        ? NSPredicate.predicateWithFormat('name IN %@', layerNames)
        : NSPredicate.predicateWithFormat(
            'name IN %@ && class == %@',
            layerNames,
            layerType
          )
  }
  return findLayersMatchingPredicateInContainerFilterByType(
    document,
    predicate,
    container
  )
}

// Search for Layers by Name
// layerName parameter is required. container and layerType are optional.
function findLayersNamedLike(document, layerNames, container, layerType) {
  let predicate
  if (typeof layerNames == 'string') {
    predicate =
      typeof layerType === 'undefined' || layerType == null
        ? NSPredicate.predicateWithFormat('name CONTAINS %@', layerNames)
        : NSPredicate.predicateWithFormat(
            'name LIKE %@ && class == %@',
            layerNames,
            layerType
          )
  } else {
    predicate =
      typeof layerType === 'undefined' || layerType == null
        ? NSPredicate.predicateWithFormat('name IN %@', layerNames)
        : NSPredicate.predicateWithFormat(
            'name IN %@ && class == %@',
            layerNames,
            layerType
          )
  }
  return findLayersMatchingPredicateInContainerFilterByType(
    document,
    predicate,
    container
  )
}

// Search for Layers by type
function findLayersOfType(document, layerType, container) {
  const predicate = NSPredicate.predicateWithFormat('class == %@', layerType)
  return findLayersMatchingPredicateInContainerFilterByType(
    document,
    predicate,
    container
  )
}

// Search for Artboards by Name
function findArtboardsNamed(document, artboardName, container) {
  const predicate = NSPredicate.predicateWithFormat(
    'name MATCHES %@',
    artboardName
  )
  return findLayersMatchingPredicateInContainerFilterByType(
    document,
    predicate,
    container,
    'MSArtboardGroup'
  )
}

function findArtboardsNamedLike(document, artboardNames, container) {
  let predicate
  if (typeof artboardNames == 'string') {
    predicate = NSPredicate.predicateWithFormat(
      'name CONTAINS %@',
      artboardNames
    )
  } else {
    predicate = NSPredicate.predicateWithFormat('name IN %@', artboardNames)
  }
  return findLayersMatchingPredicateInContainerFilterByType(
    document,
    predicate,
    container,
    'MSArtboardGroup'
  )
}

// Search for Pages by Name
function findPagesNamed(document, pageName) {
  const predicate = NSPredicate.predicateWithFormat('name MATCHES %@', pageName)
  return findLayersMatchingPredicateInContainerFilterByType(
    document,
    predicate,
    null,
    'MSPage'
  )
}

function findPagesNamedLike(document, pageName) {
  const predicate = NSPredicate.predicateWithFormat('name LIKE[c] %@', pageName)
  return findLayersMatchingPredicateInContainerFilterByType(
    document,
    predicate,
    null,
    'MSPage'
  )
}

function findLayersByRegexInContainer(document, layerType, containerLayer) {
  // Filter layers using NSPredicate
  const scope =
    typeof containerLayer !== 'undefined'
      ? containerLayer.children()
      : document.currentPage().children()
  const predicate = NSPredicate.predicateWithFormat(
    '(name MATCHES %@)',
    layerType
  )
  const layers = scope.filteredArrayUsingPredicate(predicate)

  return layers
}

function selectLayersByRegexInContainer(document, layerName, containerLayer) {
  // Filter layers using NSPredicate
  const scope =
    typeof containerLayer !== 'undefined'
      ? containerLayer.children()
      : document.currentPage().children()
  const predicate = NSPredicate.predicateWithFormat(
    '(name MATCHES %@)',
    layerName
  )
  const layers = scope.filteredArrayUsingPredicate(predicate)

  // Deselect current selection
  deselectAllLayers(document)

  // Loop through filtered layers and select them
  const loop = layers.objectEnumerator()
  let layer
  while ((layer = loop.nextObject())) {
    layer.select_byExpandingSelection(true, true)
  }

  return document.selectedLayers().layers()
}

function selectLayersByRegexAndTypeInContainer(
  document,
  layerName,
  layerType,
  containerLayer
) {
  // Filter layers using NSPredicate
  const container =
    typeof containerLayer !== 'undefined'
      ? containerLayer
      : document.currentPage()
  const predicate = NSPredicate.predicateWithFormat(
    `className == '${layerType}' && name MATCHES %@`,
    layerName
  )
  const layers = findLayersMatchingPredicateInContainerFilterByType(
    document,
    predicate,
    container
  )

  // Deselect current selection
  deselectAllLayers(document)

  // Loop through filtered layers and select them
  const loop = layers.objectEnumerator()
  let layer
  while ((layer = loop.nextObject())) {
    layer.select_byExpandingSelection(true, true)
  }

  return document.selectedLayers().layers()
}

function selectLayersFromList(document, layerList) {
  deselectAllLayers(document)
  // Loop through filtered layers and select them
  const loop = layerList.objectEnumerator()
  let layer
  while ((layer = loop.nextObject())) {
    layer.select_byExpandingSelection(true, true)
  }

  return document.selectedLayers().layers()
}

function getPluginInfo(context) {
  const manifestFilePath = `${context.scriptPath.stringByDeletingLastPathComponent()}/manifest.json`
  return getJSONFromFile(manifestFilePath)
}

function getJSONFromFile(filePath) {
  const data = NSData.dataWithContentsOfFile(filePath)
  return NSJSONSerialization.JSONObjectWithData_options_error(data, 0, null)
}

function getPluginDirectory(context) {
  const pluginPath = context.scriptPath.stringByDeletingLastPathComponent()
  return pluginPath
}

function getCurrentFileName(context) {
  return context.document.fileURL().lastPathComponent()
}

function executeSafely(context, func) {
  try {
    func(context)
  } catch (e) {
    createFailAlert(context, 'Failed...', e, true)
  }
}

function setIconForAlert(context, alert) {
  alert.setIcon(
    NSImage.alloc().initWithContentsOfFile(
      context.plugin.urlForResourceNamed('icon.png').path()
    )
  )
}

function createFailAlert(context, title, error, buttonToReport) {
  const alert = NSAlert.alloc().init()
  alert.informativeText = `${error}`
  alert.messageText = title
  alert.addButtonWithTitle('OK')
  if (buttonToReport) {
    alert.addButtonWithTitle('Report issue')
  }
  setIconForAlert(context, alert)

  const responseCode = alert.runModal()

  if (responseCode == 1001) {
    let errorString = error
    if (typeof error === 'object') {
      try {
        errorString = JSON.stringify(error, null, '\t')
        if (errorString === '{}') {
          errorString = error
        }
      } catch (e) {}
    }
    const urlString = `https://github.com/novemberfiveco/responsivator-sketch-plugin/issues/new?body=${encodeURIComponent(
      `### How did it happen?\n1.\n2.\n3.\n\n\n### Error log\n\n\`\`\`\n${errorString}\n\`\`\``
    )}`
    const url = NSURL.URLWithString(urlString)
    NSWorkspace.sharedWorkspace().openURL(url)
  }

  return {
    responseCode,
  }
}

function createInput(context, msg, okLabel, cancelLabel) {
  const accessory = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 50))
  const input = NSTextField.alloc().initWithFrame(NSMakeRect(0, 25, 300, 25))
  input.editable = true
  accessory.addSubview(input)

  const alert = NSAlert.alloc().init()
  alert.setMessageText(msg)
  alert.addButtonWithTitle(okLabel || 'OK')
  alert.addButtonWithTitle(cancelLabel || 'Cancel')
  setIconForAlert(context, alert)
  alert.setAccessoryView(accessory)

  const responseCode = alert.runModal()
  const message = input.stringValue()

  return {
    responseCode,
    message,
  }
}

function createInputWithCheckbox(
  context,
  msg,
  checkboxMsg,
  checked,
  okLabel,
  cancelLabel
) {
  const accessory = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 100))
  const input = TextArea(0, 25, 300, 75)
  const checkbox = NSButton.alloc().initWithFrame(NSMakeRect(0, 0, 300, 25))
  checkbox.setButtonType(3)
  checkbox.title = checkboxMsg
  checkbox.state = checked ? 1 : 0
  accessory.addSubview(input.view)
  accessory.addSubview(checkbox)

  const alert = NSAlert.alloc().init()
  alert.setMessageText(msg)
  alert.addButtonWithTitle(okLabel || 'OK')
  alert.addButtonWithTitle(cancelLabel || 'Cancel')
  setIconForAlert(context, alert)
  alert.setAccessoryView(accessory)

  const responseCode = alert.runModal()
  const message = input.getValue()

  return {
    responseCode,
    message,
    checked: checkbox.state() == 1,
  }
}

function createSelect(
  context,
  msg,
  items,
  selectedItemIndex = 0,
  okLabel,
  cancelLabel
) {
  const accessory = NSComboBox.alloc().initWithFrame(NSMakeRect(0, 0, 200, 25))
  accessory.addItemsWithObjectValues(items)
  accessory.selectItemAtIndex(selectedItemIndex)

  const alert = NSAlert.alloc().init()
  alert.setMessageText(msg)
  alert.addButtonWithTitle(okLabel || 'OK')
  alert.addButtonWithTitle(cancelLabel || 'Cancel')
  setIconForAlert(context, alert)
  alert.setAccessoryView(accessory)

  const responseCode = alert.runModal()
  const sel = accessory.indexOfSelectedItem()

  return {
    responseCode,
    index: sel,
  }
}

function TextArea(x, y, width, heigh) {
  const scrollView = NSScrollView.alloc().initWithFrame(
    NSMakeRect(x, y, width, heigh)
  )
  scrollView.borderStyle = NSLineBorder
  const contentSize = scrollView.contentSize()
  const input = NSTextView.alloc().initWithFrame(
    NSMakeRect(0, 0, contentSize.width, contentSize.height)
  )
  input.minSize = NSMakeSize(0, contentSize.height)
  input.maxSize = NSMakeSize(contentSize.width, Infinity)
  scrollView.documentView = input
  return {
    view: scrollView,
    getValue: () => input.string(),
  }
}

export {
  deselectAllLayers,
  findLayersMatchingPredicateInContainerFilterByType,
  findFirstLayerMatchingPredicateInContainerFilterByType,
  findLayersNamed,
  findLayersNamedLike,
  findArtboardsNamed,
  findArtboardsNamedLike,
  findPagesNamed,
  findPagesNamedLike,
  findLayersOfType,
  findLayersByRegexInContainer,
  selectLayersByRegexInContainer,
  selectLayersByRegexAndTypeInContainer,
  selectLayersFromList,
  getPluginInfo,
  getJSONFromFile,
  getPluginDirectory,
  getCurrentFileName,
  executeSafely,
  setIconForAlert,
  createFailAlert,
  createInput,
  createInputWithCheckbox,
  createSelect,
  TextArea,
}
