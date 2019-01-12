'use strict'

// Dotgrid UDP Listener
// Ex: 1a0156(6 characters 0-9a-z)

// 0 layer[0-2]
// 1 type[larc*]
// 2 from[0-z][0-z]
// 4 to[0-z][0-z]

const dgram = require('dgram')

function Listener (dotgrid) {
  this.server = dgram.createSocket('udp4')

  function base36 (c) {
    return clamp(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y'].indexOf(c.toLowerCase()), 0, 36) * 15 + 15
  }

  function operate (data) {
    if(!dotgrid.tool.layers[data.layer]){ return }
    dotgrid.tool.index = data.layer
    dotgrid.tool.addSegment(data.type, [data.from, data.to])
    dotgrid.renderer.update()
  }

  function clear () {
    dotgrid.tool.erase()
    dotgrid.renderer.update()
  }

  function parse (msg) {
    if (msg.length < 6) { return }
    const layer = parseInt(msg.substr(0, 1))
    const type = { 'l': 'line', 'a': 'arc_c', 'r': 'arc_r', 'c': 'close' }[msg.substr(1, 1).toLowerCase()]
    if (!type) { clear(); return }
    const from = { x: base36(msg.substr(2, 1)), y: base36(msg.substr(3, 1)) }
    const to = { x: base36(msg.substr(4, 1)), y: base36(msg.substr(5, 1)) }
    return { layer: layer, type: type, from: from, to: to }
  }

  function clamp (v, min, max) {
    return v < min ? min : v > max ? max : v
  }

  this.server.on('message', (msg, rinfo) => {
    // console.log(`Server received UDP message:\n ${msg} from ${rinfo.address}:${rinfo.port}`)
    operate(parse(`${msg}`))
  })

  this.server.on('listening', () => {
    const address = this.server.address()
    console.log(`Server listening for UDP:\n ${address.address}:${address.port}`)
  })

  this.server.on('error', (err) => {
    console.log(`Server error:\n ${err.stack}`)
    server.close()
  })

  this.server.bind(49160)
}
