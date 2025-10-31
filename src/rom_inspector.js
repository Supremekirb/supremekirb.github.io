// Standardisation & verification of various EB ROMs
// The base EB is 24mb headerless,
// and has the following properties:
const EB_BASE_SIZE = 0x300000
const EB_BASE_CRC32 = 0xdc9bb451

// Known ROMs and hashes, as well as how to fix
// Uses a Map so it remains ordered for the table of known ROMs
const EB_KNOWN_ROMS = new Map([
    [EB_BASE_CRC32, {
        "name": "24Mbit headerless",
        "size": EB_BASE_SIZE,
        "fix": function (array) { return array }
    }],
    [0xfb72d282, {
        "name": "24Mbit with clean header",
        "size": 0x300000+512,
        "fix": EBROM_fix_headered
    }],
    [0xaf607132, {
        "name": "24Mbit with dirty header",
        "size": 0x300000+512,
        "fix": EBROM_fix_headered
    }],
    [0x971d7fc7, {
        "name": "32Mbit headerless",
        "size": 0x400000,
        "fix": EBROM_fix_unheadered
    }],
    [0x3d5a0c81, {
        "name": "32Mbit with clean header",
        "size": 0x400000+512,
        "fix": EBROM_fix_headered
    }],
    [0x1d1c945c, {
        "name": "32Mbit with dirty header",
        "size": 0x400000+512,
        "fix": EBROM_fix_headered
    }],
    [0xf8880956, {
        "name": "JHack 32Mbit headerless",
        "size": 0x400000,
        "fix": EBROM_fix_unheadered
    }],
    [0x52cf7a10, {
        "name": "JHack 32Mbit with clean header",
        "size": 0x400000+512,
        "fix": EBROM_fix_headered
    }],
    [0x7289e2cd, {
        "name": "JHack 32Mbit with dirty header",
        "size": 0x400000+512,
        "fix": EBROM_fix_headered
    }],
    [0xf155f425, {
        "name": "48Mbit headerless",
        "size": 0x600000,
        "fix": EBROM_fix_unheadered
    }],
    [0xcf3325fd, {
        "name": "48Mbit with clean header",
        "size": 0x600000+512,
        "fix": EBROM_fix_headered
    }],
    [0x65482eec, {
        "name": "48Mbit with dirty header",
        "size": 0x600000+512,
        "fix": EBROM_fix_headered
    }],
    [0x7046144b, {
        "name": "JHack 48Mbit headerless",
        "size": 0x600000,
        "fix": EBROM_fix_unheadered
    }],
    [0x4e20c593, {
        "name": "JHack 48Mbit with clean header",
        "size": 0x600000+512,
        "fix": EBROM_fix_headered
    }],
    [0xe45bce82, {
        "name": "JHack 48Mbit with dirty header",
        "size": 0x600000+512,
        "fix": EBROM_fix_headered
    }],
])

