import { type UserOptions } from './index'
import { type Context, handleWrapperMove, parseMatrix } from './helper'

export const initEvents = (context: Context, userOptions: UserOptions) => {
  const {
    container,
    wrapper
  } = context

  const {
    scaleSize = 0.025,
    allowOverflow = true
  } = userOptions

  let isPointInContainer = false
  let isMoving = false
  const isMac = navigator.userAgent.indexOf('Mac') !== -1

  const onMouseEnter = () => {
    isPointInContainer = true
  }
  const onMouseLeave = () => {
    isPointInContainer = false
  }

  const onPointerWheel = (ev: WheelEvent) => {
    if (!isPointInContainer) return

    const { deltaY, metaKey, ctrlKey } = ev

    if (
      (isMac && !metaKey) ||
      (!isMac && !ctrlKey) ||
      deltaY === 0
    ) return

    context.scale = context.scale + scaleSize * deltaY * -1
  }

  const onKeydown = (e: KeyboardEvent) => {
    e.preventDefault()

    if (!isPointInContainer) return

    const { ctrlKey, metaKey, key } = e

    if (key === '=' && (isMac ? metaKey : ctrlKey)) {
      context.scale = context.scale * 1.1
      return
    }

    if (key === '-' && (isMac ? metaKey : ctrlKey)) {
      context.scale = context.scale * 0.9
      return
    }

    if (key === ' ' && context.movable) {
      isMoving = true
      context.container.style.cursor = 'grab'
    }
  }

  const onKeyup = (e: KeyboardEvent) => {
    if (e.key === ' ' && isMoving) {
      isMoving = false
      context.container.style.cursor = 'initial'
    }
  }

  const onMouseDown = (e: MouseEvent) => {
    if (isMoving) {
      const {
        clientX,
        clientY
      } = e
      context.defaultPosition = {
        left: clientX,
        top: clientY
      }
      context.currentMatrix = parseMatrix(window.getComputedStyle(context.wrapper).transform)

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }
  }

  const onMouseMove = (e: MouseEvent) => {
    handleWrapperMove(context, e, allowOverflow)
  }
  const onMouseUp = (e: MouseEvent) => {
    handleWrapperMove(context, e, allowOverflow)
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  const onMinusBtnClick = () => {
    context.scale = context.scale * 0.9
  }
  const onPlusBtnClick = () => {
    context.scale = context.scale * 1.1
  }
  const onScaleTextClick = () => {
    context.scale = 1
  }
  const onBackBtnClick = () => {
    const {
      originMatrix: [,,,,left, top],
      scale
    } = context

    context.translate(
      left * scale,
      top * scale
    )
  }

  container.addEventListener('mouseenter', onMouseEnter)
  container.addEventListener('mouseleave', onMouseLeave)

  document.addEventListener('wheel', onPointerWheel)
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('keyup', onKeyup)
  document.addEventListener('mousedown', onMouseDown)

  context.minusBtn.addEventListener('click', onMinusBtnClick)
  context.plusBtn.addEventListener('click', onPlusBtnClick)
  context.scaleText.addEventListener('click', onScaleTextClick)
  context.backBtn.addEventListener('click', onBackBtnClick)

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.intersectionRatio <= 0) {
        context.backBtn.style.display = 'block'
      } else {
        context.backBtn.style.display = 'none'
      }
    })
  })

  observer.observe(wrapper)

  const destroy = () => {
    container.removeEventListener('mouseenter', onMouseEnter)
    container.removeEventListener('mouseleave', onMouseLeave)
  
    document.removeEventListener('wheel', onPointerWheel)
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('keyup', onKeyup)
    document.removeEventListener('mousedown', onMouseDown)
  
    context.minusBtn.removeEventListener('click', onMinusBtnClick)
    context.plusBtn.removeEventListener('click', onPlusBtnClick)
    context.scaleText.removeEventListener('click', onScaleTextClick)
    context.backBtn.removeEventListener('click', onBackBtnClick)
  }

  return destroy
}
