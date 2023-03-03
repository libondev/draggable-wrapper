import './style.css'

export interface UserOptions {
  container?: HTMLElement

  scaleSize?: number
}

type PluginOptions = Required<UserOptions>

type Position = Record<'x' | 'y', number>

let scaleRate = 1

let downPosition: Position

let prevPosition: Position = { x: 0, y: 0 }

function createWrapper (userOptions?: UserOptions) {
  const {
    container,
    scaleSize
  }: PluginOptions = Object.assign({
    container: document.body,
    scaleSize: 0.25
  }, userOptions)

  const BODY = document.body

  const onPointerDown = (ev: PointerEvent) => {
    const { clientX, clientY, buttons, ctrlKey, shiftKey, altKey } = ev

    // 鼠标中键
    if (ctrlKey || shiftKey || altKey || buttons !== 1) {
      return
    }

    ev.preventDefault()

    downPosition = { x: clientX, y: clientY }

    BODY.addEventListener('pointermove', onPointerMove, { passive: true })
    BODY.addEventListener('pointerup', onPointerUp, { once: true })
  }

  const onPointerMove = ({ clientX, clientY }: PointerEvent) => {
    const offsetX = clientX - downPosition.x
    const offsetY = clientY - downPosition.y

    container.style.transform = `translate3d(${prevPosition.x + offsetX}px, ${prevPosition.y + offsetY}px, 0)`
  }

  const onPointerUp = () => {
    const [, x, y] = container.style.transform.match(/translate3d\((.+?)px, (.+?)px, 0px\)/) ?? []

    prevPosition = { x: ~~x, y: ~~y }

    BODY.removeEventListener('pointermove', onPointerMove)
  }

  const onPointerWheel = (ev: WheelEvent) => {
    const { deltaY, shiftKey, ctrlKey } = ev

    if (ctrlKey || shiftKey) return

    if (deltaY >= 0) {
      scaleRate = Math.max(scaleRate - scaleSize, 0.25)
    } else {
      scaleRate = Math.min(scaleRate + scaleSize, 3)
    }

    container.style.zoom = scaleRate
  }

  const initial = () => {
    BODY.addEventListener('wheel', onPointerWheel)
    BODY.addEventListener('pointerdown', onPointerDown)

    if (container.parentNode != null) {
      (container.parentNode as HTMLElement).classList.add('overflow-hidden')
    }
  }

  const destroy = () => {
    BODY.removeEventListener('wheel', onPointerWheel)
    BODY.removeEventListener('pointermove', onPointerMove)
  }

  initial()

  return {
    initial,
    destroy
  }
}

export default createWrapper
