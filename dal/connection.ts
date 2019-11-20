import Datastore from 'nedb'

const weather = new Datastore({ filename: 'weather.db', autoload: true })
export const location = new Datastore({ filename: 'location.db', autoload: true })

export function seedDb() {
    weather.find({}, (err: Error, docs: Document[]) => {
        if (err) console.error(err)
        else if (docs.length === 0) insertSeedData()
    })
}

function insertSeedData() {
    var seedEntry = [{
        "coord": { "lon": -117.16, "lat": 32.72 }, "weather": [{ "id": 802, "main": "Clouds", "description": "scattered clouds", "icon": "03d" }],
        "base": "stations", "main": { "temp": 291.06, "pressure": 1013, "humidity": 33, "temp_min": 284.15, "temp_max": 296.48 },
        "visibility": 16093, "wind": { "speed": 2.73, "deg": 88 }, "rain": {}, "clouds": { "all": 40 },
        "dt": 1574091538, "sys": { "type": 1, "id": 5771, "country": "US", "sunrise": 1574086888, "sunset": 1574124385 },
        "timezone": -28800, "id": 5391811, "name": "San Diego", "cod": 200
    }]

    weather.insert(seedEntry, (err: Error, docs: object[]) => {
        if (err) console.error(err)
        else console.log('%d weather report seeded', docs.length)
    })
}

export default weather
