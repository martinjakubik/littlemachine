import sys
import argparse

MAX_EXPONENT = 64
MAX_NUMBER_OF_BOXES = 10000

def convertDecimalToBinary(decimal):

    binaryString = ""
    remainder = decimal
    for exponent in reversed(range(MAX_EXPONENT)):
        power = 2 ** exponent
        if power <= remainder:
            binaryString += "1"
            remainder = remainder - power
        else:
            binaryString += "0"

    return binaryString

def printFace(facepixels):
    column = 0

    for pixel in facepixels:
        if pixel == "1":
            sys.stdout.write(u'\u2588\u2588')
        else:
            sys.stdout.write(' .')

        if column < 7:
            column = column + 1
        else:
            sys.stdout.write('\n')
            column = 0

    print '\n'

commandLineParser = argparse.ArgumentParser(description = "generates 64-pixel boxes")
commandLineParser.add_argument("numberOfBoxes", type = int, help = "the number of boxes to generate")

arguments = commandLineParser.parse_args()

numberOfBoxes = arguments.numberOfBoxes

if numberOfBoxes > MAX_NUMBER_OF_BOXES:
    print "too many boxes. try less than", MAX_NUMBER_OF_BOXES
    raise SystemExit(1)

for index in range(numberOfBoxes):
    face = convertDecimalToBinary(index)
    printFace(face)
