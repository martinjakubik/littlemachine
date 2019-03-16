import sys
import codecs
import argparse

MAX_EXPONENT = 64
MAX_NUMBER_OF_BOXES = 65536

def convertDecimalToBinary(decimal, pad_size):

    if pad_size ** 2 > MAX_EXPONENT:
        pad_size = MAX_EXPONENT

    max_position = pad_size ** 2

    binaryString = ""
    remainder = decimal
    for exponent in reversed(range(max_position)):
        power = 2 ** exponent
        if power <= remainder:
            binaryString += "1"
            remainder = remainder - power
        else:
            binaryString += "0"

    return binaryString

def printFace(boxSize, facepixels, printDot):

    column = 0

    for pixel in facepixels:
        if pixel == "1":
            block = str(u'\u2588\u2588'.encode('utf-8'))
            sys.stdout.write(block)
        elif printDot:
            sys.stdout.write(' .')
        else:
            sys.stdout.write('  ')

        if column < (boxSize - 1):
            column = column + 1
        else:
            sys.stdout.write('\n')
            column = 0

    print '\n'

def strBoolean(value):
    if value.lower() in ('true', 'yes', 't', 'y', '1'):
        return True
    elif value.lower() in ('false', 'no', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('boolean value expected')

commandLineParser = argparse.ArgumentParser(description = "generates pixel boxes")
commandLineParser.add_argument("boxSize", type = int, help = "the size of each box")
commandLineParser.add_argument("numberOfBoxes", type = int, help = "the number of boxes to generate")
commandLineParser.add_argument("--printDot", action = 'store_true', default = False, help = "if true, prints a dot in empty spaces")

arguments = commandLineParser.parse_args()

boxSize = arguments.boxSize
numberOfBoxes = arguments.numberOfBoxes
printDot = arguments.printDot

if numberOfBoxes > MAX_NUMBER_OF_BOXES:
    print "too many boxes. try less than", MAX_NUMBER_OF_BOXES
    raise SystemExit(1)

for index in range(numberOfBoxes):
    face = convertDecimalToBinary(index, boxSize)
    printFace(boxSize, face, printDot)
