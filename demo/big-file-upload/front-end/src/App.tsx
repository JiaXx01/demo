import { Button, Progress } from 'antd'
import {
  selectFileFromLocal,
  sliceFileAndCalculateHash,
  uploadChunks
} from './lib/file'
import { useImmer } from 'use-immer'
export default function App() {
  const onUploadFile = async () => {
    const file = await selectFileFromLocal()
    if (!file) return
    const { chunkList, hash } = await sliceFileAndCalculateHash(file)
    uploadChunks(chunkList, hash, file, createProgress, addProgressValue)
  }
  const createProgress = (hash: string, initLoaded: number, total: number) => {
    setProgress(progress => {
      progress[hash] = { loaded: initLoaded, total }
    })
  }
  const addProgressValue = (hash: string, bytes: number) => {
    setProgress(progress => {
      progress[hash].loaded += bytes
    })
  }
  const [progress, setProgress] = useImmer<
    Record<
      string,
      {
        loaded: number
        total: number
      }
    >
  >({})
  return (
    <div>
      <Button onClick={onUploadFile}>上传</Button>
      <div>
        {Object.keys(progress).map(hash => {
          const { loaded, total } = progress[hash]
          const percent = Number((loaded / total).toFixed(2)) * 100
          return (
            <>
              <span>{hash}</span>
              <Progress percent={percent} />
            </>
          )
        })}
      </div>
    </div>
  )
}
