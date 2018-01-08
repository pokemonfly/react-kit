// TODO 引用的库有点大
import math from 'mathjs';
// import divide from 'mathjs/lib/function/arithmetic/divide'
export function add( val1, val2 ) {
    let r = math.add( val1, val2 );
    return + math.format( r, { precision: 14 } );
}
export function divide( val1, val2, isFixed = -1 ) {
    if ( !val1 || !val2 ) {
        return 0;
    }
    let r = math.divide( val1, val2 );
    r = +math.format( r, { precision: 14 } );
    if ( isFixed > -1 ) {
        return + r.toFixed( isFixed )
    }
    return r;
}
