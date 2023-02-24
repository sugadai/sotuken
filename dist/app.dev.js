"use strict";

var _require = require("express"),
    text = _require.text;

var express = require("express");

var session = require('express-session');

var MySQLStore = require('express-mysql-session')(session); //セッション情報をDBに保存


var bcrypt = require('bcrypt');

var _require2 = require("express/lib/response"),
    redirect = _require2.redirect,
    json = _require2.json,
    type = _require2.type;

var app = express();

var mysql = require('mysql');

var cli = require("nodemon/lib/cli");

var fs = require('fs'); //ファイルを読み書きできる


var _require3 = require('csv-stringify/sync'),
    stringify = _require3.stringify; //データをCSVファイル化


var Iconv = require('iconv-lite');

var _require4 = require("console"),
    time = _require4.time;

var _require5 = require("mysql/lib/protocol/constants/types"),
    TIME = _require5.TIME;

var _require6 = require("path"),
    format = _require6.format;

var e = require("express");

var nodemailer = require('nodemailer'); //メール送信ライブラリ


var http = require('http');

var server = http.createServer(app);

var io = require('socket.io')(server);

var port = 3000;
app.use(express["static"]('public'));
app.use(express.urlencoded({
  extended: false
})); //DB接続

var client = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'm.s.l_sd6016',
  database: 'health',
  multipleStatements: true
}); //DBと接続できなければerr

client.connect(function (err) {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }

  console.log('success');
}); //express-mysql-sessionのmysqo接続

var options = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'm.s.l_sd6016',
  database: 'my_database'
}; //my_databseのセッション情報を随時更新

var sessionStore = new MySQLStore(options); //セッション管理オプション

var sess = {
  secret: 'secretsecretsecret',
  cookie: {
    maxAge: 600000
  },
  //セッション継続時間
  store: new MySQLStore(options),
  resave: false,
  saveUninitialized: false
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true; //通信がhttpsの場合cookieを有効にする(本番環境良向き)
}

app.use(session(sess)); //認証情報とnodemailerオブジェクトの生成

var porter = nodemailer.createTransport({
  service: "gmail",
  port: "465",
  secure: "true",
  auth: {
    //自分のアドレスとgmailのアプリパスワード
    user: 'dayoujianyuan091@gmail.com',
    pass: "xxlfdjfoilunnheo"
  }
}); // test.pyを呼び出すモジュール

var _require7 = require('python-shell'),
    PythonShell = _require7.PythonShell;

var obj;
var record, user_id, rate_data, rate_time, rate_date;

