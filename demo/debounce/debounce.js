export function debounce_easy(fn, wait) {
  let timer = null
  return function () {
    if (timer) clearTimeout(timer)
    timer = setTimeout(fn, wait)
  }
}

export function debounce_this(fn, wait) {
  let timer = null
  return function () {
    const _this = this
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(_this)
    }, wait)
  }
}

export function debounce_args(fn, wait) {
  let timer = null
  return function () {
    const _this = this
    const args = arguments
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(_this, args)
    }, wait)
  }
}

export function debounce_immediate(fn, wait, immediate) {
  let timer = null
  return function () {
    const _this = this
    const args = arguments
    if (timer) clearTimeout(timer)
    if (immediate) {
      const nowCall = !timer
      timer = setTimeout(function () {
        timer = null
      }, wait)
      if (nowCall) fn.apply(_this, args)
    } else {
      timer = setTimeout(function () {
        fn.apply(_this, args)
      }, wait)
    }
  }
}
