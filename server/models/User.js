const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name : {
        type: String,
        maxlength :50,
    },
    email : {
        type: String,
        trim : true,
        unique: 1,
    },
    password : {
        type: String,
        minlength : 5,
    },
    role : {
        type: Number,
        default : 0,
    },
    image : String,
    token : {
        type:  String,
    },
    tokenExp : {
        type: Number,
    }
})

//user모델에 정보를 저장하기전에 function 실행
userSchema.pre('save', function (next) {
    var user = this;

    if(user.isModified('password')) { //비밀번호가 수정될때만 다음코드 실행(비밀번호 암호화)
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if(err) return next(err) //next()함수 호출하면 index.js의 save로 바로 감
            bcrypt.hash(user.password, salt, function (err, hash) { //user.password : 암호화안된 password
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    } else { //다른거 바꿀경우에는 next()
        next()
    }
})

userSchema.methods.comparePassword = function (plainPassword, cb) {
    bcrypt.compare(plainPassword,this.password, function (err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function (cb) {
    //jsonwebtoken사용해 token생성하기
    var user = this;
    var token = jwt.sign(user._id.toHexString(), 'secretToken'); //user._id는 mongo의 _id

    user.token = token
    user.save(function (err,user) {
        if(err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function(token,cb) {
    var user = this;
    //token decode
    jwt.verify(token, "secretToken", function (err, decoded) {
        //user id 를 이용해 user 찾은후 클라이언트에서 가져온 토큰과
        //db에 보관된 토큰이 일치하는지 확인
        user.findOne({"_id" : decoded, "token": token}, function (err, user){
            if(err) return cb(err);
            cb(null, user)
         })
    })
}

const User = mongoose.model('User', userSchema);
module.exports = {User}