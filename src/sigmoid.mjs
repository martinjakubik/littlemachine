import { dotDivide as math_dotDivide } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { zeros as math_zeros } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { exp as math_exp } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';

const sigmoid = function (aZ) {
    let aG = math_zeros(aZ.size()[0]);
    aG = math_dotDivide(
        1,
        aZ.map((nValue) => 1 + math_exp(-1 * nValue)),
    );
    return aG;
};

export { sigmoid };
