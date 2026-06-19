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
        "size": 0x300000 + 512,
        "fix": EBROM_fix_headered
    }],
    [0xaf607132, {
        "name": "24Mbit with dirty header",
        "size": 0x300000 + 512,
        "fix": EBROM_fix_headered
    }],
    [0x971d7fc7, {
        "name": "32Mbit headerless",
        "size": 0x400000,
        "fix": EBROM_fix_unheadered
    }],
    [0x3d5a0c81, {
        "name": "32Mbit with clean header",
        "size": 0x400000 + 512,
        "fix": EBROM_fix_headered
    }],
    [0x1d1c945c, {
        "name": "32Mbit with dirty header",
        "size": 0x400000 + 512,
        "fix": EBROM_fix_headered
    }],
    [0xf8880956, {
        "name": "JHack 32Mbit headerless",
        "size": 0x400000,
        "fix": EBROM_fix_unheadered
    }],
    [0x52cf7a10, {
        "name": "JHack 32Mbit with clean header",
        "size": 0x400000 + 512,
        "fix": EBROM_fix_headered
    }],
    [0x7289e2cd, {
        "name": "JHack 32Mbit with dirty header",
        "size": 0x400000 + 512,
        "fix": EBROM_fix_headered
    }],
    [0xf155f425, {
        "name": "48Mbit headerless",
        "size": 0x600000,
        "fix": EBROM_fix_unheadered
    }],
    [0xcf3325fd, {
        "name": "48Mbit with clean header",
        "size": 0x600000 + 512,
        "fix": EBROM_fix_headered
    }],
    [0x65482eec, {
        "name": "48Mbit with dirty header",
        "size": 0x600000 + 512,
        "fix": EBROM_fix_headered
    }],
    [0x7046144b, {
        "name": "JHack 48Mbit headerless",
        "size": 0x600000,
        "fix": EBROM_fix_unheadered
    }],
    [0x4e20c593, {
        "name": "JHack 48Mbit with clean header",
        "size": 0x600000 + 512,
        "fix": EBROM_fix_headered
    }],
    [0xe45bce82, {
        "name": "JHack 48Mbit with dirty header",
        "size": 0x600000 + 512,
        "fix": EBROM_fix_headered
    }],
    [0x8fdb034f, {
        "name": "Wii U Virtual Console (NTSC)",
        "size": EB_BASE_SIZE,
        "fix": function (array) { return EBROM_fix_ips(array, "WiiU-NTSC-to-clean.ips") }
    }]
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
        let cell_name = row.insertCell()
        let cell_size = row.insertCell()
        let cell_crc32 = row.insertCell()

        cell_name.innerHTML = value.name
        cell_size.innerHTML = value.size + " bytes (0x" + value.size.toString(16).toUpperCase() + ")"
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
    document.getElementById("eb-fix-rom-button").addEventListener('click', async function (event) {
        try {
            await fixROM(rom)
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
var cleaning = false
async function fixROM(array) {
    if (cleaning) {
        document.getElementById("eb-fix-rom-status").innerHTML = "Please wait until the current ROM cleaning is finished!"
        return
    }
    cleaning = true
    document.getElementById("eb-fix-rom-status").innerHTML = "Fixing ROM..."
    try {
        cleaned = await EB_KNOWN_ROMS.get(crc32).fix(array)
        // If somehow the ROM cleaning failed to produce a clean ROM
        cleanCrc32 = hash_crc32(cleaned)
        if (cleanCrc32 != EB_BASE_CRC32) {
            throw new Error(`ROM cleaning was unsuccessful. Expected CRC32 0x${EB_BASE_CRC32.toString(16).toUpperCase()}, got 0x${cleanCrc32.toString(16).toUpperCase()}.`)
        }
        document.getElementById("eb-fix-rom-status").innerHTML = "Success! The fixed ROM will be downloaded automatically."
        downloadBlob(cleaned, 'EarthBound_Clean.sfc', 'application/octet-stream')
    } finally {
        cleaning = false
    }
}

// Fix headered ROMs by skipping the first 512 bytes
// Also calls the unheadered fix afterwards
function EBROM_fix_headered(array) {
    console.log("Removing header...")
    let cleaned = new Uint8Array(array.length - 512)
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

// Fix ROMs by applying an IPS patch
async function EBROM_fix_ips(array, patchpath) {
    console.log("Applying IPS patch...")
    let patchFile = await fetch(decodeURI("/tools/rom_inspector_patches/" + patchpath))
    const patch = IPS.fromFile(new BinFile(await patchFile.arrayBuffer()))
    const srcROM = new BinFile(array)
    return patch.apply(srcROM)._u8array
}


// from stackoverflow

var downloadBlob, downloadURL;

downloadBlob = function (data, fileName, mimeType) {
    var blob, url;
    blob = new Blob([data], {
        type: mimeType
    });
    url = window.URL.createObjectURL(blob);
    downloadURL(url, fileName);
    setTimeout(function () {
        return window.URL.revokeObjectURL(url);
    }, 1000);
};

downloadURL = function (data, fileName) {
    var a;
    a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
};


// from marcobledo's ROM patcher JS
// see https://github.com/marcrobledo/RomPatcher.js
// heavily stripped down because we don't need all the functionality
// we just need parts of binfile and ips module

/* 
* MIT License
* 
* Copyright (c) 2014-2024 Marc Robledo
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/



function BinFile(source, onLoad) {
    this.littleEndian = false;
    this.offset = 0;
    this._lastRead = null;
    this._offsetsStack = [];


    if (
        BinFile.RUNTIME_ENVIROMENT === 'browser' && (
            source instanceof File ||
            source instanceof FileList ||
            (source instanceof HTMLElement && source.tagName === 'INPUT' && source.type === 'file')
        )
    ) {
        if (source instanceof HTMLElement)
            source = source.files;
        if (source instanceof FileList)
            source = source[0];

        this.fileName = source.name;
        this.fileType = source.type;
        this.fileSize = source.size;

        if (typeof window.FileReader !== 'function')
            throw new Error('Incompatible browser');

        this._fileReader = new FileReader();
        this._fileReader.addEventListener('load', function () {
            this.binFile._u8array = new Uint8Array(this.result);

            if (typeof onLoad === 'function')
                onLoad(this.binFile);
        }, false);


        this._fileReader.binFile = this;

        this._fileReader.readAsArrayBuffer(source);



    }

    else if (source instanceof BinFile) { /* if source is another BinFile, clone it */
        this.fileName = source.fileName;
        this.fileType = source.fileType;
        this.fileSize = source.fileSize;

        this._u8array = new Uint8Array(source._u8array.buffer.slice());

        if (typeof onLoad === 'function')
            onLoad(this);



    } else if (source instanceof ArrayBuffer) {
        this.fileName = 'file.bin';
        this.fileType = 'application/octet-stream';
        this.fileSize = source.byteLength;

        this._u8array = new Uint8Array(source);

        if (typeof onLoad === 'function')
            onLoad(this);

    } else if (ArrayBuffer.isView(source)) { /* source is TypedArray */
        this.fileName = 'file.bin';
        this.fileType = 'application/octet-stream';
        this.fileSize = source.buffer.byteLength;

        this._u8array = new Uint8Array(source.buffer);

        if (typeof onLoad === 'function')
            onLoad(this);

    } else if (typeof source === 'number') { /* source is integer, create new empty file */
        this.fileName = 'file.bin';
        this.fileType = 'application/octet-stream';
        this.fileSize = source;

        this._u8array = new Uint8Array(new ArrayBuffer(source));

        if (typeof onLoad === 'function')
            onLoad(this);

    } else {
        throw new Error('invalid BinFile source');
    }
}
BinFile.RUNTIME_ENVIROMENT = "browser"

BinFile.prototype.seek = function (offset) {
    this.offset = offset;
}
BinFile.prototype.skip = function (nBytes) {
    this.offset += nBytes;
}
BinFile.prototype.isEOF = function () {
    return !(this.offset < this.fileSize)
}
BinFile.prototype.slice = function (offset, len, doNotClone) {
    if (typeof offset !== 'number' || offset < 0)
        offset = 0;
    else if (offset >= this.fileSize)
        throw new Error('out of bounds slicing');
    else
        offset = Math.floor(offset);

    if (typeof len !== 'number' || offset < 0 || (offset + len) >= this.fileSize.length)
        len = this.fileSize - offset;
    else if (len === 0)
        throw new Error('zero length provided for slicing');
    else
        len = Math.floor(len);

    if (offset === 0 && len === this.fileSize && doNotClone)
        return this;


    var newFile = new BinFile(this._u8array.buffer.slice(offset, offset + len));
    newFile.fileName = this.fileName;
    newFile.fileType = this.fileType;
    newFile.littleEndian = this.littleEndian;
    return newFile;
}


BinFile.prototype.copyTo = function (target, offsetSource, len, offsetTarget) {
    if (!(target instanceof BinFile))
        throw new Error('target is not a BinFile object');

    if (typeof offsetTarget !== 'number')
        offsetTarget = offsetSource;

    len = len || (this.fileSize - offsetSource);

    for (var i = 0; i < len; i++) {
        target._u8array[offsetTarget + i] = this._u8array[offsetSource + i];
    }
}

BinFile.prototype.readU8 = function () {
    this._lastRead = this._u8array[this.offset++];

    return this._lastRead
}
BinFile.prototype.readU16 = function () {
    if (this.littleEndian)
        this._lastRead = this._u8array[this.offset] + (this._u8array[this.offset + 1] << 8);
    else
        this._lastRead = (this._u8array[this.offset] << 8) + this._u8array[this.offset + 1];

    this.offset += 2;
    return this._lastRead >>> 0
}
BinFile.prototype.readU24 = function () {
    if (this.littleEndian)
        this._lastRead = this._u8array[this.offset] + (this._u8array[this.offset + 1] << 8) + (this._u8array[this.offset + 2] << 16);
    else
        this._lastRead = (this._u8array[this.offset] << 16) + (this._u8array[this.offset + 1] << 8) + this._u8array[this.offset + 2];

    this.offset += 3;
    return this._lastRead >>> 0
}
BinFile.prototype.readBytes = function (len) {
    this._lastRead = new Array(len);
    for (var i = 0; i < len; i++) {
        this._lastRead[i] = this._u8array[this.offset + i];
    }

    this.offset += len;
    return this._lastRead
}

BinFile.prototype.writeU8 = function (u8) {
    this._u8array[this.offset++] = u8;
}

BinFile.prototype.writeBytes = function (a) {
    for (var i = 0; i < a.length; i++)
        this._u8array[this.offset + i] = a[i]

    this.offset += a.length;
}

const IPS_MAGIC = 'PATCH';
const IPS_MAX_ROM_SIZE = 0x1000000; //16 megabytes
const IPS_RECORD_RLE = 0x0000;
const IPS_RECORD_SIMPLE = 0x01;

function IPS() {
    this.records = [];
    this.truncate = false;
    // this.EBPmetadata=null;
}

IPS.prototype.addSimpleRecord = function (o, d) {
    this.records.push({ offset: o, type: IPS_RECORD_SIMPLE, length: d.length, data: d })
}
IPS.prototype.addRLERecord = function (o, l, b) {
    this.records.push({ offset: o, type: IPS_RECORD_RLE, length: l, byte: b })
}

IPS.prototype.apply = function (romFile) {
    if (this.truncate/* && !this.EBPmetadata*/) {
        if (this.truncate > romFile.fileSize) { //expand (discussed here: https://github.com/marcrobledo/RomPatcher.js/pull/46)
            tempFile = new BinFile(this.truncate);
            romFile.copyTo(tempFile, 0, romFile.fileSize, 0);
        } else { //truncate
            tempFile = romFile.slice(0, this.truncate);
        }
    } else {
        //calculate target ROM size, expanding it if any record offset is beyond target ROM size
        var newFileSize = romFile.fileSize;
        for (var i = 0; i < this.records.length; i++) {
            var rec = this.records[i];
            if (rec.type === IPS_RECORD_RLE) {
                if (rec.offset + rec.length > newFileSize) {
                    newFileSize = rec.offset + rec.length;
                }
            } else {
                if (rec.offset + rec.data.length > newFileSize) {
                    newFileSize = rec.offset + rec.data.length;
                }
            }
        }

        if (newFileSize === romFile.fileSize) {
            tempFile = romFile.slice(0, romFile.fileSize);
        } else {
            tempFile = new BinFile(newFileSize);
            romFile.copyTo(tempFile, 0);
        }
    }


    romFile.seek(0);

    for (var i = 0; i < this.records.length; i++) {
        tempFile.seek(this.records[i].offset);
        if (this.records[i].type === IPS_RECORD_RLE) {
            for (var j = 0; j < this.records[i].length; j++)
                tempFile.writeU8(this.records[i].byte);
        } else {
            tempFile.writeBytes(this.records[i].data);
        }
    }

    return tempFile
}

IPS.fromFile = function (file) {
    var patchFile = new IPS();
    file.seek(5);

    while (!file.isEOF()) {
        var offset = file.readU24();

        if (offset === 0x454f46) { /* EOF */
            if (file.isEOF()) {
                break;
            } else if ((file.offset + 3) === file.fileSize) {
                patchFile.truncate = file.readU24();
                break;
            }/*else if (file.readU8()==='{'.charCodeAt(0)) {
				file.skip(-1);
				patchFile.setEBPMetadata(JSON.parse(file.readString(file.fileSize-file.offset)));
				break;
			}*/
        }

        var length = file.readU16();

        if (length === IPS_RECORD_RLE) {
            patchFile.addRLERecord(offset, file.readU16(), file.readU8());
        } else {
            patchFile.addSimpleRecord(offset, file.readBytes(length));
        }
    }
    return patchFile;
}