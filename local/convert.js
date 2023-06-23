/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */

// exemplo 1: node local/convert.js requestplus-pf-facial-biometry-result.fifo.json
// exemplo 2: node local/convert.js event-handler.json --sns
const fs = require('fs')
const path = require('path')

let body = require(`./${process.argv[2]}`)

if (process.argv[3] === '--sns') {
  body = {
    Message: JSON.stringify(body),
  }
}

const message = {
  Records: [
    {
      ...body,
      body: JSON.stringify(body.body),
    },
  ],
}

const filePath = path.join(__dirname, `/debug/${process.argv[2]}`)

fs.writeFile(filePath, `${JSON.stringify(message, null, 2)}\n`, (err) => {
  if (err) {
    return console.log(err)
  }
  return console.log('The file was saved!')
})
