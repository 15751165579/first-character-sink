/* eslint-disable no-console */
const {
  transfromObjectToCSSText,
  getFontCSS,
  isBlack,
  toPXLength,
  getCSSPropertyName
} = require('./util')

const testFontSize = 100

class DropCap {
  constructor(selector, numberOfLine, text) {
    if (!selector || !numberOfLine || !text) {
      throw new Error('Missing required arguments')
    }
    if (typeof selector === 'string') {
      this.el = document.querySelector(selector)
    }

    this.el || (this.el = selector)

    this.numberOfLine = Number.parseInt(numberOfLine)
    
    this.text = text

    this.fontCSS = getFontCSS(this.el)
    console.log(this.fontCSS)
    if (this.fontCSS.lineHeight === 'normal') {
      this.calculateLineHeight()
    }
  }
  calculateLineHeight() {
    const { lineHeight, fontFamily, fontSize } = this.fontCSS
    const el = document.createElement('p')
    el.style.cssText = transfromObjectToCSSText({
      position: 'absolute',
      top: 0,
      right: 0,
      lineHeight,
      fontFamily,
      fontSize,
      visibility: 'hidden',
      overflow: 'hidden'
    })
    el.innerHTML = `<span>${this.text}</span>`
    document.body.appendChild(el)
    this.fontCSS.lineHeight = el.offsetHeight
    console.log('line-height --- ' + this.fontCSS.lineHeight)
    document.body.removeChild(el)
  }
  /**
   * 计算总高度
   *
   * @param {Number} rowNumber 行数
   * @param {Number} height 行高
   * @param {Number} lineSpace 行距
   * @returns {Number}
   * @memberof DropCap
   */
  calculateHeight(rowNumber, height, lineSpace) {
    return height * rowNumber - lineSpace
  }
  /**
   * 计算字符的 baseline 比例
   * @param {String} fontFamily 
   * @param {String} text 
   * @param {Number} fontSize
   * @returns {Number}
   * @memberof DropCap
   */
  calculateBaselineRatio(fontFamily, text, fontSize) {
    const el = document.createElement('div')
    const cssText = transfromObjectToCSSText({
      display: 'block',
      position: 'absolute',
      top: 0,
      right: 0,
      lineHeight: 1,
      fontFamily,
      visibility: 'hidden',
      overflow: 'hidden'
    })
    el.style.cssText = cssText

    const small = document.createElement('span')
    const large = document.createElement('span')

    small.style.fontSize = toPXLength(0)
    large.style.fontSize = toPXLength(fontSize)

    small.innerHTML = text
    large.innerHTML = text
  
    el.appendChild(small)
    el.appendChild(large)

    document.body.appendChild(el)

    const samllRect = small.getBoundingClientRect()
    const baselinePosition = samllRect.top

    document.body.removeChild(el)

    return baselinePosition / fontSize
  }
  /**
   * 计算字符高度与 fontSize 的比例
   *
   * @param {String} text
   * @param {Number} fontSize
   * @param {String} fontFamily
   * @returns {Number}
   * @memberof DropCap
   */
  calculateTextHeightRatioByCanvas(text, fontSize, fontFamily) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    /**
     * 修复部分浏览器的差异性，加入其 content area 为 字体大小的 1.5 倍
     */
    const rows = fontSize * 1.5
    const cols = fontSize
    
    canvas.width = cols
    canvas.height = rows

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0,0, canvas.width, canvas.height)
    ctx.font = `${toPXLength(fontSize)} ${fontFamily}`
    ctx.fillStyle = '#000000'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 0, canvas.height / 2)

    const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const imageData = imageDataObj.data
    let startEdgeY, endEdgeY

    startState:
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col
        if (isBlack(imageData, index)) {
          startEdgeY = row
          break startState
        }
      }
    }

    endState:
    for (let row = rows; row >= 0; row--) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col
        if (isBlack(imageData, index)) {
          endEdgeY = row
          break endState
        }
      }
    }

    return {
      heightRatio: ( endEdgeY - startEdgeY ) / fontSize,
      ascenderRatio: (startEdgeY - fontSize * .25) / fontSize
    }
  }
  /**
   * 初始化
   *
   * @memberof DropCap
   */
  init() {
    const initialLetter = getCSSPropertyName('initial-letter', this.numberOfLine)
    if (initialLetter) {
      return 
    }
    const { lineHeight, fontSize, fontFamily } = this.fontCSS
    const height = Number.parseFloat(lineHeight, 10)
    const lineSpace = height - Number.parseFloat(fontSize, 10)
    const totalHeight = this.calculateHeight(this.numberOfLine, height, lineSpace)
    const baselineRatio = this.calculateBaselineRatio(fontFamily, this.text, testFontSize)
    const { heightRatio, ascenderRatio } = this.calculateTextHeightRatioByCanvas(this.text, testFontSize, fontFamily)
    const fontSizeInTotalHeight = totalHeight / heightRatio
    const capHeight = fontSizeInTotalHeight * ascenderRatio
    console.log(`totalHeight ---- ${totalHeight}`)
    console.log(baselineRatio, heightRatio)
    console.log(`fontSizeInTotalHeight ---- ${fontSizeInTotalHeight}`)
    console.log(`capHeight ---- ${capHeight}`)
    this.el.style.cssText = transfromObjectToCSSText({
      float: 'left',
      display: 'block',
      fontSize: toPXLength(fontSizeInTotalHeight),
      fontFamily,
      lineHeight: 1,
      height: toPXLength(totalHeight),
      padding: `${toPXLength(lineSpace / 2)} 0`,  
    })
    
    const heightSpan = document.createElement('span')
    heightSpan.style.cssText = transfromObjectToCSSText({
      display: 'block',
      marginTop: toPXLength(capHeight > 0 ? -capHeight : 0)
    })
    heightSpan.innerHTML = this.text
    this.el.innerHTML = heightSpan.outerHTML
  }
}

module.exports = DropCap