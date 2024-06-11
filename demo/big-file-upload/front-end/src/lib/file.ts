import axios from 'axios'
import SliceAndHash from './worker/SliceAndHash?worker'
import pLimit from 'p-limit'

const CHUNK_SIZE = 5 * 1024 * 1024
const requestLimit = pLimit(4)

export function selectFileFromLocal(): Promise<File | null> {
  return new Promise(resolve => {
    const upload = document.createElement('input')
    upload.type = 'file'
    upload.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      upload.remove()
      if (!file) return resolve(null)
      resolve(file)
    })
    upload.click()
  })
}

export function sliceFileAndCalculateHash(file: File): Promise<{
  chunkList: Blob[]
  hash: string
}> {
  const worker = new SliceAndHash()
  worker.postMessage({ file, chunkSize: CHUNK_SIZE })
  return new Promise(resolve => {
    worker.onmessage = e => {
      resolve(e.data)
    }
  })
}

export async function uploadChunks(
  chunkList: Blob[],
  hash: string,
  // 添加入参 file、createProgress、changeProgress
  file: File,
  createProgress: (hash: string, initLoaded: number, total: number) => void,
  addProgressValue: (hash: string, bytes: number) => void
) {
  const { data: fileStatus } = await axios.get(
    `http://localhost:3000/check/` + hash
  )
  if (fileStatus === true) return '上传成功'
  const { uploadedChunkIndexList, uploadedSize } = fileStatus as {
    uploadedChunkIndexList: number[]
    uploadedSize: number
  }
  // 创建一条上传进度条
  createProgress(hash, uploadedSize, file.size)

  const notUploadedChunkList = chunkList.filter((_, index) => {
    return !uploadedChunkIndexList.includes(index)
  })
  const uploadRequestList = notUploadedChunkList.map((chunk, index) => {
    return requestLimit(() =>
      axios.postForm(
        'http://localhost:3000/chunk',
        {
          chunk,
          hash,
          index
        },
        {
          // 监听上传进度
          onUploadProgress(e) {
            addProgressValue(hash, e.bytes)
          }
        }
      )
    )
  })
  // // 等待所有切片上传完毕
  await Promise.all(uploadRequestList)
  // 合并切片
  await axios.post('http://localhost:3000/merge', {
    hash
  })
}
