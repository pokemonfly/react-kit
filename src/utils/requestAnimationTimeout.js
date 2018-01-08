const win = window
const raf = win.requestAnimationFrame || win.webkitRequestAnimationFrame || win.mozRequestAnimationFrame || win.oRequestAnimationFrame || win.msRequestAnimationFrame || function ( callback ) {
    return win.setTimeout( callback, 1000 / 60 );
};

const caf = win.cancelAnimationFrame || win.webkitCancelAnimationFrame || win.mozCancelAnimationFrame || win.oCancelAnimationFrame || win.msCancelAnimationFrame || function ( id ) {
    win.clearTimeout( id );
};

export const cancelAnimationTimeout = ( frame ) => caf( frame.id );

export const requestAnimationTimeout = ( callback, delay ) => {
    const start = Date.now( );

    const timeout = ( ) => {
        if ( Date.now( ) - start >= delay ) {
            callback.call( );
        } else {
            frame.id = raf( timeout );
        }
    };

    const frame = {
        id: raf( timeout )
    };
    return frame
};
