const STORAGE_KEY = 'auth_redirect'

export const getAuthRedirect = () => {
  return sessionStorage.getItem(STORAGE_KEY) || undefined
}

export const setAuthRedirect = (redirect: string) => {
  sessionStorage.setItem(STORAGE_KEY, redirect)
}

export const clearAuthRedirect = () => {
  sessionStorage.removeItem(STORAGE_KEY)
}

/**
 * 验证 URL 是否是安全的跳转地址
 * - 允许相对路径 (以 / 开头)
 * - 允许当前域名的绝对路径
 * - 禁止外部域名 (除非有白名单，目前暂无)
 */
export const isValidRedirect = (url: string): boolean => {
  if (!url) return false

  // 1. 允许相对路径
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true
  }

  try {
    const urlObj = new URL(url)
    const currentOrigin = window.location.origin

    // 2. 允许同域名
    return urlObj.origin === currentOrigin
  } catch {
    // 解析失败视为不安全
    return false
  }
}

/**
 * 验证 referer 是否是有效的跳转来源
 * - 必须是安全的 URL
 * - 不能是当前域名的认证相关页面
 */
export const isValidReferer = (referer: string): boolean => {
  if (!isValidRedirect(referer)) return false

  try {
    const refererUrl = new URL(referer, window.location.origin) // Handle relative or absolute
    
    // 排除认证相关页面
    const authPaths = ['/signin', '/verify-otp', '/callback']
    return !authPaths.some((path) => refererUrl.pathname.startsWith(path))
  } catch {
    return false
  }
}

/**
 * 获取最终的跳转地址
 * 优先级：query 参数 > referer > sessionStorage
 */
export const resolveRedirect = (queryRedirect?: string): string | undefined => {
  // 1. 优先使用 query 参数 (必须验证安全性)
  if (queryRedirect && isValidRedirect(queryRedirect)) {
    setAuthRedirect(queryRedirect)
    return queryRedirect
  }

  // 2. 尝试使用 referer
  const referer = document.referrer
  if (isValidReferer(referer)) {
    setAuthRedirect(referer)
    return referer
  }

  // 3. 从 sessionStorage 读取 (假设存储时已验证，或者读取后再验证)
  const stored = getAuthRedirect()
  if (stored && isValidRedirect(stored)) {
    return stored
  }
  
  return undefined
}

/**
 * 执行登录后的跳转
 * - 如果有存储的跳转地址，清除并跳转到该地址
 * - 否则跳转到默认页面 /console/apps
 */
export const performPostLoginRedirect = (
  navigate: (opts: { to: string }) => void,
) => {
  const redirect = resolveRedirect() // Re-resolve or just get stored
  // Since resolveRedirect writes to storage, we can just read storage or use the return value.
  // Ideally, we explicitly read storage to clear it.
  
  const storedRedirect = getAuthRedirect()
  
  if (storedRedirect && isValidRedirect(storedRedirect)) {
    clearAuthRedirect()
    window.location.href = storedRedirect
  } else {
    navigate({ to: '/' })
  }
}