function pythonroad() {
  var promise;
  return regeneratorRuntime.async(function pythonroad$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!true) {
            _context.next = 6;
            break;
          }

          promise = new Promise(function (resolve) {
            //test.pyを実行
            PythonShell.run('test.py', null, function (err, result) {
              var name;
              var email;
              var flg = 0;
              if (err) throw err;
              obj = JSON.parse(result);

              for (record = 0; record < Object.keys(obj).length; record++) {
                user_id = obj[record].id;
                rate_data = obj[record].data;
                rate_date = obj[record].date;
                rate_time = obj[record].time;
                client.query('SELECT * FROM usertest WHERE deviceid = ?', [user_id], function (err, results) {
                  name = results[0]['username'];
                  email = results[0]['email']; //現在時刻の取得し5分マイナスした時刻を変数に入れる
                  // const d = new Date();
                  // const hours = d.getHours().toString().padStart(2,0)
                  // const minuts = d.getMinutes().toString().padStart(2,0)
                  // const secounds = d.getSeconds().toString().padStart(2,0)
                  // var formatted = `
                  // ${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${hours}:${minuts-5}:${secounds}`;
                  // console.log(formatted)

                  if (results[0]['numlimit'] < rate_data) {
                    //現在時刻の取得し5分マイナスした時刻をフォーマットする
                    var d = new Date();
                    var date2 = rate_date + ' ' + rate_time;
                    var d2 = new Date(date2);
                    var newdate = d2.getTime();
                    var datenow = d.getTime(); // console.log(formatted)

                    var seconds = (datenow - newdate) / 1000;
                    seconds = Math.floor(seconds); // console.log(seconds);

                    if (300 >= seconds) {
                      porter.sendMail({
                        from: "dayoujianyuan091@gmail.com",
                        to: email,
                        subject: "お知らせ！",
                        text: "".concat(name, "\u3055\u3093\u306F\u898F\u5B9A\u306E\u5FC3\u62CD\u6570\u3092\u8D85\u3048\u305F\u3053\u3068\u3092\u77E5\u3089\u305B\u307E\u3059\u3002")
                      }, function (err, info) {
                        if (err) {
                          console.log(err);
                          return;
                        }

                        console.log('Ok send mail!!');
                      });
                    }
                  }
                }), console.log("".concat(record, "\u500B\u76EE\u306E\u30EC\u30B3\u30FC\u30C9\u306Eid\u306F").concat(user_id, "\u30FB\u5FC3\u62CD\u6570\u306F").concat(rate_data, "\u30FB\u5E74\u6708\u65E5\u306F").concat(rate_date, "\u30FB\u6642\u9593\u306F").concat(rate_time, "\u3067\u3059\u3002"));
                client.query('INSERT INTO datatbl (deviceid,data,date,time) VALUE(?,?,?,?)', [user_id, rate_data, rate_date, rate_time], function (error, result) {// console.log(`${record}個目のレコードのuser_idは${user_id}・rate_dataは${rate_data}・rate_dateは${rate_date}・rate_timeは${rate_time}です。`);
                  // console.log(typeof(user_id))
                });
              } // console.log(flg)
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
          _context.next = 4;
          return regeneratorRuntime.awrap(promise);

        case 4:
          _context.next = 0;
          break;

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
}

pythonroad(); //全てのルーティング時にログインか非ログインかを判断するミドルウェア

app.use(function (req, res, next) {
  if (req.session.userId === undefined) {
    console.log('ログインしていません');
  } else {
    console.log('ログインしています');
    res.locals.userId = req.session.userId;
    res.locals.username = req.session.username;
    res.locals.email = req.session.email;
    res.locals.password = req.session.password;
    res.locals.deviceid = req.session.deviceid; // console.log(req.session.deviceid)

    res.locals.numlimit = req.session.numlimit; // res.locals.password = req.session.password;
  }

  next();
});
app.set('views', __dirname + '/views'); //テンプレートエンジン’ejs’を使用する宣言

app.set("view engine", "ejs"); //トップページ表示

app.get('/', function (req, res, error) {
  console.log(error); // if (req.session.views) {
  //   req.session.views++;
  // } else {
  //   req.session.views = 1;
  // }
  // let views = req.session.views;
  // console.log(views);

  res.render('index');
}); //ログインページ表示

app.get('/login', function (req, res, error) {
  console.log(error);
  res.render('login', {
    errors: []
  });
}); //ログイン処理

app.post('/login', function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var errors = []; //空チェック機能

  if (email === '') {
    errors.push('メールアドレスが空です。');
  }

  if (password === '') {
    errors.push('パスワードが空です。');
  }

  if (errors.length > 0) {
    res.render('login.ejs', {
      errors: errors
    });
  } else {
    next();
  }
}, function (req, res) {
  var email = req.body.email;
  client.query('SELECT * FROM usertest WHERE email = ?', [email], function (error, results) {
    var errors = [];

    if (results.length > 0) {
      var plain = req.body.password;
      var hash = results[0].password; // console.log(results);
      //入力したパスワードをハッシュ化して比較

      bcrypt.compare(plain, hash, function (error, isEqual) {
        if (isEqual) {
          //認証に成功すればセッション情報を保存し、ユーザーページにレダイレクトする
          req.session.userId = results[0].id;
          req.session.email = results[0].email;
          req.session.username = results[0].username;
          req.session.deviceid = results[0].deviceid;
          req.session.numlimit = results[0].numlimit; // console.log(results[0].numlimit)

          req.session.password = results[0].password; // console.log('認証に成功しました');

          res.redirect('/my');
        } else {
          //認証に失敗すればエラー配列と共にログインページにレスポンスする
          errors.push('認証失敗しました。');
          res.render('login', {
            errors: errors
          });
        }
      });
    } else {
      //入力したemailと一致しなければエラー配列と共にログインページにレスポンスする
      errors.push('認証に失敗しました。');
      res.render('login', {
        errors: errors
      });
    }
  });
}); //ログインページからトップページに戻る

app.get('/return', function (req, res) {
  req.session.destroy(function (error) {
    res.redirect('index');
  });
}); //ユーザーページを表示

app.get('/my', function (req, res) {
  res.render("my");
}); //新規登録ページを表示

app.get('/signup', function (req, res) {
  res.render("signup", {
    errors: []
  });
}); //新規登録処理

app.post('/signup', function (req, res, next) {
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
  var devicecode = req.body.devicecode;
  client.query('SELECT deviceid FROM partienttbl WHERE devicecode = ?', [devicecode], function (err, results) {
    if (results.length > 0) {
      var deviceid = results[0].deviceid;
      var email = req.body.email;
      client.query('SELECT * FROM usertest WHERE email = ? or deviceid = ?', [email, deviceid], function (err, results) {
        if (results.length > 0) {
          errors.push('このユーザーは既に登録済みです。');
          console.log(errors);
          res.render('signup', {
            errors: errors
          });
        } else {
          var username = req.body.username;
          var password = req.body.password;
          bcrypt.hash(password, 10, function (error, hash) {
            client.query('INSERT INTO usertest (username,email,password,deviceid) VALUES(?,?,?,?)', [username, email, hash, deviceid], function (error, results) {
              //アカウント登録完了メールをユーザーに送る
              porter.sendMail({
                from: "dayoujianyuan091@gmail.com",
                to: email,
                subject: "医療情報",
                text: "".concat(username, "\u3055\u3093\u306E\u30E6\u30FC\u30B6\u30FC\u767B\u9332\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F\u3002")
              }, function (err, info) {
                if (err) {
                  console.log(err);
                  return;
                }

                console.log('Ok send mail!!');
              }); // results[0].numlimit

              req.session.userId = results.insertId;
              req.session.username = username;
              req.session.email = email;
              req.session.password = password;
              req.session.deviceid = deviceid;
              req.session.numlimit = 100;
              res.redirect('/my');
            });
          });
        }
      });
    } else {
      console.log('ユーザーコードが間違っています。');
      errors.push('ユーザーコードが間違っています。');
      res.render('signup', {
        errors: errors
      });
    }
  });
}); //アカウント詳細ページを表示

app.get('/acount', function (req, res) {
  console.log(req.url);
  res.render('acount');
}); //アカウント変更ページを表示

app.get('/change', function (req, res) {
  console.log(req.url);
  res.render('change');
}); //アカウント変更処理

app.post('/update/:id', function (req, res, next) {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var deviceid = req.body.deviceid;
  var numlimit = req.body.numlimit; // console.log(numlimit)

  var userId = req.params.id; //パスワードのハッシュ化

  if (password.length === 1) {
    client.query('UPDATE usertest SET username = ?, email = ?,deviceid = ?,numlimit = ? WHERE id = ?', [username, email, deviceid, numlimit, userId], function (error, results) {
      req.session.userId = userId;
      req.session.email = email;
      req.session.username = username;
      req.session.password = password;
      req.session.numlimit = numlimit;
      res.redirect('/my');
    });
  } else {
    bcrypt.hash(password, 10, function (error, hash) {
      client.query('UPDATE usertest SET username = ?, email = ?, password = ?,deviceid = ?,numlimit = ? WHERE id = ?', [username, email, hash, deviceid, numlimit, userId], function (error, results) {
        console.log(results); // console.log(results[0]);

        req.session.userId = userId;
        req.session.email = email;
        req.session.username = username;
        req.session.password = password;
        req.session.numlimit = numlimit;
        res.redirect('/my');
      });
    });
  }
}); //アカウント削除処理

app.post('/delete/:id', function (req, res, next) {
  console.log(req.params.id);
  client.query('DELETE FROM usertest WHERE id = ?', [req.params.id], function (error, results) {
    res.redirect('/');
  });
}); //データをグラフで表示

app.get('/data/:id', function (req, res) {
  console.log(req.url);
  var deviceid = req.params.id;
  client.query("SELECT * FROM datatbl WHERE deviceid = ? ;", [deviceid], function (err, results) {
    results.forEach(function (e, index) {
      results[index].date = e.date.toLocaleString();
    });
    if (err) throw err; //strigifyメソッドとparseメソッドでデータをcsvファイルにする

    var csvString = JSON.stringify(results);
    var str = JSON.parse(csvString);
    str.forEach(function (data, index) {
      str[index].date = data.date.substr(0, 10);
    }); //csvファイル化

    var csvStringObj = stringify(str, {
      header: true,
      quoted_string: false
    }); // console.log(str)

    io.once("connect", function (socket) {
      console.log("ユーザーが接続しました");
      var data = 'test'; // socket.on('emit',(msg)=>{
      //   console.log(msg)
      // });

      io.emit('datas', csvStringObj);
    }); // const csvStringSjis = Iconv.encode(csvStringObj,'Shift.JIS');
    // fs.writeFileSync('./public/result.csv',csvStringSjis); 

    client.query('SELECT numlimit FROM usertest WHERE deviceid = ?', [deviceid], function (err, results) {
      req.session.numlimit = results[0].numlimit; // str.push(results);
      // console.log(str[str.length-1])

      var csvStringObj2 = stringify(results, {
        header: true,
        quoted_string: false
      });
      io.once("connection", function (socket) {
        console.log("ユーザーが接続しました"); // socket.on('emit',(msg)=>{

        console.log(csvStringObj2); // });

        io.emit('limit', csvStringObj2);
      }); // const csvStringSjis2 = Iconv.encode(csvStringObj2,'Shift.JIS');
      // // console.log(csvStringObj,csvStringObj2)
      // fs.writeFileSync('./public/limit.csv',csvStringSjis2); 
    });
  }), client.query('SELECT data FROM datatbl WHERE data = (SELECT MAX(data) FROM datatbl) ; SELECT data FROM datatbl WHERE data = (SELECT MIN(data) FROM datatbl) ', function (error, results) {
    if (error) throw error; // console.log(results)

    res.render('data', {
      result: results
    });
  });
}); //トップページ戻り保存していたセッション情報を破棄する(ログアウト)

app.get('/logout', function (req, res) {
  req.session.destroy(function (error) {
    res.redirect('/');
  });
}); //指定したポート番号でサーバ構築

server.listen(port, function () {
  console.log("server start!!");
});
//# sourceMappingURL=app.dev.js.map
