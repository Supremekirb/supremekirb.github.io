function colour_to_bgr555(col) {
  r = ((col & 0xFF0000) >> 16) >> 3
  g = ((col & 0x00FF00) >> 8) >> 3
  b = (col & 0x0000FF) >> 3
  return (b << 10) | (g << 5) | r
}

function bgr555_to_colour(col) {
  r = (col & 0b00000_00000_11111) << 3
  g = ((col & 0b00000_11111_00000) >> 5) << 3
  b = ((col & 0b11111_00000_00000) >> 10) << 3
  return (r << 16) | (g << 8) | b
}

function hexify(i) {
  return "0x" + i.toString(16).padStart(4, "0").toUpperCase()
}

function decify(s) {
  if (s === "") { return null }
  s = s.replace("0x", "").replace("$", "")
  try {
    return parseInt(s, 16)
  } catch {
    return null
  }
}

document.addEventListener('DOMContentLoaded', function() { 
  document.getElementById("normal").addEventListener('input', function (event) {
    let colour = parseInt(event.target.value.slice(1), 16)
    if (isNaN(colour)) {
      document.getElementById("bgr555").value = null
      return
    }
    let bgr = colour_to_bgr555(colour)
    if (document.getElementById("extra-bit").checked) {
      // Set the unused bit
      bgr |= 1 << 15
    }
    document.getElementById("bgr555").value = hexify(bgr)
    document.getElementById("htmlcode").value = event.target.value.toUpperCase()
  })
  
  document.getElementById("bgr555").addEventListener('input', function (event) {
    let colour = decify(event.target.value)
    if (colour === null) {
      return
    }
    document.getElementById("extra-bit").checked = colour & (1 << 15)
    colour = bgr555_to_colour(colour).toString(16)
    document.getElementById("normal").value = "#" + colour.padStart(6, 0)
    document.getElementById("htmlcode").value = "#" + colour.padStart(6, 0).toUpperCase()
  })
  
  document.getElementById("extra-bit").addEventListener('input', function (event) {
    let colour = decify(document.getElementById("bgr555").value)
    if (colour === null) {
      return
    }
    if (event.target.checked) {
      colour |= 1 << 15
    } else {
      colour &= 0x7FFF
    }
    document.getElementById("bgr555").value = hexify(colour)
  })
  
  document.getElementById("htmlcode").addEventListener('input', function (event) {
    if (event.target.value.match(/^#[0-9a-fA-F]{6}$/gm)) {
      document.getElementById("normal").value = event.target.value
      let colour = parseInt(event.target.value.slice(1), 16)
      let bgr = colour_to_bgr555(colour)
      if (document.getElementById("extra-bit").checked) {
        // Set the unused bit
        bgr |= 1 << 15
      }
      document.getElementById("bgr555").value = hexify(bgr)
    } else {
      document.getElementById("normal").value = "#000000"
      document.getElementById("bgr555").value = null
    }
  })
})