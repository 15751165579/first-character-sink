/**
 * 驼峰 -> 连字符
 *
 * @param {String} str
 * @returns
 */
function transformCamelToHyphen(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

module.exports = transformCamelToHyphen