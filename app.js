const { text } = require("express");
const express = require("express");
const session = require('express-session');
const MySQLStore= require('express-mysql-session')(session);//セッション情報をDBに保存
const bcrypt = require('bcrypt');
const { redirect, json, type } = require("express/lib/response");
const app = express();
const mysql = require('mysql');
const cli = require("nodemon/lib/cli");
const fs = require('fs');//ファイルを読み書きできる
const { stringify } = require('csv-stringify/sync');//データをCSVファイル化
const Iconv = require('iconv-lite');
const { time } = require("console");
const { TIME } = require("mysql/lib/protocol/constants/types");
const { format } = require("path");
const e = require("express");
const nodemailer = require('nodemailer');//メール送信ライブラリ
const http = require('http');
const server = http.createServer(app)
const io = require('socket.io')(server)
const port = 3000;


app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

//DB接続
const client = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'm.s.l_sd6016',
    database: 'health',
    multipleStatements: true
});

//DBと接続できなければerr
client.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('success');
});

//express-mysql-sessionのmysqo接続
const options = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'm.s.l_sd6016',
  database: 'my_database'
};

//my_databseのセッション情報を随時更新
const sessionStore = new MySQLStore(options);
//セッション管理オプション
const sess = {
  secret: 'secretsecretsecret',
  cookie: { maxAge: 600000 },//セッション継続時間
  store: new MySQLStore(options),
  resave: false,
  saveUninitialized: false,
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1)
  sess.cookie.secure = true//通信がhttpsの場合cookieを有効にする(本番環境良向き)
}
app.use(session(sess))


//認証情報とnodemailerオブジェクトの生成
const porter = nodemailer.createTransport({
  service : "gmail",
  port : "465",
  secure : "true",
  auth :{
    //自分のアドレスとgmailのアプリパスワード
    user : 'dayoujianyuan091@gmail.com',
    pass : "xxlfdjfoilunnheo"
  }
})

// test.pyを呼び出すモジュール
var {PythonShell} = require('python-shell');
let obj;
let record,user_id,rate_data,rate_time,rate_date;
async function pythonroad(){
    while(true){
        let promise = new Promise((resolve) => {
          //test.pyを実行
            PythonShell.run('test.py', null,function(err, result) {
              let name;
              let email;
              let flg = 0;
              if (err) throw err;
                obj = JSON.parse(result);
                for(record=0;record<Object.keys(obj).length;record++){
                  user_id = obj[record].id;
                  rate_data = obj[record].data;
                  rate_date = obj[record].date;
                  rate_time = obj[record].time;
                  client.query(
                    'SELECT * FROM usertest WHERE deviceid = ?',
                    [user_id],
                    (err,results)=>{
                      name = results[0]['username'];
                      email = results[0]['email']
                      //現在時刻の取得し5分マイナスした時刻を変数に入れる
                      // const d = new Date();
                      // const hours = d.getHours().toString().padStart(2,0)
                      // const minuts = d.getMinutes().toString().padStart(2,0)
                      // const secounds = d.getSeconds().toString().padStart(2,0)
                      // var formatted = `
                      // ${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${hours}:${minuts-5}:${secounds}`;
                      // console.log(formatted)
                      if(results[0]['numlimit'] < rate_data){
                        //現在時刻の取得し5分マイナスした時刻をフォーマットする
                        const d = new Date();
                        let date2 = rate_date + ' ' + rate_time;
                        const d2 = new Date(date2);
                        let newdate = d2.getTime();
                        let datenow = d.getTime();
                        // console.log(formatted)
                        let seconds =  (datenow - newdate) / 1000;
                        seconds = Math.floor(seconds)
                        // console.log(seconds);
                        if(300 >= seconds){
                          porter.sendMail({
                            from : "dayoujianyuan091@gmail.com",
                            to : email,
                            subject : "お知らせ！",
                            text : `${name}さんは規定の心拍数を超えたことを知らせます。`
                          },(err,info)=>{
                            if(err){
                                 console.log(err)
                                 return
                            }
                            console.log('Ok send mail!!');
                          })
                        }
                      }
                    }
                  ), 
                  console.log(`${record}個目のレコードのidは${user_id}・心拍数は${rate_data}・年月日は${rate_date}・時間は${rate_time}です。`);
                  client.query(
                    'INSERT INTO datatbl (deviceid,data,date,time) VALUE(?,?,?,?)',
                    [user_id,rate_data,rate_date,rate_time],
                    (error,result)=>{
                      // console.log(`${record}個目のレコードのuser_idは${user_id}・rate_dataは${rate_data}・rate_dateは${rate_date}・rate_timeは${rate_time}です。`);
                      // console.log(typeof(user_id))
                    }
                  )
                }
                // console.log(flg)
                // if(flg === 1){
                  // porter.sendMail({
                  //   from : "dayoujianyuan091@gmail.com",
                  //   to : email,
                  //   subject : "お知らせ！",
                  //   text : `${name}さんは規定の心拍数を超えたことを知らせます。`
                  // },(err,info)=>{
                  //   if(err){
                  //        console.log(err)
                  //        return
                  //   }
                  //   console.log('Ok send mail!!');
                  // })
                // }
                resolve();
            });
        });
        await promise;
    }
}

