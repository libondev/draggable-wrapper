
import { initEvents } from './events'
import { setContainerStyle, createContext, setWrapperStyle, createHelperBar } from './helper'
import './style.css'

export interface UserOptions {
  el: string | HTMLElement

  scaleSize?: number
  /** 是否允许超出边界 */
  allowOverflow?: boolean
  minScale?: number
}

function createWrapper (userOptions: UserOptions) {
  const {
    el
  } = userOptions

  const oContainer = typeof el === 'string'
    ? document.querySelector<HTMLElement>(el)!
    : el

  if (!('innerHTML' in oContainer)) {
    throw new TypeError(`'el' expect a selector or a HTML element, but got: ${el}`)
  }

  const oWrapper = oContainer.firstElementChild as HTMLElement

  if (!oWrapper || oContainer.children.length > 1) {
    throw new Error('Container should have one child element')
  }

  setContainerStyle(oContainer)
  setWrapperStyle(oWrapper, {
    transformOrigin: 'center center'
  })

  const {
    oBar,
    oMinusBtn,
    oPlusBtn,
    oScale,
    oBackBtn
  } = createHelperBar()
  oContainer.appendChild(oBar)

  const context = createContext(
    userOptions,
    oContainer,
    oWrapper,
    oMinusBtn,
    oPlusBtn,
    oScale,
    oBackBtn
  )

  const removeEvents = initEvents(context, userOptions)

  const destroy = () => {
    removeEvents()
    oContainer.removeChild(oBar)
    oContainer.style.cssText = ''
    oWrapper.style.cssText = ''
  }

  return {
    destroy
  }
}

export default createWrapper
