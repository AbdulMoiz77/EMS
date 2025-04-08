const db = require('../Database/config.js')

class LogsModel {

    static async putReadings(timestamp, temperature, humidity){
        try {
            const result = await db.execute(
                'INSERT INTO AirQualitylogs(Timestamp, Temperature, Humidity) VALUES (?, ?, ?)',[timestamp, temperature, humidity]
            )
            console.log(result)
        } catch(err){
            throw new Error('Error creating error: '+ err.message)
        }
    }
}

module.exports = LogsModel;