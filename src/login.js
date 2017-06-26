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

login_url = 'http://portal.ccnu.edu.cn/loginAction.do'
link_url = 'http://portal.ccnu.edu.cn/roamingAction.do?appId=XK'
ticket_url1 = "http://122.204.187.6/hzsflogin?ticket=wKhQEg0HHcVx22CCW4Z7Y3POIK7HTT9YDDOH"
ticket_url2 = 'http://122.204.187.6/xtgl/login_tickitLogin.html'
menu_url = 'http://122.204.187.6/xtgl/index_initMenu.html?jsdm=xs&_t=1498483088016'

// http basic authorization middleware
app.use(async function(ctx, next) {
    try {
        let headers = ctx.request.headers
        let authH = headers['authorization']
        if (authH == undefined) {
            ctx.status = 401
        } else {
            let authS = Buffer.from(authH.slice(6,), 'base64').toString()
            let sid = authS.split(':')[0]
            let pwd = authS.split(':')[1]

            let _cookies = await info_login(sid, pwd)
            if (_cookies == undefined) {
                ctx.status = 403
            }
            console.log('_cookies:', _cookies)
            let __cookies = await link_login(_cookies)
            if (__cookies == undefined) {
                ctx.status = 403
            }
            console.log('__cookies:', __cookies)
            let ___cookies = await ticket_login(__cookies, "GET", ticket_url2)
            if (___cookies == undefined) {
                ctx.status = 403
            }
            console.log('___cookies:', ___cookies) 
            // let ____cookies = await ticket_login(___cookies, "POST", ticket_url2)
            // if (___cookies == undefined) {
            //     ctx.status = 403
            // }
            // console.log('____cookies:', ____cookies) // 现在这个cookie不对啊!!!
        }
    } catch (err) {
        throw err
    }
})

// info login spider
function info_login(sid, pwd) {
    var config = {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
            'Content-Type': 'application/x-www-form-urlencoded'
        }
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
        console.log(err)
    })
}

function link_login(cookies) {
    JSSESIONID = cookies[0].split(';')[0]
    BIGipServerpool_jwc_xk = cookies[1].split(';')[0]
    request_cookies = JSSESIONID + ';' + BIGipServerpool_jwc_xk
    var config = {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
            "Cookie": request_cookies
        }
    }
    return axios.get(link_url, config)
    .then (function (resp) {
        let cookies = resp.headers['set-cookie']
        return cookies
    })
    .catch (function (err) {
        console.log(err)   
    })
}

function ticket_login(cookies, method, ticket_url) {
    JSSESIONID = cookies[0].split(';')[0]
    BIGipServerpool_jwc_xk = cookies[1].split(';')[0]
    request_cookies = JSSESIONID + ';' + BIGipServerpool_jwc_xk
    var config = {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
            "Cookie": request_cookies,
            "Host":"122.204.187.6",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }
    }
    if (method == "POST") {
        return axios.post(ticket_url, config)
        .then (function (resp) {
            let cookies = resp.headers['set-cookie']
            return cookies
        })
        .catch (function (err) {
            console.log(err)
        })
    }
    else if (method == "GET") {
         return axios.get(ticket_url, config)
        .then (function (resp) {
            console.log(resp.headers)
            let cookies = resp.headers['set-cookie']
            return cookies
        })
        .catch (function (err) {
            console.log(err)
        })
    }
}

// info login api
router.get('/api/info/login/', info_login_api)

// api handlers
async function info_login_api(ctx) {
    // let cookies = await login_spider(sid, pwd)
    ctx.body = "hello koa"
}

app.use(router.routes(), router.allowedMethods());
if (!module.parent) app.listen(3000)
