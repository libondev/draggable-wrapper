import type { UserOptions, Position } from './index'

export interface Size {
  width: number
  height: number
}

type Matrix = [number, number, number, number, number, number]

export interface Context {
  container: HTMLElement
  wrapper: HTMLElement
  minusBtn: HTMLElement
  plusBtn: HTMLElement
  scaleText: HTMLElement
  backBtn: HTMLElement
  _scale: number
  containerSize: Size
  wrapperSize: Size
  scale: number
  defaultPosition: Position
  readonly originMatrix: Matrix
  currentMatrix: Matrix
  readonly actualSize: Size
  readonly xAxisRate: number
  readonly yAxisRate: number
  readonly movable: boolean
  translate(x?: number, y?: number): void
  resize(): void
}

export const createContext = (
  userOptions: UserOptions,
  container: HTMLElement,
  wrapper: HTMLElement,
  minusBtn: HTMLElement,
  plusBtn: HTMLElement,
  scaleText: HTMLElement,
  backBtn: HTMLElement
): Context => {
  const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect()
  const { width: wrapperWidth, height: wrapperHeight } = wrapper.getBoundingClientRect()

  const matrix = parseMatrix(window.getComputedStyle(wrapper).transform)
  return {
    container: container,
    wrapper: wrapper,
    minusBtn,
    plusBtn,
    scaleText,
    backBtn,
    _scale: 1,
    containerSize: {
      width: containerWidth,
      height: containerHeight,
    },
    wrapperSize: {
      width: wrapperWidth,
      height: wrapperHeight
    },
    originMatrix: matrix,
    currentMatrix: matrix,

    defaultPosition: {
      left: 0,
      top: 0
    },

    get scale () {
      return this._scale
    },

    set scale (val) {
      this._scale = Math.max(userOptions.minScale ?? 0.01, val)

      setWrapperStyle(this.wrapper, {
        width: `${this.actualSize.width}px`,
        height: `${this.actualSize.height}px`
      })

      scaleText.textContent = `${Math.floor(this.scale * 100)}%`

      userOptions?.onChange?.('scale', this.scale)
    },

    get actualSize () {
      return {
        width: this.scale * this.wrapperSize.width,
        height: this.scale * this.wrapperSize.height
      }
    },

    get xAxisRate () {
      return this.actualSize.width / this.containerSize.width
    },

    get yAxisRate () {
      return this.actualSize.height / this.containerSize.height
    },

    get movable () {
      // return this.xAxisRate > 1 || this.yAxisRate > 1
      return true
    },

    translate (x = 0, y = 0) {
      const {
        currentMatrix,
        wrapper
      } = this
    
      wrapper.style.transform = `matrix(${
        [
          ...currentMatrix.slice(0, 4),
          x,
          y
        ].join(',')
      })`

      userOptions?.onChange?.('position', { left: x, top: y })
    },

    resize () {
      const { width: newContainerWidth, height: newContainerHeight } = container.getBoundingClientRect()

      const widthRatio = newContainerWidth / this.containerSize.width
      const heightRatio = newContainerHeight / this.containerSize.height

      this.containerSize = {
        width: newContainerWidth,
        height: newContainerHeight
      }

      this.wrapperSize = {
        width: this.wrapperSize.width * widthRatio,
        height: this.wrapperSize.height * heightRatio
      }

      this.scale = this.scale
    }
  }
}

export const parseMatrix = (str: unknown): Matrix => {
  const match = `${str}`.match(/matrix\(([\d\D]+)\)/)
  if (match) {
    return match[1].split(',').map(Number) as Matrix
  }
  
  return [1, 0, 0, 1, 0, 0] as Matrix
}

export const setContainerStyle = (container: HTMLElement) => {
  container.style.cssText = 'overflow: hidden;' +
    'transform: translateZ(0);' +
    'position: relative;' +
    'width: 100%;' +
    'height: 100%;'
}

export const setWrapperStyle = (wrapper: HTMLElement, style: Record<string, string | number>) => {
  Object.entries(style).forEach(([prop, value]) => {
    wrapper.style[prop as any] = `${value}`
  })
}

export const handleWrapperMove = (context: Context, e: MouseEvent, allowOverflow: boolean) => {
  const {
    clientX,
    clientY
  } = e

  const {
    currentMatrix,
    defaultPosition,
    actualSize,
    containerSize
  } = context

  const [
    translateX,
    translateY
  ] = [
    currentMatrix[4] + (clientX - defaultPosition.left),
    currentMatrix[5] + (clientY - defaultPosition.top)
  ]

  context.translate(
    allowOverflow ? translateX : Math.min(0, Math.max(containerSize.width - actualSize.width, translateX)),
    allowOverflow ? translateY : Math.min(0, Math.max(containerSize.height - actualSize.height, translateY))
  )
}

export const createHelperBar = () => {
  const oBar = document.createElement('div')

  const oScaleControl = document.createElement('div')

  const oMinusBtn = document.createElement('div')
  oMinusBtn.textContent = '-'
  const oScale = document.createElement('div')
  oScale.textContent = `100%`
  const oPlusBtn = document.createElement('div')
  oPlusBtn.textContent = '+'

  const oBackBtn = document.createElement('div')
  oBackBtn.textContent = '滚动回到内容'

  oScaleControl.appendChild(oMinusBtn)
  oScaleControl.appendChild(oScale)
  oScaleControl.appendChild(oPlusBtn)

  oBar.appendChild(oScaleControl)
  oBar.appendChild(oBackBtn)

  oBar.style.cssText = `
    --color: #333;
    --border-color: #f1f1f1;
    --size: 32px;
    --border-radius: 4px;
    --background-color: #fff;

    display: inline-flex;
    align-items: center;
    gap: 16px;
    position: absolute;
    left: 50%;
    bottom: 16px;
    color: var(--color);
    transform: translateX(-50%);
  `

  oScaleControl.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--background-color);
  `

  oMinusBtn.style.cssText = oPlusBtn.style.cssText = `
    width: var(--size);
    height: var(--size);
    text-align: center;
    line-height: var(--size);
    font-size: 1em;
    cursor: pointer;
  `

  oScale.style.cssText = `
    min-width: 60px;
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
  `

  oBackBtn.style.cssText = `
    display: none;
    padding: 0 8px;
    line-height: var(--size);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--background-color);
    cursor: pointer;
  `

  return {
    oBar,
    oMinusBtn,
    oPlusBtn,
    oScale,
    oBackBtn
  }
}
