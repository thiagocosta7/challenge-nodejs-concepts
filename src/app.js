const express = require('express')
const { uuid, isUuid } = require('uuidv4')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())

const repositories = []

// Function to log all requests
const logRequests = (request, response, next) => {
  const { method, url } = request
  const logLabel = `[${method.toUpperCase()}] ${url}`

  console.time(logLabel)
  next()
  console.timeEnd(logLabel)
}

// Function to verify if ID is a valid ID
const checkRepositoryId = (request, response, next) => {
  const { id } = request.params

  if(!isUuid(id)) {
      return response.status(400).json({ error: "Invalid repository ID!" })
  }

  return next()
}

// MIDDLEWARES
app.use(logRequests)
app.use('/repositories/:id', checkRepositoryId)

// LIST
app.get('/repositories', (request, response) => {
  return response.json(repositories)
})

// CREATE
app.post('/repositories', (request, response) => {
  const LIKES = 0
  const {
    title,
    url,
    techs
  } = request.body
  const repository = { id: uuid(), title, url, techs, likes: LIKES }

  repositories.push(repository)

  return response.json(repository)
})

// UPDATE
app.put('/repositories/:id', (request, response) => {
  const { id } = request.params
  const {
    title,
    url,
    techs
  } = request.body

  const repositoryIndex = repositories.findIndex(repository => repository.id === id)

  if(repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found!' })
  }

  const repository = {
    id,
    title,
    url,
    techs,
    likes: repositories[repositoryIndex].likes
  }

  repositories[repositoryIndex] = repository

  return response.json(repository)
})

// DELETE
app.delete('/repositories/:id', (request, response) => {
  const { id } = request.params
  const repositoryIndex = repositories.findIndex(repository => repository.id === id)
  if(repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found!' })
  }

  repositories.splice(repositoryIndex, 1)

  return response.status(204).send()
})

// ADD LIKE
app.post('/repositories/:id/like', (request, response) => {
  const { id } = request.params

  const repositoryIndex = repositories.findIndex(repository => repository.id === id)

  if(repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found!' })
  }

  const repository = {
    ...repositories[repositoryIndex],
    likes: repositories[repositoryIndex].likes + 1
  }

  repositories[repositoryIndex] = repository

  return response.json(repository)

})

module.exports = app