// from stackoverflow but modified to work with a uint8array
var makeCRCTable = function () {
    var c;
    var crcTable = [];
    for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

function hash_crc32(array) {
    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    for (var i = 0; i < array.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ array[i]) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};

var crc32 = null
var rom = null

document.addEventListener('DOMContentLoaded', function () {
    // populate the table of recognised ROMs in the HTML
    document.getElementById("eb-known-rom-info").style.removeProperty("display")
    let table = document.getElementById("eb-known-rom-table")
    for (const [key, value] of EB_KNOWN_ROMS.entries()) {
        let row = table.insertRow()
        row.classList.add("alternatingrows") 
        let cell_name  = row.insertCell()
        let cell_size  = row.insertCell()
        let cell_crc32 = row.insertCell()

        cell_name.innerHTML  = value.name
        cell_size.innerHTML  = value.size + " bytes (0x" + value.size.toString(16).toUpperCase() + ")"
        cell_crc32.innerHTML = "0x" + Number(key).toString(16).toUpperCase() // #awesome
    }

    // add callbacks to the buttons
    document.getElementById("eb-rom-in").addEventListener('change', function (event) {
        let file = event.target.files[0]
        let reader = new FileReader()
        reader.readAsArrayBuffer(file)
        
        reader.onload = function (event) {
            let arrayBuffer = event.target.result
            let array = new Uint8Array(arrayBuffer)
            // assign these globals (theyre reused for the fix ROM stuff too)
            rom = array
            crc32 = hash_crc32(array)
            inspectROM(array)
            document.getElementById("eb-rom-info-area").style.display = "unset"
            document.getElementById("eb-file-name").innerHTML = file.name
        }
    })
    document.getElementById("eb-fix-rom-button").addEventListener('click', function (event) {
        try {
            fixROM(rom)
        } catch (error) {
            document.getElementById("eb-fix-rom-status").innerHTML = "There was an error when trying to fix the ROM. Please check the console for details."
            throw error
        }
    })
}, false);

// Callback when ROM is loaded
function inspectROM(array) {
    document.getElementById("eb-crc32").innerHTML = crc32.toString(16).toUpperCase()
    document.getElementById("eb-size").innerHTML = array.length + " bytes (0x" + array.length.toString(16) + ")"
    document.getElementById("eb-fix-rom-area").style.removeProperty("display")
    
    if (EB_KNOWN_ROMS.has(crc32)) {
        console.log(`Identified EB ROM as '${EB_KNOWN_ROMS.get(crc32).name}' (CRC32 ${crc32.toString(16)})`)
        document.getElementById("eb-found-rom-type").innerHTML = EB_KNOWN_ROMS.get(crc32).name
        // EB_BASE_CRC32 is our 'standard' ROM
        if (crc32 == EB_BASE_CRC32) {
            document.getElementById("eb-fix-rom-status").innerHTML = "This is a standard EarthBound ROM!"
            document.getElementById("eb-fix-rom-button").style.display = "none"
        }
        else {
            document.getElementById("eb-fix-rom-status").innerHTML = "Your ROM isn't standard, but it can be fixed."
            document.getElementById("eb-fix-rom-button").style.removeProperty("display")
        }
    }
    else {
        const message = `Unknown ROM with CRC32 hash ${crc32.toString(16)}`
        console.log(message)
        document.getElementById("eb-found-rom-type").innerHTML = "Unrecognised ROM"
        document.getElementById("eb-fix-rom-button").style.display = "none"
        document.getElementById("eb-fix-rom-status").innerHTML = "This ROM isn't recognised, so it can't be fixed."

    }
}

// Callback when ROM fix button is pressed
function fixROM(array) {
    cleaned = EB_KNOWN_ROMS.get(crc32).fix(array)
    // If somehow the ROM cleaning failed to produce a clean ROM
    cleanCrc32 = hash_crc32(cleaned)
    if (cleanCrc32 != EB_BASE_CRC32) {
        throw new Error(`ROM cleaning was unsuccessful. Expected CRC32 0x${EB_BASE_CRC32.toString(16).toUpperCase()}, got 0x${cleanCrc32.toString(16).toUpperCase()}.`)
    }
    downloadBlob(cleaned, 'EarthBound_Clean.sfc', 'application/octet-stream')
}

// Fix headered ROMs by skipping the first 512 bytes
// Also calls the unheadered fix afterwards
function EBROM_fix_headered(array) {
    console.log("Removing header...")
    let cleaned = new Uint8Array(array.length-512)
    cleaned.set(array.slice(512))
    return EBROM_fix_unheadered(cleaned)
}

// Fix ROMs by reducing their size to the base 24Mb size
// Expects ROMs to be unheadered because of this
// Also fixes the cartridge header for 48Mb ROMs
function EBROM_fix_unheadered(array) {
    console.log("Standardising ROM size...")
    // Copy the first 24 MBits
    let cleaned = new Uint8Array(EB_BASE_SIZE)
    cleaned.set(array.slice(0, EB_BASE_SIZE))
    // Fix the cartridge header (for 48 MBit ROMs)
    cleaned[0xFFD5] = 0x31
    cleaned[0xFFD7] = 0x0C
    return cleaned
}


// from stackoverflow

var downloadBlob, downloadURL;

downloadBlob = function(data, fileName, mimeType) {
  var blob, url;
  blob = new Blob([data], {
    type: mimeType
  });
  url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName);
  setTimeout(function() {
    return window.URL.revokeObjectURL(url);
  }, 1000);
};

downloadURL = function(data, fileName) {
  var a;
  a = document.createElement('a');
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style = 'display: none';
  a.click();
  a.remove();
};