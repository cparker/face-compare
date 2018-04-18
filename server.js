'use strict'

const fs = require('fs')
const http = require('http')
const https = require('https')
const privateKey = fs.readFileSync('key.pem', 'utf8')
const certificate = fs.readFileSync('certificate.pem', 'utf8')
const bodyParser = require('body-parser')
const AWS = require('aws-sdk')
const rekognition = new AWS.Rekognition()




const credentials = {
    key: privateKey,
    cert: certificate
}
const express = require('express')
const app = express()
app.use(express.static('.'))

app.use(bodyParser.json({
    limit: '500mb'
}))
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.raw({
    type: 'text/plain',
    limit: '500mb'
}))

app.post('/doCompare', async (req, res, next) => {
    // console.log(req.body)
    const leftPicText = req.body.leftImage.toString('utf-8')
    const leftBase64Text = leftPicText.split('base64,')[1]
    const leftBase64Data = Buffer.from(leftBase64Text, 'base64')

    const rightPicText = req.body.rightImage.toString('utf-8')
    const rightBase64Text = rightPicText.split('base64,')[1]
    const rightBase64Data = Buffer.from(rightBase64Text, 'base64')

    let compareResult
    try {
        compareResult = await compareFacesPromiseRaw(leftBase64Data, rightBase64Data)
        res.status(201).send(compareResult)
    } catch (err) {
        res.status(500).send(err)
    }
})

const httpServer = http.createServer(app)
// const httpsServer = https.createServer(credentials, app)

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
    console.log(`HTTP listening on ${PORT}`)
})

// httpsServer.listen(PORT, () => {
//     console.log(`listening on ${PORT}`)
// })


function compareFacesPromiseRaw(sourceImageBuffer, targetImageBuffer) {
    return new Promise((resolve, reject) => {
        const params = {
            SimilarityThreshold: 0,
            SourceImage: {
                Bytes: sourceImageBuffer
            },
            TargetImage: {
                Bytes: targetImageBuffer
            }
        }
        rekognition.compareFaces(params, (err, data) => {
            if (err) {
                console.log('error in compare faces', err, err.stack)
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

function compareFacesPromise(sourceFilename, targetFilename) {
    const sourceBuffer = fs.readFileSync(sourceFilename)
    const targetBuffer = fs.readFileSync(targetFilename)
    return compareFacesPromiseRaw(sourceBuffer, targetBuffer)
}