// //back-end 시작점
const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const { User } = require("./models/User");
const { auth } = require("./middleware/auth");
const config = require('./config/key')
const mongoose = require("mongoose");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// const cors = require('cors');
// let cors_origin =[`http://localhost:3000`];
// app.use(
//   cors({
//     origin: cors_origin, // 허락하고자 하는 요청 주소
//     credentials: true, // true로 하면 설정한 내용을 response 헤더에 추가 해줍니다.
//   })
// )

mongoose
  .connect(
    config.mongoURI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Hello Worldasdf!"));

app.post('/api/users/login', (req, res)=>{
    User.findOne({email : req.body.email}, (err, user) =>{
        if(!user) {
            return res.json({
                loginSuccess : false,
                message: "유저가 없습니다."
            })
        }
        user.comparePassword(req.body.password, (err, isMatch)=>{ //User모델에서 함수 comparePassword선언해줌
            if(!isMatch) return res.json({loginSuccess:false, message:"비밀번호 오류"})

            //login시 Token생성
            user.generateToken((err, user) => {
                //token생성을 위해 jsonwebtoken 라이브러리 사용
                if(err) return res.status(400).send(err);

                //token은 쿠키나 local storage등에 저장가능함
                //쿠키에 token 저장
                res.cookie("x_auth", user.token)
                .status(200)
                .json({loginSuccess:true, userId: user._id})
            })
        })
    })
})

app.post("/api/users/register", (req, res) => {
  const user = new User(req.body);

  //user save
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.get('/api/users/auth', auth , (req, res)=>{
    console.log(1);
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth : true,
        email : req.user.email,
        name : req.user.name,
    }) 
});

//logout => token을 지워주면됨
app.get('/api/users/logout', auth, (req, res)=>{
    User.findOneAndUpdate({_id : req.user._id}, {token:""}, (err, user)=>{
        if(err) {
            return res.json({success: false, err});}
        return res.status(200).send({
            success: true,
        })
    })
})

app.get('/api/hello', (req, res)=>{
  console.log(1);
  res.send("hello")
})

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);