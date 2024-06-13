import express from 'express'
import type { RequestHandler } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      userId: string
    }
  }
}

const app = express()
const port = 3000
const secret = 'xxxxxxxxx'

app.use(cors())
app.use(bodyParser.json())

const users = [
  {
    id: '0',
    username: 'admin',
    password: '666666'
  },
  {
    id: '1',
    username: 'user',
    password: '7777777'
  }
]

const generateToken = (id: string, type: 'accessToken' | 'refreshToken') => {
  return jwt.sign({ id, type }, secret, {
    expiresIn: type === 'accessToken' ? '5m' : '1h'
  })
}

const verifyToken = (token: string) => {
  return jwt.verify(token, secret) as {
    id: string
    type: 'accessToken' | 'refreshToken'
  }
}

app.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = users.find(user => user.username === username)
  if (!user) {
    res.status(400)
  } else if (username === user.username && password === user.password) {
    const accessToken = generateToken(user.id, 'accessToken')
    const refreshToken = generateToken(user.id, 'refreshToken')
    res.send({ accessToken, refreshToken })
  } else {
    res.status(400)
  }
})

const tokenMiddleware: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    res.status(401).end('Unauthorized')
  } else {
    try {
      const { id, type } = verifyToken(token)
      if (type === 'accessToken') {
        req.userId = id
        next()
      } else {
        res.status(401).end('Unauthorized')
      }
    } catch (error) {
      console.log(error)
      res.status(401).end('Unauthorized')
    }
  }
}

app.post('/refresh_token', (req, res) => {
  const { refreshToken } = req.body
  try {
    const { id, type } = verifyToken(refreshToken)
    if (type === 'accessToken') {
      res.status(401).end('Unauthorized')
    } else {
      const newAccessToken = generateToken(id, 'accessToken')
      const newRefreshToken = generateToken(id, 'refreshToken')
      res.send({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      })
    }
  } catch (error) {
    res.status(401).end('Unauthorized')
  }
})

app.get('/user', tokenMiddleware, (req, res) => {
  const id = req.userId
  const user = users.find(user => user.id === id)
  res.send(user)
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
