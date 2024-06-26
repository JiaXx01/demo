export function throttle_timestamp(fn, wait) {
  let preTime = 0
  return function () {
    const _this = this
    const args = arguments

    const now = Date.now()
    if (now - preTime > wait) {
      fn.apply(_this, args)
      preTime = now
    }
  }
}

// 与throttle_timestamp效果一致，触发立即执行
export function throttle_timer(fn, wait) {
  let timer = null
  return function () {
    const _this = this
    const args = arguments
    if (!timer) {
      fn.apply(_this, args)
      timer = setTimeout(() => {
        clearTimeout(timer)
        timer = null
      }, wait)
    }
  }
}

// 与throttle_timer和throttle_timestamp不同，触发后等待wait才初次执行
// 并且throttle_timer_2在停止触发后还会在执行最后一次，而throttle_timer和throttle_timestamp不会
export function throttle_timer_2(fn, wait) {
  let timer = null
  return function () {
    const _this = this
    const args = arguments
    if (!timer) {
      timer = setTimeout(() => {
        clearTimeout(timer)
        timer = null
        fn.apply(_this, args)
      }, wait)
    }
  }
}

// 事件触发立即执行，结束触发后执行最后一次
export function throttle_start_and_end(fn, wait) {
  let timer = null
  let preTime = 0

  return function () {
    const _this = this
    const args = arguments

    const nowTime = Date.now()
    const leftTime = preTime + wait - nowTime

    if (leftTime <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      preTime = nowTime
      fn.apply(_this, args)
    } else if (!timer) {
      timer = setTimeout(function () {
        preTime = Date.now()
        timer = null
        fn.apply(_this, args)
      }, leftTime)
    }
  }
}

// 仅执行立即执行或尾执行
export function throttle_start_or_end(fn, wait, option = {}) {
  let timer = null
  let preTime = 0

  const debounced = function () {
    const _this = this
    const args = arguments

    const nowTime = Date.now()
    if (!preTime && option.leading === false) preTime = nowTime
    const leftTime = preTime + wait - nowTime

    if (leftTime <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      preTime = nowTime
      fn.apply(_this, args)
    } else if (!timer && option.trailing !== false) {
      timer = setTimeout(function () {
        preTime = option.leading === false ? 0 : Date.now()
        timer = null
        fn.apply(_this, args)
      }, leftTime)
    }
  }

  debounced.cancel = function () {
    clearTimeout(timer)
    timer = null
    preTime = 0
  }

  return debounced
}
