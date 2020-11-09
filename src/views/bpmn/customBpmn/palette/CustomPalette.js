import {
  isArray,
  isFunction,
  forEach
} from 'min-dash'

import {
  domify,
  query as domQuery,
  attr as domAttr,
  clear as domClear,
  classes as domClasses,
  matches as domMatches,
  delegate as domDelegate,
  event as domEvent
} from 'min-dom'

var TOGGLE_SELECTOR = '.custom-palette-toggle'
var ENTRY_SELECTOR = '.entry'
var ELEMENT_SELECTOR = TOGGLE_SELECTOR + ', ' + ENTRY_SELECTOR

var PALETTE_OPEN_CLS = 'open'
var PALETTE_TWO_COLUMN_CLS = 'two-column'

var DEFAULT_PRIORITY = 1000

/**
 * A palette containing modeling elements.
 */
function Palette (eventBus, canvas,
  elementFactory,
  create,
  paletteContainer,
  paletteEntries) {
  this._eventBus = eventBus
  this._canvas = canvas
  this._entries = paletteEntries
  this._paletteContainer = paletteContainer
  this._elementFactory = elementFactory
  this._create = create

  var self = this

  eventBus.on('tool-manager.update', function (event) {
    var tool = event.tool

    self.updateToolHighlight(tool)
  })

  eventBus.on('i18n.changed', function () {
    self._update()
  })

  eventBus.on('diagram.init', function () {
    self._diagramInitialized = true

    self._rebuild()
  })
}

Palette.$inject = ['eventBus', 'canvas',
  'elementFactory',
  'create',
  'config.paletteContainer',
  'config.paletteEntries']

/**
 * Register a provider with the palette
 *
 * @param  {number} [priority=1000]
 * @param  {PaletteProvider} provider
 *
 * @example
 * const paletteProvider = {
 *   getPaletteEntries: function() {
 *     return function(entries) {
 *       return {
 *         ...entries,
 *         'entry-1': {
 *           label: 'My Entry',
 *           action: function() { alert("I have been clicked!"); }
 *         }
 *       };
 *     }
 *   }
 * };
 *
 * palette.registerProvider(800, paletteProvider);
 */
Palette.prototype.registerProvider = function (priority, provider) {
  console.log("palette registerProvider")
  if (!provider) {
    provider = priority
    priority = DEFAULT_PRIORITY
  }

  this._eventBus.on('palette.getProviders', priority, function (event) {
    event.providers.push(provider)
  })

  this._rebuild()
}

/**
 * Returns the palette entries
 *
 * @return {Object<string, PaletteEntryDescriptor>} map of entries
 */
Palette.prototype.getEntries = function () {
  console.log("palette getEntries")
  var providers = this._getProviders()

  return providers.reduce(addPaletteEntries, {})
}

Palette.prototype._rebuild = function () {
  console.log("palette _rebuild")
  if (!this._diagramInitialized) {
    return
  }

  var providers = this._getProviders()

  if (!providers.length) {
    return
  }

  if (!this._container) {
    this._init()
  }

  this._update()
}

/**
 * Initialize
 */
Palette.prototype._init = function () {
  console.log("palette init")
  var self = this

  var eventBus = this._eventBus

  var parentContainer = this._getParentContainer()
  console.log("parentContainer:",parentContainer)
  // 获取传入的工具栏容器
  var container = this._container = this._paletteContainer
  console.log("container:",container)
  // 未找到 使用默认
  if (!container) {
    container = this._container = domify(Palette.HTML_MARKUP)
  } else {
    // 为 传入的工具栏容器 创建子元素
    addClasses(container, 'custom-palette')
    const entries = domQuery('.custom-palette-entries', container)
    const toggle = domQuery('.custom-palette-toggle', container)

    if (!entries) {
      container.appendChild(domify('<div class="custom-palette-entries"></div>'))
    }
    if (!toggle) {
      container.appendChild(domify('<div class="custom-palette-toggle"></div>'))
    }
  }
  // 此行代码表示将 palette 放入 canvas 父容器中
  // parentContainer.appendChild(container)

  // 下面是绑定 click 、 dragstart

  domDelegate.bind(container, ELEMENT_SELECTOR, 'click', function (event) {
    var target = event.delegateTarget

    if (domMatches(target, TOGGLE_SELECTOR)) {
      return self.toggle()
    }

    self.trigger('click', event)
  })

  // prevent drag propagation
  domEvent.bind(container, 'mousedown', function (event) {
    event.stopPropagation()
  })

  // prevent drag propagation
  domDelegate.bind(container, ENTRY_SELECTOR, 'dragstart', function (event) {
    self.trigger('dragstart', event)
  })

  eventBus.on('canvas.resized', this._layoutChanged, this)

  eventBus.fire('palette.create', {
    container: container
  })
}

