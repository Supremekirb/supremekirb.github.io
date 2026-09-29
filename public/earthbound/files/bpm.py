tempo = float(input("What's the Tempo (in BPM) of the song?"))

result = 12288 / (60000/tempo)

print(f"Decimal result: {result}")

tempo = int(round(result))

hex = hex(tempo)

print(f" Hex (rounded): {hex}")

input()
