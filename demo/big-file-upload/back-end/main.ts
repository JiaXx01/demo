import fs from 'fs'

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'
import type { UploadedFile } from 'express-fileupload'

const app = express()
const port = 3000

const createFolder = function (folder: string) {
  try {
    fs.accessSync(folder)
  } catch (e) {
    fs.mkdirSync(folder)
  }
}

const TMP_DIR = 'tmp/'
const UPLOAD_DIR = 'file/'

createFolder(TMP_DIR)
createFolder(UPLOAD_DIR)

app.use(cors())
app.use(bodyParser.json())
app.use(
  fileUpload({
    createParentPath: true
  })
)

app.get('/', (req, res) => {
  res.send('hello')
})

app.post('/chunk', (req, res) => {
  const chunk = req.files!.chunk as UploadedFile
  const { hash, index } = req.body
  chunk.mv(`${__dirname}/tmp/${hash}/${index}`)
  res.status(200).send('success')
})

app.get('/check/:hash', (req, res) => {
  const { hash } = req.params
  const filePath = `${__dirname}/file/${hash}`
  const chunkFolder = `${__dirname}/tmp/${hash}`
  // 首先检查文件是否已上传
  const isExist = fs.existsSync(filePath)
  if (isExist) {
    res.send(isExist)
    return
  }
  // 获取上传切片列表
  let chunkList: string[] = []
  try {
    chunkList = fs.readdirSync(chunkFolder)
  } catch {}
  // 已上传切片总大小
  let uploadedSize: number = 0
  // 部分上传
  const uploadedChunkIndexList = chunkList.map(chunk => {
    const stats = fs.statSync(`${__dirname}/tmp/${hash}/${chunk}`)
    uploadedSize += stats.size
    return Number(chunk)
  })
  res.send({ uploadedChunkIndexList, uploadedSize })
})

app.post('/merge', async (req, res) => {
  const { hash, chunkSize = 5 * 1024 * 1024, ...info } = req.body
  const chunkFolder = `${__dirname}/tmp/${hash}`
  const filePath = `${__dirname}/file/${hash}`
  const chunkIndexList = fs.readdirSync(chunkFolder)
  const mergeList = chunkIndexList.map((_, index) => {
    return new Promise(resolve => {
      const chunkPath = `${chunkFolder}/${index}`
      const readStream = fs.createReadStream(chunkPath)
      const mergeStream = fs.createWriteStream(filePath, {
        start: index * chunkSize
      })
      readStream.on('end', () => {
        // 删除切片文件
        fs.unlinkSync(chunkPath)
        resolve(true)
      })
      readStream.pipe(mergeStream)
    })
  })
  await Promise.all(mergeList)
  fs.rmdirSync(chunkFolder)
  res.send('success')
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