Palette.prototype._getProviders = function (id) {
  console.log("palette _getProviders")
  var event = this._eventBus.createEvent({
    type: 'palette.getProviders',
    providers: []
  })

  this._eventBus.fire(event)

  return event.providers
}

/**
 * Update palette state.
 *
 * @param  {Object} [state] { open, twoColumn }
 */
Palette.prototype._toggleState = function (state) {
  console.log("palette _toggleState")
  state = state || {}

  var parent = this._getParentContainer()
  var container = this._container

  var eventBus = this._eventBus

  var twoColumn

  var cls = domClasses(container)

  if ('twoColumn' in state) {
    twoColumn = state.twoColumn
  } else {
    twoColumn = this._needsCollapse(parent.clientHeight, this._entries || {})
  }

  // always update two column
  cls.toggle(PALETTE_TWO_COLUMN_CLS, twoColumn)

  if ('open' in state) {
    cls.toggle(PALETTE_OPEN_CLS, state.open)
  }

  eventBus.fire('palette.changed', {
    twoColumn: twoColumn,
    open: this.isOpen()
  })
}

Palette.prototype._update = function () {
  debugger
  console.log("palette _update")
  var entriesContainer = domQuery('.custom-palette-entries', this._container)
  console.log("entriesContainer:",entriesContainer)
  var entries = this._entries = this.getEntries()
  domClear(entriesContainer)

  console.log("entries:",entries)
  // 遍历工具栏元素
  forEach(entries, function (entry, id) {
    var grouping = entry.group || 'default'
    // 设置分组
    var container = domQuery('[data-group=' + grouping + ']', entriesContainer)
    console.log("group-container:",container)
    // 如果不存在，添加groupLabel
    if (!container) {
      container = domify(
        '<div class="group" data-group="' + grouping + '"></div>'
      )
      const arrowDown = 'el-icon-arrow-down'
      const groupLabel = domify(
        `<div class="groupLabel"><div class="title"><i id="custom-palette-group-arrow" class="${arrowDown}"></i><span title="${grouping}">${grouping}</span></div></div>`
      )

      // 给groupLabel添加点击事件
      groupLabel.addEventListener('click', function () {
        const iconArrowDown = this.querySelector('.el-icon-arrow-down')
        const iconArrowLeft = this.querySelector('.el-icon-arrow-left')
        if (iconArrowDown) {
          // const isArrowDown = Array.from(iconArrowDown).includes('el-icon-arrow-down')
          iconArrowDown.classList = ['el-icon-arrow-left']
          const entrySet = this.parentNode.querySelectorAll('.entry-set')
          // entrySet[0].style.transition='height 0.4s ease';
          entrySet[0].style.height='0';
          // entrySet[0].style.display='none';
          // forEach(entry, function (it) {
          //   it.style.height = '0'
          //   // it.style.display = 'none'
          //   it.style.transition='height 0.4s ease';
          // })
        }
        if (iconArrowLeft) {
          iconArrowLeft.classList = ['el-icon-arrow-down']
          const entrySet = this.parentNode.querySelectorAll('.entry-set')
          // entrySet[0].style.transition='height 0.4s ease';
          entrySet[0].style.height='auto';
          // entrySet[0].style.display='block';
        }
      })

      container.appendChild(groupLabel)
      // 给组件元素添加一层包裹
      let entrySet = domify('<div class="entry-set"></div>')
      container.appendChild(entrySet)
      entriesContainer.appendChild(container)
    }

    let entrySet = domQuery('.entry-set', container)

    var html = entry.html || (
      entry.separator
        ? '<hr class="separator" />'
        : `<div class="control">
    <div class="entry" draggable="true">

    </div>
    <span>${entry.title}</span>
</div>`)

    var control = domify(html)
    // 添加组件
    entrySet.appendChild(control)
    if (!entry.separator) {
      domAttr(domQuery('.entry',control), 'data-action', id)

      if (entry.title) {
        domAttr(domQuery('.entry',control), 'title', entry.title)
      }

      if (entry.className) {
        addClasses(domQuery('.entry',control), entry.className)
      }

      if (entry.imageUrl) {
        console.log('img url')
        domQuery('.entry',control).appendChild(domify('<img src="' + entry.imageUrl + '">'))
      }
    }
  })

  // open after update
  this.open()
}

