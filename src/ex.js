var request = require('request')
request({
    // will be ignored
    method: 'POST',
    uri: 'http://portal.ccnu.edu.cn/loginAction.do',
    followRedirect: false,
    headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36"
    },
    form: {
        "userName": "sid",
        "userPass": "pass"
    }
}, function(err, httpResponse, body) {

    let cookie = httpResponse.headers['set-cookie'][0].split(";")[0] + ";" + httpResponse.headers['set-cookie'][1].split(";")[0]
    console.log(cookie)

    request({
        // will be ignored
        method: 'GET',
        uri: 'http://portal.ccnu.edu.cn/roamingAction.do?appId=XK',
        followRedirect: false,
        headers: {
            "Cookie": cookie,
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36"
        }
    }, function(err, httpResponse, body) {
        request({
            // will be ignored
            method: 'GET',
            uri: httpResponse.headers['location'],
            followRedirect: false,
            headers: {
                "Cookie": cookie,
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36"
            }
        }, function(err, httpResponse, body) {

            console.log(httpResponse, body)
        })
    })
})

// node通过回调函数的注册保证异步. 但是会造成回调地狱
// promise保证异步一定会发生,通过.then/.catch打乱了回调的时序;
