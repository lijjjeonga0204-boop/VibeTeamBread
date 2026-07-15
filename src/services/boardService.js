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

function normalizeString(value) {
  return String(value || '').trim()
}

function validatePostFields(title, category, content) {
  const normalizedTitle = normalizeString(title)
  const normalizedCategory = normalizeString(category)
  const normalizedContent = normalizeString(content)

  if (normalizedTitle.length < 2 || normalizedTitle.length > 60) {
    throw new Error('제목은 2자 이상 60자 이하로 입력해 주세요.')
  }

  if (normalizedCategory === '') {
    throw new Error('카테고리를 선택해 주세요.')
  }

  if (normalizedContent.length < 5 || normalizedContent.length > 2000) {
    throw new Error('내용은 5자 이상 2000자 이하로 입력해 주세요.')
  }

  return {
    title: normalizedTitle,
    category: normalizedCategory,
    content: normalizedContent,
  }
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

export function getPosts() {
  const posts = readPosts()
  return [...posts].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime()
    const bTime = new Date(b.createdAt).getTime()
    return bTime - aTime
  })
}

export function createPost(postInput) {
  const { title, category, content } = validatePostFields(
    postInput.title,
    postInput.category,
    postInput.content,
  )
  const password = normalizeString(postInput.password)

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

export function updatePost(postId, postInput, password) {
  const posts = readPosts()
  const normalizedId = String(postId)
  const existingPost = posts.find((post) => String(post.id) === normalizedId)

  if (!existingPost) {
    throw new Error('수정할 게시글을 찾을 수 없습니다.')
  }

  if (existingPost.password !== password) {
    throw new Error('비밀번호가 일치하지 않습니다.')
  }

  const { title, category, content } = validatePostFields(
    postInput.title,
    postInput.category,
    postInput.content,
  )

  const updatedPost = {
    ...existingPost,
    title,
    category,
    content,
    updatedAt: new Date().toISOString(),
  }

  const nextPosts = posts.map((post) =>
    String(post.id) === normalizedId ? updatedPost : post,
  )

  savePosts(nextPosts)
  return updatedPost
}

export function deletePost(postId, password) {
  const posts = readPosts()
  const normalizedId = String(postId)
  const existingPost = posts.find((post) => String(post.id) === normalizedId)

  if (!existingPost) {
    throw new Error('삭제할 게시글을 찾을 수 없습니다.')
  }

  if (existingPost.password !== password) {
    throw new Error('비밀번호가 일치하지 않습니다.')
  }

  const nextPosts = posts.filter(
    (post) => String(post.id) !== normalizedId,
  )

  savePosts(nextPosts)
  return existingPost
}

export function getRecentPosts(limit = 3) {
  let safeLimit = Number(limit)
  if (!Number.isFinite(safeLimit) || safeLimit < 1) {
    safeLimit = 3
  }

  return getPosts()
    .slice(0, safeLimit)
    .map((post) => ({
      id: post.id,
      title: post.title,
      category: post.category,
      content: post.content,
      author: post.author,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }))
}