/**
 * Trigger an action available on the palette
 *
 * @param  {string} action
 * @param  {Event} event
 */
Palette.prototype.trigger = function (action, event, autoActivate) {
  console.log("palette trigger")
  var entries = this._entries
  var elementFactory = this._elementFactory
  var create = this._create
  var entry
  var handler
  var originalEvent
  var button = event.delegateTarget || event.target

  if (!button) {
    return event.preventDefault()
  }

  entry = entries[domAttr(button, 'data-action')]

  // when user clicks on the palette and not on an action
  if (!entry) {
    return
  }

  handler = entry.action

  originalEvent = event.originalEvent || event

  // simple action (via callback function)
  //  传入 action 的 dragstart方法 click 方法
  if (isFunction(handler)) {
    if (action === 'click') {
      handler(originalEvent, autoActivate, elementFactory, create)
    }
  } else {
    if (handler[action]) {
      handler[action](originalEvent, autoActivate, elementFactory, create)
    }
  }

  // silence other actions
  event.preventDefault()
}

Palette.prototype._layoutChanged = function () {
  console.log("palette _layoutChanged")
  this._toggleState({})
}

/**
   * Do we need to collapse to two columns?
   *
   * @param {number} availableHeight
   * @param {Object} entries
   *
   * @return {boolean}
   */
Palette.prototype._needsCollapse = function (availableHeight, entries) {
  console.log("palette _needsCollapse")
  // top margin + bottom toggle + bottom margin
  // implementors must override this method if they
  // change the palette styles
  var margin = 20 + 10 + 20

  var entriesHeight = Object.keys(entries).length * 46

  return availableHeight < entriesHeight + margin
}

/**
   * Close the palette
   */
Palette.prototype.close = function () {
  this._toggleState({
    open: false,
    twoColumn: false
  })
}

/**
   * Open the palette
   */
Palette.prototype.open = function () {
  this._toggleState({ open: true })
}

Palette.prototype.toggle = function (open) {
  if (this.isOpen()) {
    this.close()
  } else {
    this.open()
  }
}

Palette.prototype.isActiveTool = function (tool) {
  return tool && this._activeTool === tool
}

Palette.prototype.updateToolHighlight = function (name) {
  // console.log("palette updateToolHighlight")
  // var entriesContainer,
  //   toolsContainer
  //
  // if (!this._toolsContainer) {
  //   entriesContainer = domQuery('.custom-palette-entries', this._container)
  //
  //   this._toolsContainer = domQuery('[data-group=tools]', entriesContainer)
  // }
  //
  // toolsContainer = this._toolsContainer
  //
  // forEach(toolsContainer.children, function (tool) {
  //   var actionName = tool.getAttribute('data-action')
  //
  //   if (!actionName) {
  //     return
  //   }
  //
  //   var toolClasses = domClasses(tool)
  //
  //   actionName = actionName.replace('-tool', '')
  //
  //   if (toolClasses.contains('entry') && actionName === name) {
  //     toolClasses.add('highlighted-entry')
  //   } else {
  //     toolClasses.remove('highlighted-entry')
  //   }
  // })
}

/**
   * Return true if the palette is opened.
   *
   * @example
   *
   * palette.open();
   *
   * if (palette.isOpen()) {
   *   // yes, we are open
   * }
   *
   * @return {boolean} true if palette is opened
   */
Palette.prototype.isOpen = function () {
  return domClasses(this._container).has(PALETTE_OPEN_CLS)
}

/**
   * Get container the palette lives in.
   *
   * @return {Element}
   */
Palette.prototype._getParentContainer = function () {
  return this._canvas.getContainer()
}

/* markup definition */

Palette.HTML_MARKUP =
  '<div class="custom-palette">' +
  '<div class="custom-palette-entries"></div>' +
  '<div class="custom-palette-toggle"></div>' +
  '</div>'

// helpers //////////////////////

function addClasses (element, classNames) {
  var classes = domClasses(element)

  var actualClassNames = isArray(classNames) ? classNames : classNames.split(/\s+/g)
  actualClassNames.forEach(function (cls) {
    classes.add(cls)
  })
}

function addPaletteEntries (entries, provider) {
  var entriesOrUpdater = provider.getPaletteEntries()

  if (isFunction(entriesOrUpdater)) {
    return entriesOrUpdater(entries)
  }

  forEach(entriesOrUpdater, function (entry, id) {
    entries[id] = entry
  })

  return entries
}

export default {
  __init__: ['customPalette'],
  customPalette: ['type', Palette]
}
