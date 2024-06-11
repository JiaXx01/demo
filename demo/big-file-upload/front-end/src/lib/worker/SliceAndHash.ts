import SparkMd5 from 'spark-md5'

onmessage = ({ data: { file, chunkSize } }) => {
  const chunks = Math.ceil(file.size / chunkSize)
  let allChunkSize = 0
  const chunkList: Blob[] = []
  const spark = new SparkMd5.ArrayBuffer()

  const processChunk = (index: number) => {
    // 递归出口
    if (index >= chunks) {
      const hash = spark.end()
      postMessage({ chunkList, hash })
      return
    }

    // 切片
    const chunk = file.slice(allChunkSize, allChunkSize + chunkSize)
    allChunkSize += chunkSize
    chunkList.push(chunk)

    // 计算哈希
    const fileReader = new FileReader()
    fileReader.onload = e => {
      spark.append(e.target?.result as ArrayBuffer)
      // 递归调用，处理下一个切片
      processChunk(index + 1)
    }
    fileReader.readAsArrayBuffer(chunk)
  }

  // 开始递归处理切片
  processChunk(0)
}
