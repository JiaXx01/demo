import { useState } from 'react'
import { getMe, login } from './api'

export default function App() {
  const onGetMe = () => {
    getMe()
    getMe()
    getMe()
  }
  return (
    <div>
      <Login />
      <button onClick={onGetMe}>获取用户信息</button>
    </div>
  )
}

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const onLogin = async () => {
    if (!username || !password) return
    const { accessToken, refreshToken } = await login(username, password)
    window.localStorage.setItem('accessToken', accessToken)
    window.localStorage.setItem('refreshToken', refreshToken)
  }
  return (
    <div>
      <form>
        <label htmlFor="username">用户名</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <label htmlFor="password">密码</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button type="button" onClick={onLogin}>
          登陆
        </button>
      </form>
    </div>
  )
}
