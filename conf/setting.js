/* eslint key-spacing:0 spaced-comment:0 */
const path = require( 'path' )
const debug = require( 'debug' )( 'app:setting' )
const argv = require( 'yargs' ).argv
const ip = require( 'ip' )

debug( 'Creating default configuration.' )

// ======================================================== Default Configuration ========================================================
const config = {
    env: process.env.NODE_ENV || 'development',

    // ---------------------------------- Project Structure ----------------------------------
    path_base: path.resolve( __dirname, '..' ),
    dir_client: 'src',
    dir_dist: 'dist',
    dir_server: 'server',
    dir_test: 'tests',
    dir_mock: 'api',

    // ---------------------------------- Server Configuration ----------------------------------
    server_host: ip.address(), // use string 'localhost' to prevent exposure on local network
    server_port: process.env.PORT || 3103,

    api_server: 'http://crm.superexpress.cn',
    // 用的小优的账号
    // api_login_str: '/login?username=%E5%BF%AB%E4%BA%91%E7%A7%91%E6%8A%80:%E5%98%89%E5%AE%BE&password=12345',
    api_login_str: '/login?username=%E5%BF%AB%E4%BA%91%E7%A7%91%E6%8A%80:%E5%B0%8F%E4%BC%98&password=zoujing123456',
    // api_login_str: '/login?username=%E5%BF%AB%E4%BA%91%E7%A7%91%E6%8A%80:%E6%9A%AE%E6%9A%AE&password=cf1234567',
    api_server_header: {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36",
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'X-Requested-With': 'XMLHttpRequest',
        // 'X-HTTP-Method-Override': 'GET'
    },
    // ---------------------------------- Compiler Configuration ----------------------------------
    compiler_babel: {
        cacheDirectory: true,
        plugins: [
            'transform-runtime',
            "transform-class-properties",
            'transform-decorators-legacy',
            'lodash',
            [
                "import", {
                    "libraryName": "antd",
                    "style": true
                }
            ]
        ],
        presets: [
            'react',
            'es2015',
            'stage-0',
            [
                'env', {
                    'targets': {
                        'node': 4
                    }
                }
            ]
        ]
    },
    compiler_devtool: 'source-map',
    compiler_hash_type: 'hash',
    compiler_fail_on_warning: false,
    compiler_quiet: false,
    compiler_public_path: '/',
    compiler_stats: {
        chunks: false,
        chunkModules: false,
        colors: true
    },
    // 公共组件
    compiler_vendors: [
        'react', 'react-redux', 'react-router', 'redux'
    ],

    // ---------------------------------- Test Configuration ----------------------------------
    coverage_reporters: [
        {
            type: 'text-summary'
        }, {
            type: 'lcov',
            dir: 'coverage'
        }
    ]
}

/************************************************
-------------------------------------------------

All Internal Configuration Below
Edit at Your Own Risk

-------------------------------------------------
************************************************/

// ------------------------------------ Environment ------------------------------------ N.B.: globals added here must _also_ be added to
// .eslintrc
config.globals = {
    'process.env': {
        'NODE_ENV': JSON.stringify( config.env )
    },
    'NODE_ENV': config.env,
    '__DEV__': config.env === 'development',
    '__PROD__': config.env === 'production',
    '__TEST__': config.env === 'test',
    '__COVERAGE__': !argv.watch && config.env === 'test',
    '__BASENAME__': JSON.stringify( process.env.BASENAME || '' )
}

// ------------------------------------ Validate Vendor Dependencies ------------------------------------
const pkg = require( '../package.json' )

config.compiler_vendors = config.compiler_vendors.filter( ( dep ) => {
    if ( pkg.dependencies[ dep ] ) 
        return true

    debug( `Package "${ dep }" was not found as an npm dependency in package.json; ` +
        `it won't be included in the webpack vendor bundle.
       Consider removing it from compiler_vendors in ~/config/index.js` )
} )

// ------------------------------------ Utilities ------------------------------------
function base() {
    const args = [ config.path_base ].concat( [].slice.call( arguments ) )
    return path.resolve.apply( path, args )
}

function mock() {}
config.utils_paths = {
    base: base,
    client: base.bind( null, config.dir_client ),
    dist: base.bind( null, config.dir_dist ),
    mock: base.bind( null, config.dir_mock )
}

// ======================================================== Environment Configuration
// ========================================================
debug( `Looking for environment overrides for NODE_ENV "${ config.env }".` )
const environments = require( './environments' )
const overrides = environments[ config.env ]
if ( overrides ) {
    debug( 'Found overrides, applying to default configuration.' )
    Object.assign( config, overrides( config ) )
} else {
    debug( 'No environment overrides found, defaults will be used.' )
}

module.exports = config
