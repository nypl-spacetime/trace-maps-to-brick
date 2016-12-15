const fs = require('fs')
const path = require('path')
const H = require('highland')
const request = require('request')
const JSONStream = require('JSONStream')
const digitalCollections = require('digital-collections')
const wkt = require('wellknown')

const collectionUuid = 'd2251ba0-7850-0134-7a11-00505686a51c'
const titleAreas = {
  30839: 'Midtown',
  30841: 'Washington Heights',
  30837: 'Lower Manhattan',
  30842: 'Inwood',
  30840: 'Harlem',
  30838: 'East & West Village'
}

function getMapwarperData (capture, callback) {
  const url = `http://maps.nypl.org/warper/maps.json?field=uuid&query=${capture.uuid}`
  request(url, {
    json: true
  }, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const mapwarper = body.items[0]
      callback(null, {
        capture,
        mapwarper
      })
    } else {
      callback(error)
    }
  })
}

const getTitle = (obj) => {
  if (titleAreas[obj.mapwarper.id]}) {
    return `${titleAreas[obj.mapwarper.id]} - ${obj.mapwarper.title}`
  } else {
    return obj.mapwarper.title
  }
}

const toItem = (obj) => ({
  id: obj.capture.uuid,
  collectionId: collectionUuid,
  data: {
    title: getTitle(obj),
    mapId: obj.mapwarper.id,
    tileUrl: `http://maps.nypl.org/warper/maps/tile/${obj.mapwarper.id}/{z}/{x}/{y}.png`,
    geometry: wkt(obj.mapwarper.bbox_geom)
  }
})

H(digitalCollections.captures({
    uuid: collectionUuid
  }))
  .map(H.curry(getMapwarperData))
  .nfcall([])
  .series()
  .filter((obj) => obj.mapwarper.bbox_geom)
  .map(toItem)
  .pipe(JSONStream.stringify())
  .pipe(fs.createWriteStream(path.join(__dirname, 'data', 'items.json')))
