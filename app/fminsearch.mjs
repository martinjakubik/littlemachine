/*
    fminsearch

    This code is copied from: https://github.com/jonasalmeida/fminsearch

    Under the MIT License:

    Copyright (c) Jonas Almeida.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

    --

    fnCalculateCost = function(x, Parm)

    example:
    x = [32, 37, 42, 47, 52, 57, 62, 67, 72, 77, 82, 87, 92];
    y = [749, 1525, 1947, 2201, 2380, 2537, 2671, 2758, 2803, 2943, 3007, 2979, 2992]
    fnCalculateCost = function (x, P) { return x.map( function(xi) { return (P[0]+1/(1/(P[1]*(xi-P[2]))+1/P[3])) }) }
    Parms = fminsearch(fnCalculateCost, [100, 30, 10, 5000], x, y)

    Another test:
    x = [32, 37, 42, 47, 52, 57, 62, 67, 72, 77, 82, 87, 92];
    y = [0, 34, 59, 77, 99, 114, 121, 133, 146, 159, 165, 173, 170];

    Opt is an object will all other parameters, from the objective function (cost function), to the
    number of iterations, initial step vector and the display switch, for example
    Parms = fminsearch(fnCalculateCost, [100, 30, 10, 5000], x, y, {maxIter:10000, display:false})
*/
const fminsearch = function (
    oDebugParams,
    mathlib,
    fnCalculateCost,
    Parm0,
    x,
    y,
    Opt,
) {
    if (!Opt) {
        Opt = {};
    }
    if (!Opt.maxIter) {
        Opt.maxIter = 1000;
    }

    if (!Opt.step) {
        // initial step is 1/100 of initial value (remember not to use zero in Parm0)
        Opt.step = Parm0.map((p) => {
            return p / 100;
        });

        Opt.step = Opt.step.map((si) => {
            // converts null steps into 1's
            if (si == 0) {
                return 1;
            } else {
                return si;
            }
        });
    }

    if (typeof Opt.display == 'undefined') {
        Opt.display = true;
    }

    let arrayTheta0 = math.clone(Parm0),
        arrayTheta1 = math.clone(Parm0);
    let m = arrayTheta0.size()[0];
    let step = Opt.step;

    // function (of Parameters) to minimize
    const fnCalculateCostParametrized = (oDebugParams, mathlib, arrayTheta) => {
        return fnCalculateCost(oDebugParams, mathlib, arrayTheta, x);
    };

    let nJ0, nJ1, nPreviousJ0;
    let oPreviousJ0 = {
        list: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        index: 0,
    };

    let oDisplayObject = {
        i: 0,
        J: 0,
        theta: [],
    };

    // repeats up to a max count of iterations
    for (let i = 0; i < Opt.maxIter; i++) {
        oDebugParams.iteration_i = i;
        // takes a step for each parameter - or.... each example?
        for (let j = 0; j < m; j++) {
            oDebugParams.iteration_j = j;
            arrayTheta1 = math.clone(arrayTheta0);
            arrayTheta1._data[j] += step._data[j];

            // saves last 11 costs (J)
            oPreviousJ0.list[oPreviousJ0.index] = nJ0;
            oPreviousJ0.index = (oPreviousJ0.index + 1) % 11;
            nJ0 = fnCalculateCostParametrized(
                oDebugParams,
                mathlib,
                arrayTheta0,
            ).J;
            nJ1 = fnCalculateCostParametrized(
                oDebugParams,
                mathlib,
                arrayTheta1,
            ).J;

            // checks if parm value going in the right direction
            // fnCalculateCost(arrayTheta1, x, i, j);
            if (nJ1 < nJ0) {
                if (Opt.display && Opt.displayLevel >= 3 && i % 10 === 0)
                    console.log('f(th1) is less than f(th0)');
                // goes a little faster
                step._data[j] = 1.2 * step._data[j];
                arrayTheta0 = math.clone(arrayTheta1);
            } else {
                if (Opt.display && Opt.displayLevel >= 3 && i % 10 === 0)
                    console.log('f(th1) is more than f(th0)');
                // otherwise reverses and goes slower
                step._data[j] = -(0.5 * step._data[j]);
            }
        }

        nPreviousJ0 =
            oPreviousJ0.list.reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            ) / oPreviousJ0.list.length;
        if (Opt.display && Opt.displayLevel >= 2 && i % 10 === 0)
            console.log(
                `j0: ${nJ0}; prev j0: ${nPreviousJ0}; diff: ${Math.abs(nPreviousJ0 - nJ0)}`,
            );
        // breaks if the gradient is very small
        const nGradientThreshold = 1.0e-19;
        if (Math.abs(nPreviousJ0 - nJ0) < nGradientThreshold) {
            break;
        }

        oDisplayObject.i = i;
        oDisplayObject.J = nJ0;
        oDisplayObject.theta = arrayTheta0;

        // logs every 10th iteration
        if (Opt.display && Opt.displayLevel >= 1 && i % 10 === 0) {
            console.log(i + 1, nJ0, arrayTheta0);
        }
        // logs the last 10 iterations
        if (Opt.display && Opt.displayLevel >= 1 && i > Opt.maxIter - 10) {
            console.log(i + 1, nJ0, arrayTheta0);
        }
    }
    return arrayTheta0;
};

export { fminsearch };
