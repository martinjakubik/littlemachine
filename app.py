import argparse
import logging
from  makepng import *
from pathlib import Path

MAX_EXPONENT = 64
MAX_NUMBER_OF_BOXES = 65536

def convertDecimalToBinary(decimal, pad_size):

    if pad_size ** 2 > MAX_EXPONENT:
        pad_size = MAX_EXPONENT

    max_position = pad_size ** 2

    binaryString = ''
    remainder = decimal
    for exponent in reversed(range(max_position)):
        power = 2 ** exponent
        if power <= remainder:
            binaryString += '1'
            remainder = remainder - power
        else:
            binaryString += '0'

    return binaryString

def printFace(boxSize, binary, printDot):

    column = 0
    data = []
    row = []

    for pixel in binary:
        if pixel == '1':
            block = str(u'\u2588\u2588'.encode('utf-8'))
            row.append(255)
            logging.debug(block)
        elif printDot:
            logging.debug(' .')
            row.append(0)
        else:
            logging.debug('  ')
            row.append(0)

        if column < (boxSize - 1):
            column = column + 1
        else:
            data.append(row)
            row = []
            column = 0

    size = boxSize ** 2
    logging.debug(binary + '\n\n')

    boxPathDirectory = Path('labellists/png' + str(size))
    boxPath = boxPathDirectory / (binary + '.png')

    if not boxPathDirectory.exists() or not boxPathDirectory.is_dir():
        boxPathDirectory.mkdir(parents = True)

    with boxPath.open(mode = 'wb') as f:
        f.write(makeGrayPNG(data, boxSize, boxSize))

commandLineParser = argparse.ArgumentParser(description = 'generates pixel boxes')
commandLineParser.add_argument('boxSize', type = int, default = 2, help = 'the size of each box, 1 .. 4 pixels')
commandLineParser.add_argument('--printDot', action = 'store_true', default = False, help = 'if true, prints a dot in empty spaces')
commandLineParser.add_argument('--log', help = 'sets logging to DEBUG or off')

arguments = commandLineParser.parse_args()

if arguments.log == 'DEBUG':
    logging.basicConfig(level=logging.DEBUG)

boxSize = arguments.boxSize
printDot = arguments.printDot

numberOfBoxes = 2 ** (boxSize ** 2)

if numberOfBoxes > MAX_NUMBER_OF_BOXES:
    print ('too many boxes. try less than', MAX_NUMBER_OF_BOXES)
    raise SystemExit(1)

for index in range(numberOfBoxes):
    binary = convertDecimalToBinary(index, boxSize)
    printFace(boxSize, binary, printDot)
