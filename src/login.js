/***
 * login.js
 * ````````
 *    信息门户模拟登录API
 */
const Koa = require('koa')
const axios = require('axios')
const querystring = require('querystring');
const app = module.exports = new Koa()
const router = require('koa-router')()

var login_url = 'http://portal.ccnu.edu.cn/loginAction.do'
var link_url = 'http://portal.ccnu.edu.cn/roamingAction.do?appId=XK'
var ticket_url = 'http://122.204.187.6/xtgl/login_tickitLogin.html'

// http basic authorization middleware
app.use(async function(ctx, next) {
    try {
        let headers = ctx.request.headers
        let authH = headers['authorization']
        if (authH == undefined) {
            ctx.status = 401
        } else {
            let authS = Buffer.from(authH.slice(6), 'base64').toString()
            let sid = authS.split(':')[0]
            let pwd = authS.split(':')[1]

            let _cookies = await info_login(sid, pwd)
            if (_cookies == undefined) {
                ctx.status = 403
            }
            let __cookies = await link_login(_cookies)
            if (__cookies == undefined) {
                ctx.status = 403
            }
            let ___cookies = await ticket_login(__cookies)
            if (___cookies == undefined) {
                ctx.status = 403
            }
            ctx.cookies = ___cookies[0] + ';' +  __cookies[1]
            await next(ctx)
        }
    } catch (err) {
        throw err
    }
})

// info login spider
async function info_login(sid, pwd) {
    var config = {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    }
    var data = querystring.stringify({
        "userName": sid,
        "userPass": pwd
    })
    return axios.post(login_url, data, config)
    .then (function (resp) {
        if (resp.data.indexOf('index_jg.jsp') !== -1) {
            // get cookies
            let cookies = resp.headers['set-cookie']
            return cookies
        }
    })
    .catch (function (err) {
        throw err
    })
}

async function link_login(cookies) {
    JSSESIONID = cookies[0].split(';')[0]
    BIGipServerpool_jwc_xk = cookies[1].split(';')[0]
    request_cookies = JSSESIONID + ';' + BIGipServerpool_jwc_xk
    var config = {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
            "Cookie": request_cookies
        },
        maxRedirects: 0,
        validateStatus: function (status) {
            return status >= 200 && status < 303
        }
    }
    return axios.get(link_url, config)
    .then (function (resp) {
        let nexturl = resp.headers['location']
        let cookies = redirect(nexturl)
        return cookies
    })
    .catch (function (err) {
        throw err
    })
}

function redirect(nexturl) {
    var config = {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36"
        },
        maxRedirects: 0,
        validateStatus: function (status) {
            return status >= 200 && status < 303
        }
    }
    return axios.get(nexturl, config)
    .then (function (resp) {
        let cookies = resp.headers['set-cookie']
        return cookies
    })
    .catch (function (err) {
        throw err
    })
}

async function ticket_login(cookies) {
    JSSESIONID = cookies[0].split(';')[0]
    BIGipServerpool_jwc_xk = cookies[1].split(';')[0]
    request_cookies = JSSESIONID + ';' + BIGipServerpool_jwc_xk
    var config = {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
            "Cookie": request_cookies,
            "Host":"122.204.187.6",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        maxRedirects: 0,
        validateStatus: function (status) {
            return status >= 200 && status < 303
        }
    }
    return axios.get(ticket_url, config)
    .then (function (resp) {
        let cookies = resp.headers['set-cookie']
        return cookies
    })
    .catch (function (err) {
        throw err
    })
}

// info login api
router.get('/api/info/login/', info_login_api)

// api handlers
async function info_login_api(ctx) {
    let JSSESIONID = ctx.cookies.split(';')[0].split('=')[1]
    let BIGipServerpool_jwc_xk = ctx.cookies.split(';')[2].split('=')[1]
    ctx.type = 'json'
    ctx.body = '{"JSSESIONID":"'+JSSESIONID+'",'+'"BIGipServerpool_jwc_xk":"'+BIGipServerpool_jwc_xk+'"}'
}

app.use(router.routes(), router.allowedMethods());
if (!module.parent) app.listen(3000)