pythonroad();



//全てのルーティング時にログインか非ログインかを判断するミドルウェア
app.use((req,res,next)=>{
  if (req.session.userId === undefined) {
    console.log('ログインしていません');
  } else {
    console.log('ログインしています');
    res.locals.userId = req.session.userId
    res.locals.username = req.session.username
    res.locals.email = req.session.email
    res.locals.password = req.session.password
    res.locals.deviceid = req.session.deviceid
    // console.log(req.session.deviceid)
    res.locals.numlimit = req.session.numlimit
    // res.locals.password = req.session.password;
  }
  next();
});
app.set('views',__dirname+'/views');

//テンプレートエンジン’ejs’を使用する宣言
app.set("view engine", "ejs");

//トップページ表示
app.get('/',(req,res,error) => {
  console.log(error);
  // if (req.session.views) {
  //   req.session.views++;
  // } else {
  //   req.session.views = 1;
  // }
  // let views = req.session.views;
  // console.log(views);
  res.render('index');
});



//ログインページ表示
app.get('/login',(req,res,error) => {
  console.log(error);
  res.render('login',{errors: [] });
});

//ログイン処理
app.post('/login', (req, res ,next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = [];
//空チェック機能
  if(email === ''){
    errors.push('メールアドレスが空です。');
  }
  if(password === ''){
    errors.push('パスワードが空です。');
  }
  if(errors.length > 0){
    res.render('login.ejs',{errors : errors});
  }else{
    next();
  }
},
(req,res)=>{
  const email = req.body.email;
  client.query(
    'SELECT * FROM usertest WHERE email = ?',
    [email],
    (error, results) => {
      const errors = [];
      if(results.length > 0){
        const plain = req.body.password;
        const hash = results[0].password;
        // console.log(results);
        //入力したパスワードをハッシュ化して比較
        bcrypt.compare(plain,hash,(error,isEqual)=>{
        if(isEqual){
          //認証に成功すればセッション情報を保存し、ユーザーページにレダイレクトする
          req.session.userId = results[0].id
          req.session.email = results[0].email
          req.session.username = results[0].username
          req.session.deviceid = results[0].deviceid
          req.session.numlimit = results[0].numlimit
          // console.log(results[0].numlimit)
          req.session.password = results[0].password;
          // console.log('認証に成功しました');
          res.redirect('/my');
        }else{
          //認証に失敗すればエラー配列と共にログインページにレスポンスする
          errors.push('認証失敗しました。')
          res.render('login',{errors:errors});
        }
        });
      }else{
        //入力したemailと一致しなければエラー配列と共にログインページにレスポンスする
        errors.push('認証に失敗しました。');
        res.render('login',{errors:errors});  
      }
    }
  )
}
);


