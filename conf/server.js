"use strict"

const fs = require( 'fs' )
const express = require( 'express' )
const debug = require( 'debug' )( 'app:server' )
const path = require( 'path' )
const webpack = require( 'webpack' )
const webpackConfig = require( './webpack.config' )
const config = require( './setting' )
const request = require( 'http' ).request;
var bodyParser = require( 'body-parser' );
const app = express()
const paths = config.utils_paths
const superagent = require( 'superagent' );
// 保存此次登录的cookie let agent;
let headerObj;

const getAgent = () => {
    let url = config.api_server + config.api_login_str;
    // agent = superagent.agent();
    headerObj = config.api_server_header;
    debug( `Login API Server : ${ config.api_server }` );
    superagent.get( url ).set( headerObj ).redirects( 0 ).end( ( e, { headers } ) => {
        headerObj.cookie = headers[ "set-cookie" ];
        url = headers[ "location" ]
        if ( url ) {
            superagent.get( url ).set( headerObj ).redirects( 0 ).end( function ( e, resp1 ) {
                headerObj.cookie = resp1.headers[ "set-cookie" ];
                debug( 'Login API Server Success' );
            } )
        }
    } )

}
getAgent();

// ------------------------------------ Apply Webpack HMR Middleware ------------------------------------
if ( config.env === 'development' ) {
    const compiler = webpack( webpackConfig )

    debug( 'Enable webpack dev and HMR middleware' )
    app.use( require( 'webpack-dev-middleware' )( compiler, {
        publicPath: webpackConfig.output.publicPath,
        contentBase: paths.client(),
        hot: true,
        quiet: config.compiler_quiet,
        noInfo: config.compiler_quiet,
        lazy: false,
        stats: config.compiler_stats
    } ) )
    app.use( require( 'webpack-hot-middleware' )( compiler ) )

    // Serve static assets from ~/src/static since Webpack is unaware of these files. This middleware doesn't need to be enabled outside of
    // development since this directory will be copied into ~/dist when the application is compiled.
    app.use( express.static( paths.client( 'static' ) ) )
    // Mock json app.use( '/sources', express.static( paths.mock() ) )
    app.use( bodyParser.json() );
    app.use( bodyParser.urlencoded( { extended: true } ) );
    app.use( '*', function ( req, res ) {
        let url = req.originalUrl,
            method = req.method;
        if ( url.indexOf( '.mock' ) > -1 ) {
            // mock 数据
            url = url.replace( /\//g, function ( a, b ) {
                return b ? '.' : '\/'
            } );
            url = url.replace( /\.mock.*/, ( method.toLowerCase() != 'get' ? '.' + method.toLowerCase() : '' ) + '.json' );
            debug( 'Get Local Mock Data : ' + url );
            const filename = paths.mock() + url;
            debug( filename );
            fs.readFile( filename, ( err, result ) => {
                if ( err ) {
                    debug( 'Error: mock data is not find' )
                    return;
                }
                res.set( 'content-type', 'application/json' )
                res.send( result )
                res.end()
            } )
        } else {
            // 测试服务器数据
            let url = config.api_server + req.originalUrl;
            debug( `Request From :  ${ url }` );
            debug( `Request Body :  ${ JSON.stringify( req.body ) }` );
            superagent( req.method, url )
                .set( headerObj )
                .set( 'Content-Type', 'application/json;charset=UTF-8' )
                // .set( 'X-Requested-With', 'XMLHttpRequest' )
                // .set( 'Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
                // .set( 'X-HTTP-Method-Override', 'get' )
                .send( req.body ).on( 'response', ( response ) => {
                if ( response.status !== 200 ) {
                    debug( `Response Error ${ response.status} : ${ url }` )
                }
            } ).pipe( res )
        }
    } );

    app.use( '*', function ( req, res, next ) {
        const filename = path.join( compiler.outputPath, 'index.html' )
        compiler.outputFileSystem.readFile( filename, ( err, result ) => {
            if ( err ) {
                return next( err )
            }
            res.set( 'content-type', 'text/html' )
            res.send( result )
            res.end()
        } )
    } )
} else {
    debug( 'Server is being run outside of live development mode, meaning it will only serve the compiled application bundle in ~/dist. Generally you ' +
        'do not need an application server for this and can instead use a web server such as nginx to serve your static files. See the "deployment"' +
        ' section in the README for more information on deployment strategies.' )

    // Serving ~/dist by default. Ideally these files should be served by the web server and not the app server, but this helps to demo the
    // server in production.
    app.use( express.static( paths.dist() ) )
}

module.exports = app
