import createWrapper from './index'

const container = document.querySelector('.container') as HTMLElement

createWrapper({
  el: container,
  allowOverflow: true
})