//ログインページからトップページに戻る
app.get('/return', (req, res) => {
    req.session.destroy((error) => {
      res.redirect('index');
    });
  });

//ユーザーページを表示
app.get('/my',(req,res)=>{
    res.render("my");
});

//新規登録ページを表示
app.get('/signup',(req,res) => {
    res.render("signup",{errors: [] });
});

//新規登録処理
app.post('/signup',(req,res,next)=>{
  // //空チェック
  // const username = req.body.username;
  // const email = req.body.email;
  // const password = req.body.password;
  // const devicecode = req.body.devicecode;
  // const errors = [];

  // if(username === ''){
  //   errors.push('ユーザー名が空です');
  // }
  // if(email === ''){
  //   errors.push('メールアドレスが空です');
  // }
  // if(password === ''){
  //   errors.push('パスワードが空です');
  // }
  // if(devicecode === ''){
  //   errors.push('デバイスが空です。')
  // }
  // console.log(errors);
  // if(errors.length > 0){
  //   res.render('signup.ejs',{errors : errors});
  // }else{
  //   next();
  // }
  // },
  // (req,res,next)=>{
    // const devicecode = req.body.devicecode
    // client.query(
    //   'SELECT deviceid * FROM partienttbl WHEHE devicecode = ?',
    //   [devicecode],
    //   (err,results)=>{
        
    //   }
    // )
  // },
  const devicecode = req.body.devicecode
  client.query(
    'SELECT deviceid FROM partienttbl WHERE devicecode = ?',
    [devicecode],
    (err,results)=>{
      if(results.length > 0){
        const deviceid = results[0].deviceid
        const email = req.body.email;
        client.query(
          'SELECT * FROM usertest WHERE email = ? or deviceid = ?',
          [email,deviceid],
          (err,results)=>{
            if(results.length > 0){
              errors.push('このユーザーは既に登録済みです。')
              console.log(errors)
              res.render('signup',{errors : errors})
            }else{
              const username = req.body.username;
              const password = req.body.password;
              bcrypt.hash(password,10,(error,hash)=>{
                client.query(
                  'INSERT INTO usertest (username,email,password,deviceid) VALUES(?,?,?,?)',
                  [username,email,hash,deviceid],
                  (error,results)=>{
                    //アカウント登録完了メールをユーザーに送る
                    porter.sendMail({
                      from : "dayoujianyuan091@gmail.com",
                      to : email,
                      subject : "医療情報",
                      text : `${username}さんのユーザー登録が完了しました。`
                    },(err,info)=>{
                      if(err){
                           console.log(err)
                           return
                      }
                      console.log('Ok send mail!!');
                    })
                    // results[0].numlimit
                    req.session.userId = results.insertId;
                    req.session.username = username;
                    req.session.email = email;
                    req.session.password = password;
                    req.session.deviceid = deviceid;
                    req.session.numlimit = 100;
                    res.redirect('/my');
                  } 
                );
              });
            }
          }
        )
      }else{
        console.log('ユーザーコードが間違っています。')
        errors.push('ユーザーコードが間違っています。')
        res.render('signup',{errors : errors})
      }
    }
  ) 
});

//アカウント詳細ページを表示
app.get('/acount',(req,res) => {
  console.log(req.url)
  res.render('acount');
});

//アカウント変更ページを表示
app.get('/change', (req,res) => {
  console.log(req.url)
  res.render('change');
})

