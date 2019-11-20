import { json, urlencoded } from 'body-parser'
import { join } from 'path'

import cors from 'cors'
import express from 'express'

import routes from './routes'
import { seedDb } from './dal/connection'

const app = express()
const port = process.env.PORT || 3001

seedDb()

app.use(cors())
app.use(json({ limit: '1mb' }))
app.use(urlencoded({ extended: true }))
app.use(express.static(join(__dirname, 'public')))

app.use('/api', routes)

app.listen(port, () => console.log('Server running on port: %d', port))
