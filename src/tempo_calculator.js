function bpm_to_nspc(bpm) {
    return 12288 / (60000 / bpm)
}

function nspc_to_bpm(nspc) {
    return 60000 / (12288 / nspc)
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("bpm-value").addEventListener('input', function (event) {
        let bpm = parseFloat(document.getElementById("bpm-value").value)
        if (isNaN(bpm)) {
            document.getElementById("nspc-value").value = null
            return
        }
        if (bpm < 0) {
            bpm = 0
        }
        if (bpm > 1247) {
            bpm = 1247
        }
        let nspc = bpm_to_nspc(bpm)
        document.getElementById("nspc-value").value = nspc.toString()
        document.getElementById("bpm-out-int").innerHTML = Math.round(bpm).toString()
        document.getElementById("nspc-out-int").innerHTML = Math.round(nspc).toString()
        document.getElementById("nspc-out-hex").innerHTML = `$${Math.round(nspc).toString(16).padStart(2, "0").toUpperCase()}`
        document.getElementById("nspc-out-opc").innerHTML = `[E7 ${Math.round(nspc).toString(16).padStart(2, "0").toUpperCase()}]`
    })
    
    document.getElementById("nspc-value").addEventListener('input', function (event) {
        let nspc = parseFloat(document.getElementById("nspc-value").value)
        if (isNaN(nspc)) {
            document.getElementById("bpm-value").value = null
            return
        }
        if (nspc < 0) {
            nspc = 0
        }
        if (nspc > 255) {
            nspc = 255
        }
        let bpm = nspc_to_bpm(nspc)
        document.getElementById("bpm-value").value = bpm.toString()
        document.getElementById("bpm-out-int").innerHTML = Math.round(bpm).toString()
        document.getElementById("nspc-out-int").innerHTML = Math.round(nspc).toString()
        document.getElementById("nspc-out-hex").innerHTML = `$${Math.round(nspc).toString(16).padStart(2, "0").toUpperCase()}`
        document.getElementById("nspc-out-opc").innerHTML = `[E7 ${Math.round(nspc).toString(16).padStart(2, "0").toUpperCase()}]`
    })
}, false);