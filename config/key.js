//process.env.NODE_ENV 가 develope(Local)환경이면 => develope으로 나오고
// 배포환경이면 production으로 나옴
if(process.env.NODE_ENV === 'production'){
    module.exports = require("./prod")
} else {
    module.exports = require('./dev')
}