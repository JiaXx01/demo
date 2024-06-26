function getRandomArray(length) {
  // 创建一个有顺序的数组 [0, 1, 2, ..., length-1]
  const array = Array.from({ length }, (_, index) => index)

  // 使用 Fisher-Yates 洗牌算法打乱数组
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)) // 生成一个随机索引
    ;[array[i], array[j]] = [array[j], array[i]] // 交换元素
  }

  return array
}
const TEST_ARR = getRandomArray(100)

// 冒泡排序
function bubbleSort(arr) {
  const len = arr.length
  for (let i = 0; i < len; i++) {
    for (let j = 1; j < len - i; j++) {
      if (arr[j - 1] > arr[j]) {
        ;[arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]
      }
    }
  }
  return arr
}
console.log(bubbleSort([...TEST_ARR]))

// 选择排序
function selectionSort(arr) {
  const len = arr.length
  for (let i = 0; i < len; i++) {
    let minIndex = i // 记录最小值的索引
    for (let j = i + 1; j < len; j++) {
      if (arr[j] < arr[minIndex]) minIndex = j
    }
    ;[arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
  }
  return arr
}
console.log(selectionSort([...TEST_ARR]))

// 插入排序
function insertionSort(arr) {
  const len = arr.length
  for (let i = 1; i < len; i++) {
    let index = i - 1
    const curVal = arr[i]
    while (index >= 0 && arr[index] > curVal) {
      arr[index + 1] = arr[index--]
    }
    arr[index + 1] = curVal
  }
  return arr
}
console.log(insertionSort([...TEST_ARR]))

// 快速排序
function quickSort(arr) {
  if (arr.length <= 1) return arr
  const pivotIndex = Math.floor(arr.length / 2)
  const pivot = arr.splice(pivotIndex, 1)[0]

  const left = []
  const right = []
  for (let i = 0, len = arr.length; i < len; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i])
    } else {
      right.push(arr[i])
    }
  }

  return [...quickSort(left), pivot, ...quickSort(right)]
}
console.log(quickSort([...TEST_ARR]))
