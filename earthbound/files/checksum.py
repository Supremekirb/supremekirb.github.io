import zlib
import hashlib
import os

for file in os.listdir(os.getcwd()):
    filename = os.fsdecode(file)
    if filename.endswith(".sfc"):
        with open(file, "rb") as rom:
            bytes = rom.read()
            print(f"=== ROM: {filename} ===")
            print(f"CRC32: {hex(zlib.crc32(bytes))[2:]}")
            print(f"MD5: {hashlib.md5(bytes).hexdigest()}")
            print(f"Length: {len(bytes)}")