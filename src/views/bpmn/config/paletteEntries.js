import {assign} from 'min-dash'
import {
    append as svgAppend,
    attr as svgAttr,
    create as svgCreate
} from 'tiny-svg'

export default {
    'create.c1': createAction(
        'etl:Task', // etl.json 定义
        '计算组件',
        '',
        '组件1',
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png',
        // 'http://192.168.8.157:7005/file/downloadById/804',
        drawCustomTask
    ),
    'create.c2': createAction(
        'etl:Task', // etl.json 定义
        '计算组件',
        '',
        '组件2',
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png',
        // 'http://192.168.8.157:7005/file/downloadById/805',
        drawCustomTask
    ),
    'create.c3': createAction(
        'etl:Task', // etl.json 定义
        '计算组件',
        '',
        '组件3',
        // 'http://192.168.8.157:7005/file/downloadById/806',
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png',
        drawCustomTask
    ),
    'create.c41': createAction(
        'etl:Task',
        '计算组件',
        '',
        '组件4',
        // 'http://192.168.8.157:7005/file/downloadById/807'
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png'
    ),
    'create.c42': createAction(
        'etl:Task',
        '计算组件',
        '',
        '组件4',
        // 'http://192.168.8.157:7005/file/downloadById/807'
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png',
    ),
    'create.c43': createAction(
        'etl:Task',
        '计算组件',
        '',
        '组件4',
        // 'http://192.168.8.157:7005/file/downloadById/807',
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png',
    ),
    'create.c44': createAction(
        'etl:Task',
        '计算组件',
        '',
        '组件4',
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png'
        // 'http://192.168.8.157:7005/file/downloadById/807'
    ),
    'create.c412': createAction(
        'etl:Task',
        '计算组件',
        '',
        '组件4',
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png'
        // 'http://192.168.8.157:7005/file/downloadById/807'
    ),
    'create.c424': createAction(
        'etl:Task',
        '计算组件',
        '',
        '组件4',
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png',
        // 'http://192.168.8.157:7005/file/downloadById/807'
    ),
    'create.c432': createAction(
        'etl:Task',
        '计算组件',
        '',
        '组件4',
        // 'http://192.168.8.157:7005/file/downloadById/807'
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png',
    ),
    'create.c441': createAction(
        'etl:Task',
        '计算组件',
        '',
        '组件4',
        // 'http://192.168.8.157:7005/file/downloadById/807'
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png',
    ),
    'create.c4': createAction(
        'etl:Task',
        '计算组件',
        '',
        '组件4',
        // 'http://192.168.8.157:7005/file/downloadById/807'
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png',
    ),
    'create.c5': createAction(
        'etl:Task',
        '需求组件',
        '',
        '组件5',
        // 'http://192.168.8.157:7005/file/downloadById/808'
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png',
    ),
    'create.c64': createAction(
        'etl:Task',
        '需求组件',
        '',
        '组件6',
        // 'http://192.168.8.157:7005/file/downloadById/808',
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png',
        drawTask
    ),
    'create.c522': createAction(
        'etl:Task',
        '需求组件',
        '',
        '组件5',
        // 'http://192.168.8.157:7005/file/downloadById/808'
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png',
    ),
    'create.c522l': createAction(
        'etl:Task',
        '需求组件',
        '',
        '组件5',
        // 'http://192.168.8.157:7005/file/downloadById/808'
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png',
    ),
    'create.c8': createAction(
        'etl:Task',
        '其他组件',
        '',
        '组件8',
        // 'http://192.168.8.157:7005/file/downloadById/808',
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png',
    ),
    'create.c8e': createAction(
        'etl:Task',
        '其他组件',
        '',
        '组件8',
        // 'http://192.168.8.157:7005/file/downloadById/808',
        'https://cdn.jsdelivr.net/gh/sherlonWang/imgbed/picgo20201105201237.png',
    )
}

function createAction(
    type,
    group,
    className,
    title,
    imageUrl,
    drawShape,
    translate,
    options
) {
    var shortType = type.replace(/^bpmn:/, '')

    function createListener(event, autoActivate, elementFactory, create) {
        var shape = elementFactory.createShape(assign({type: type}, options))

        if (options) {
            shape.businessObject.di.isExpanded = options.isExpanded
        }

        // TODO: 自定义元模型 需要 实现 createText
        shape.businessObject.name = type

        create.start(event, shape)
    }

    return {
        type,
        group: group,
        className: className,
        title: title || translate('Create {type}', {type: shortType}),
        imageUrl: imageUrl,
        drawShape,
        action: {
            dragstart: createListener,
            click: createListener
        }
    }
}

function drawCustomTask(parentNode, element, textRenderer, entries) {
    const width = 130
    const height = 60
    const borderRadius = 20
    const strokeColor = '#4483ec'
    const fillColor = !element.businessObject.suitable && '#a2c5fd'

    element.width = width
    element.height = height
    const rect = drawRect(
        parentNode,
        width,
        height,
        borderRadius,
        strokeColor,
        fillColor
    )
    const text = textRenderer.createText(element.businessObject.name || '', {
        box: element,
        align: 'center-middle',
        padding: 5,
        size: {
            width: 100
        }
    })
    svgAppend(parentNode, text)
    return rect
}

function drawTask(parentNode, element, textRenderer, entries) {
    const width = 100
    const height = 80
    const borderRadius = 20
    const strokeColor = element.businessObject.suitable
    const fillColor = '#fff'

    element.width = width
    element.height = height
    const rect = drawRect(
        parentNode,
        width,
        height,
        borderRadius,
        strokeColor,
        fillColor
    )
    const text = textRenderer.createText(element.businessObject.name || '', {
        box: element,
        align: 'center-middle',
        padding: 5,
        size: {
            width: 100
        }
    })
    svgAppend(parentNode, text)
    return rect
}

// helpers //////////

// copied from https://github.com/bpmn-io/bpmn-js/blob/master/lib/draw/BpmnRenderer.js
function drawRect(
    parentNode,
    width,
    height,
    borderRadius,
    strokeColor,
    fillColor
) {
    const rect = svgCreate('rect')

    svgAttr(rect, {
        width: width,
        height: height,
        rx: borderRadius,
        ry: borderRadius,
        stroke: strokeColor || '#000',
        strokeWidth: 2,
        fill: fillColor
    })

    svgAppend(parentNode, rect)

    return rect
}

// copied from https://github.com/bpmn-io/diagram-js/blob/master/lib/core/GraphicsFactory.js
// function prependTo (newNode, parentNode, siblingNode) {
//   parentNode.insertBefore(newNode, siblingNode || parentNode.firstChild)
// }
