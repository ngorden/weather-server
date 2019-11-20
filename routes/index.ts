import { Router } from 'express'
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status-codes'

import db from '../dal/connection'
import fetch from 'node-fetch'

require('dotenv').config()


const router = Router()

const weatherUri = 'http://api.openweathermap.org/data/2.5/weather?'
const weatherKey = process.env.OPEN_WEATHER_KEY || 'no_key'

router.get('/', (_req, res) =>
    db.find({}).sort({ "dt": -1, "sys.country": 1, "name": 1 }).exec((err: Error, docs: object[]) => {
        if (err) res.status(INTERNAL_SERVER_ERROR)
        res.json(docs)
    })
)

router.get('/forecast/:lat/:lon', async (req, res) => {
    let { lat, lon } = req.params
    const forecastUri = weatherUri + `lat=${lat}&lon=${lon}&appid=${weatherKey}`

    fetchForecast(forecastUri, (err: Error, data) => {
        if (err) res.status(INTERNAL_SERVER_ERROR)
        if (data) res.json(data)
        else res.status(BAD_REQUEST)
    })
})

router.post('/weather', (req, res) => {
    let lat = req.body.lat, lon = req.body.lon
    res.redirect(`/api/forecast/${lat}/${lon}`)
})

router.get('/weather/drop/:id', (req, res) => {
    let id = req.params.id
    db.remove({ "_id": id }, {}, (err, count) => {
        if (err) res.status(INTERNAL_SERVER_ERROR)
        if (count > 0) res.redirect('/api')
        res.end()
    })
})

router.get('/weather/:q', (req, res) => {
    let query: string = req.params.q
    let terms = query.trim().split(/,/g)

    if (terms.length !== 1 && terms.length !== 2) {
        res.status(BAD_REQUEST)
    }

    terms.forEach((term, i) => terms[i] = term.trim())

    let forecastUri = weatherUri
    if (!isNaN(Number(terms[0])))
        forecastUri += `zip=${terms[0]}` +
            ((terms[1]) ? `,${terms[1]}` : '') +
            `&appid=${weatherKey}`
    else {
        let city = terms[0], country = terms[1]
        forecastUri = forecastUri + `q=${city},${country}&appid=${weatherKey}`
    }

    fetchForecast(forecastUri, (err: Error, data) => {
        if (err) res.status(INTERNAL_SERVER_ERROR)
        if (data) res.json(data)
        else res.status(BAD_REQUEST)
    })
})

async function fetchForecast(forecastUri: string, callback: (err: any, data: any) => void) {
    fetch(forecastUri)
        .then(res => res.json())
        .then(forecastData => {
            insertForecast(forecastData)
                .then(value => callback(null, value))
                .catch(err => callback(err, null))
        })
        .catch(err => callback(err, null))
}

function insertForecast(data: any): Promise<object> {
    return new Promise(async (resolve, reject) => {
        db.insert(data, (err, doc) => {
            if (err) reject(err)
            if (doc) resolve(doc)
            reject('No docs created')
        })
    })
}

export default router
