/**
 * 将驼峰字符串转化连字符
 *
 * @param {String} str
 * @returns {String}
 */
function transformCamelToHyphen(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

/**
 * 将对象转化为 cssText
 *
 * @param {Object} obj
 * @returns {String}
 */
function transfromObjectToCSSText(obj) {
  return Object.keys(obj).map(key => `${transformCamelToHyphen(key)}:${obj[key]}`).join(';')
}

/**
 * 获取元素的样式
 * @param {HTMLElement} el 
 * @param {Array} cssProperties 
 * @returns {Object}
 */
function getStyleObject(el, cssProperties = []) {
  const _css = window.getComputedStyle(el)
  const ret = Object.create(null)
  for (let i = 0, max = cssProperties.length; i < max; i++) {
    const property = cssProperties[i]
    const value = _css.getPropertyValue(transformCamelToHyphen(property))
    ret[property] = value
  }
  return ret
}

/**
 * 获取字体相关的样式
 *
 * @param {HTMLElement} el
 * @returns {Object}
 */
function getFontCSS(el) {
  const cssProperties = ['fontFamily', 'fontSize', 'lineHeight']
  const _styleObject = getStyleObject(el, cssProperties)
  if (_styleObject.lineHeight === 'normal') {
    _styleObject.lineHeight = 1.15 * Number.parseFloat(_styleObject.fontSize)
  }
  return _styleObject
}

/**
 * 判断像素是否为黑色
 *
 * @param {Array} imageData 像素数组
 * @param {Number} index 对应像素数组中的序号
 * @returns {Boolean}
 */
function isBlack(imageData, index) {
  const firstByte = index * 4
  const red = imageData[firstByte]
  const green = imageData[firstByte + 1]
  const blue = imageData[firstByte + 2]
  return (red === 0 && green === 0 && blue === 0) ? true : false
}
/**
 * 将数字转化为 px 字符串
 * @param {Number} number
 * @returns {String} 
 */
function toPXLength(number) {
  return `${number}px`
}

/**
 * 获取 CSS 的属性名 （可以用于判断属性是否支持）
 * @param {String} property 
 * @param {Number | String} value 
 */
function getCSSPropertyName(property, value) {
  const prefix = ['-webkit-', '-moz-', '-ms-']
  for (let i = 0, max = prefix.length; i < max; i++) {
    const name = `${prefix[i]}${property}`
    if (CSS.supports(name, value)) {
      return name
    }
  }
  return false
}

exports.transformCamelToHyphen = transformCamelToHyphen
exports.transfromObjectToCSSText = transfromObjectToCSSText
exports.getStyleObject = getStyleObject
exports.getFontCSS = getFontCSS
exports.isBlack = isBlack
exports.toPXLength = toPXLength
exports.getCSSPropertyName = getCSSPropertyName