//アカウント変更処理
app.post('/update/:id',(req,res,next)=>{
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const deviceid = req.body.deviceid;
  const numlimit = req.body.numlimit;
  // console.log(numlimit)
  const userId = req.params.id;
  //パスワードのハッシュ化
  if(password.length === 1){
    client.query(
      'UPDATE usertest SET username = ?, email = ?,deviceid = ?,numlimit = ? WHERE id = ?',
      [username,email,deviceid,numlimit,userId],
      (error,results)=>{
        req.session.userId = userId;
        req.session.email = email;
        req.session.username = username;
        req.session.password = password;
        req.session.numlimit = numlimit;
        res.redirect('/my');
      }
    )
  }else{
    bcrypt.hash(password,10,(error,hash)=>{
      client.query(
        'UPDATE usertest SET username = ?, email = ?, password = ?,deviceid = ?,numlimit = ? WHERE id = ?',
        [username,email,hash,deviceid,numlimit,userId],
        (error,results)=>{
          console.log(results)
          // console.log(results[0]);
          req.session.userId = userId;
          req.session.email = email;
          req.session.username = username;
          req.session.password = password;
          req.session.numlimit = numlimit;
          res.redirect('/my');
        } 
      );
    });
  }
});

//アカウント削除処理
app.post('/delete/:id',(req,res,next) =>{
  console.log(req.params.id);
  client.query(
    'DELETE FROM usertest WHERE id = ?',
    [req.params.id],
    (error,results)=>{
      res.redirect('/');
    }
  )
})

  
//データをグラフで表示
app.get('/data/:id',(req,res)=>{
  console.log(req.url);
  const deviceid = req.params.id;
  client.query(
    `SELECT * FROM datatbl WHERE deviceid = ? ;`,
    [deviceid],
    (err,results)=>{
      results.forEach((e,index)=>{
        results[index].date = e.date.toLocaleString();
      })
      if(err) throw err
      //strigifyメソッドとparseメソッドでデータをcsvファイルにする
      const csvString = JSON.stringify(results);
      const str = JSON.parse(csvString);
      str.forEach((data,index)=>{
        str[index].date =(data.date.substr(0,10));
      })
      //csvファイル化
      const csvStringObj = stringify(str,{
        header:true,
        quoted_string:false
      })
      // console.log(str)

      io.once("connect", (socket) => {
        console.log("ユーザーが接続しました");
        let data = 'test';
        // socket.on('emit',(msg)=>{
        //   console.log(msg)
        // });
        io.emit('datas',csvStringObj);
      });
      // const csvStringSjis = Iconv.encode(csvStringObj,'Shift.JIS');
      // fs.writeFileSync('./public/result.csv',csvStringSjis); 
      client.query(
        'SELECT numlimit FROM usertest WHERE deviceid = ?',
        [deviceid],
        (err,results)=>{
          req.session.numlimit = results[0].numlimit
          // str.push(results);
          // console.log(str[str.length-1])
          const csvStringObj2 = stringify(results,{
            header:true,
            quoted_string:false
          })
          
          io.once("connection", (socket) => {
            console.log("ユーザーが接続しました");
            // socket.on('emit',(msg)=>{
              console.log(csvStringObj2)
            // });
            io.emit('limit',csvStringObj2);
          });
          // const csvStringSjis2 = Iconv.encode(csvStringObj2,'Shift.JIS');
          // // console.log(csvStringObj,csvStringObj2)
          // fs.writeFileSync('./public/limit.csv',csvStringSjis2); 
        }
      )
    }
  ),
  
  client.query(
    'SELECT data FROM datatbl WHERE data = (SELECT MAX(data) FROM datatbl) ; SELECT data FROM datatbl WHERE data = (SELECT MIN(data) FROM datatbl) ',
    (error,results)=>{
      if(error) throw error
      // console.log(results)
      res.render('data',{result : results})
    }
  )  
});




//トップページ戻り保存していたセッション情報を破棄する(ログアウト)
app.get('/logout',(req,res)=>{
  req.session.destroy((error)=>{
    res.redirect('/');
  });
});

//指定したポート番号でサーバ構築
server.listen(port,()=>{
    console.log("server start!!");
});
