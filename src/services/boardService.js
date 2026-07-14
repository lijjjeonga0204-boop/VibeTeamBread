const STORAGE_KEY = 'localhub_community_posts_v1'

function readPosts() {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    return []
  }

  try {
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed
  } catch (error) {
    return []
  }
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return (
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 10)
  )
}

function normalizeString(value) {
  return String(value || '').trim()
}

export function getPosts() {
  const posts = readPosts()
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })
}

export function createPost(postInput) {
  const title = normalizeString(postInput.title)
  const category = normalizeString(postInput.category)
  const content = normalizeString(postInput.content)
  const password = normalizeString(postInput.password)

  if (title.length < 2 || title.length > 60) {
    throw new Error('제목은 2자 이상 60자 이하로 입력해 주세요.')
  }

  if (category === '') {
    throw new Error('카테고리를 선택해 주세요.')
  }

  if (content.length < 5 || content.length > 2000) {
    throw new Error('내용은 5자 이상 2000자 이하로 입력해 주세요.')
  }

  if (password.length < 4 || password.length > 20) {
    throw new Error('비밀번호는 4자 이상 20자 이하로 입력해 주세요.')
  }

  const now = new Date().toISOString()

  const newPost = {
    id: createId(),
    title,
    category,
    content,
    author: '익명',
    password,
    createdAt: now,
    updatedAt: now,
  }

  const posts = readPosts()
  const nextPosts = [newPost, ...posts]
  savePosts(nextPosts)

  return newPost
}

export function getPostCount() {
  return getPosts().length
}