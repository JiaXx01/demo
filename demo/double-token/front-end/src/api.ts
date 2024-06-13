import axios, { type AxiosRequestConfig } from 'axios'

axios.defaults.baseURL = 'http://localhost:3000'

axios.interceptors.request.use(
  config => {
    const accessToken = window.localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = 'Bearer ' + accessToken
    }
    return config
  },
  error => error
)

let refreshing = false
const reqQueue: AxiosRequestConfig[] = []

axios.interceptors.response.use(
  response => response,
  async error => {
    const { config, status } = error.response

    if (config.url === '/refresh_token' && status === 401) {
      // refreshToken也过期了
      window.alert('请重新登录')
      // 这里如果继续 return Promise.reject(error)就会陷入死循环
      // 一般应用中，这里应该是执行退出登录的方法，将页面跳转到登陆页面
      setTimeout(() => {
        window.location.href = '/'
      })
      return
    }

    if (refreshing) {
      return reqQueue.push(config)
    }

    if (status === 401) {
      try {
        refreshing = true
        await getRefreshToken()
        // 执行请求队列中所有的请求
        await Promise.all(reqQueue.map(config => axios(config)))
        // 清空请求队列
        reqQueue.length = 0
        refreshing = false

        return axios(config)
      } catch (error) {
        return Promise.reject(error)
      }
    } else {
      return Promise.reject(error)
    }
  }
)

export const login = async (
  username: string,
  password: string
): Promise<{
  accessToken: string
  refreshToken: string
}> => {
  return axios
    .post('/login', {
      username,
      password
    })
    .then(res => res.data)
}

export const getMe = async () => {
  return axios.get('/user').then(res => res.data)
}

const getRefreshToken = async () => {
  const refreshToken = window.localStorage.getItem('refreshToken')
  const newTokens = await axios
    .post('/refresh_token', { refreshToken })
    .then(res => res.data)
  window.localStorage.setItem('accessToken', newTokens.accessToken)
  window.localStorage.setItem('refreshToken', newTokens.refreshToken)
}
