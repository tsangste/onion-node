const request = require('sync-request')
const crypto = require('crypto')
const fs = require('fs')

const server = 'http://192.168.0.14:1337'

const defaultOptions = {
    algorithm: 'aes192'
}

function createUser(userName, shipId, callback) {
    if (typeof userName !== 'string' && !(userName instanceof String)) {
        throw new Error('username should be a string')
    }

    var res = request('POST', `${server}/shipmates`, {
        json: {
            name: userName,
            shipId
        }
    })

    const msg = res.getBody('utf8')
    console.log(msg)
    return msg
}

function bonusPoints(userId, callback) {
    var res = request('POST', `${server}/packagescore`, {
        json: {
            user: userId
        }
    })

    const msg = res.getBody('utf8')
    console.log(msg)
    return msg
}

function encryptFile(inputPath, outputPath, key, options, callback) {

    if (typeof options === 'function') {
        callback = options
        options = {}
    }

    options = { ...defaultOptions, ...options }

    const keyBuf = new Buffer(key)
    const inputStream = fs.createReadStream(inputPath)
    const outputStream = fs.createWriteStream(outputPath)
    const cipher = crypto.createCipher(options.algorithm, keyBuf)

    inputStream.on('data', (data) => {
        const buf = new Buffer(cipher.update(data), 'binary')
        outputStream.write(buf)
    })

    inputStream.on('end', () => {
        try {
            const buf = new Buffer(cipher.final('binary'), 'binary')
            outputStream.write(buf)
            outputStream.end()
            outputStream.on('close', () => {
                return callback()
            })
        } catch (e) {
            fs.unlink(outputPath)
            return callback(e)
        }
    })
}

function decryptFile(inputPath, outputPath, key, options, callback) {

    if (typeof options === 'function') {
        callback = options
        options = {}
    }

    options = { ...defaultOptions, ...options }

    const keyBuf = new Buffer(key)
    const inputStream = fs.createReadStream(inputPath)
    const outputStream = fs.createWriteStream(outputPath)
    const cipher = crypto.createDecipher(options.algorithm, keyBuf)

    inputStream.on('data', (data) => {
        const buf = new Buffer(cipher.update(data), 'binary')
        outputStream.write(buf)
    })

    inputStream.on('end', () => {
        try {
            const buf = new Buffer(cipher.final('binary'), 'binary')
            outputStream.write(buf)
            outputStream.end()
            outputStream.on('close', () => {
                return callback()
            })
        } catch (e) {
            fs.unlink(outputPath)
            return callback(e)
        }
    })
}

module.exports = {
    createUser,
    bonusPoints,
    encryptFile,
    decryptFile
}
