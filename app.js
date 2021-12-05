const express = require("express");
const mysql = require('mysql');
const app = express()
const port = 9000

const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const FileStore = require('session-file-store')(session);
const cookieParser = require('cookie-parser');
const { title } = require("process");

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static("assets"));
app.use(express.json());

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'node_db',
});



//세션등록
app.use(session({
  secret: 'mykey', // 이 값을 통해 세션을 암호화 ( 노출하지 않아야 함)
  resave: false, // 세션 데이터가 바뀌기 전까지는 세션 저장소에 값을 저장하지 않음
  saveUninitialized: true, // 세션이 필요하면 세션을 실행시킨다
  store : new FileStore() // 세션이 데이터를 저장하는 곳
}));


// 회원가입
app.get('/register', (req, res) => {
  console.log('회원가입 페이지');
  res.render('register');
});
app.post('/register', (req, res) => {
  console.log('회원가입 하는중')
  const body = req.body;
  const id = body.id;
  const pw = body.pw;
  const name = body.name;
  const age = body.age;

  con.query('select * from users where id=?', [id], (err, data) => {
    if (data.length == 0) {
      console.log('회원가입 성공');
      con.query('insert into users(id, pw, name, age) values(?,?,?,?)', [
        id, pw, name, age, ]);
      res.send('<script>alert("회원가입 성공!!"); location.href="/"</script>')

    } else {
      console.log('회원가입 실패');
      res.send('<script>alert("회원가입 실패!! (동일한 정보가 존재합니다.)"); location.href="/register"</script>')
    }

  });
});

// 로그인
app.get('/login',(req,res)=>{
  console.log('로그인 작동');
  res.render('login');
});

app.post('/login',(req,res)=>{
  const body = req.body;
  const id = body.id;
  const pw = body.pw;

  con.query('select * from users where id=?',[id],(err,data)=>{
      // 로그인 확인
      console.log(data[0]);
      console.log(id);
      console.log(data[0].id);
      console.log(data[0].pw);
      console.log(id == data[0].id);
      console.log(pw == data[0].pw);
      if(id == data[0].id && pw == data[0].pw){
          console.log('로그인 성공');
          // 세션에 추가
          req.session.is_logined = true;
          req.session.name = data.name;
          req.session.id = data.id;
          req.session.pw = data.pw;
          req.session.save(function(){ // 세션 스토어에 적용하는 작업
              res.render('index',{ // 정보전달
                  name : data[0].name,
                  id : data[0].id,
                  age : data[0].age,
                  is_logined : true
              });
          });
      }else{
          console.log('로그인 실패');
          res.render('login');
      }
  });
});


// 로그아웃
app.get('/logout',(req,res)=>{
  console.log('로그아웃 성공');
  req.session.destroy(function(err){
      // 세션 파괴후 할 것들
      res.redirect('/');
  });
});

app.get('/',(req,res)=>{
    const sql = 'SELECT * FROM users';
    con.query(sql,function(err,result,fields){
        if(err)throw err;
        res.render('index',{users : result});
    });
});

app.get('/create',(req,res)=>
    res.sendFile(path.join(__dirname,'html/form.html'))
)

app.post('/',(req,res)=>{
    const sql ='INSERT INTO users SET ?';
    con.query(sql,req.body,function(err,result,fields){
        console.log(result);
        res.send('등록이 완료되었습니다');
    });
});

app.get('/delete/:id',(req,res)=>{
    const sql = 'DELETE FROM users WHERE id =?';
    con.query(sql,[req.params.id],function(err,result,fields){
        if(err)throw err;
        console.log(result);
        res.redirect('/');
    });
});

app.get('/edit/:id',(req,res)=>{
    const sql ='SELECT * FROM users WHERE id =?';
    con.query(sql,[req.params.id],function(err,result,fields){
        if(err)throw err;
        res.render('edit',{users:result});
    });
});

app.post('/update/:id',(req,res)=>{
    const sql = 'UPDATE users SET ? WHERE id ='+req.params.id;
    con.query(sql, req.body, function (err, result, fields){
        if(err) throw err;
        console.log(result);
        res.redirect('/');
    });
});


app.get('/memo1',(req,res)=>{
  const sql = 'SELECT * FROM memo1';
  con.query(sql,function(err,result,fields){
      if(err)throw err;
      res.render('memo1',{memo1 : result});
  });
});

app.get('/memo2',(req,res)=>{
  const sql = 'SELECT * FROM memo2';
  con.query(sql,function(err,result,fields){
      if(err)throw err;
      res.render('memo2',{memo2 : result});
  });
});

app.get('/memo1',(req,res)=>
  res.sendFile(path.join(__dirname,'html/memo1.html'))
)

app.get('/memo2',(req,res)=>
  res.sendFile(path.join(__dirname,'html/memo2.html'))
)

app.get('/memo1',(req,res)=>{
    const sql='INSERT INTO memo1 value(?,?)';
    con.query(sql,req.body,function(err,result,fields){
      if (err) throw err;
      console.log(result);
      res.send('등록이 완료 되었습니다.');
    })
  })
app.get('/memo2',(req,res)=>{
    const sql='INSERT INTO memo2 value(?,?)';
    con.query(sql,req.body,function(err,result,fields){
      if (err) throw err;
      console.log(result);
      res.send('등록이 완료 되었습니다.');
    })
})

app.get('/edit1/:id',(req,res)=>{
    const sql ='SELECT * FROM memo1 WHERE title =?';
    con.query(sql,[req.params.id],function(err,result,fields){
        if(err)throw err;
        res.render('edit1',{memo1:result});
    });
});

app.get('/edit2/:id',(req,res)=>{
    const sql ='SELECT * FROM memo2 WHERE title =?';
    con.query(sql,[req.params.id],function(err,result,fields){
        if(err)throw err;
        res.render('edit2',{memo2:result});
    });
});

app.get('/delete1/:id',(req,res)=>{
    console.log(req.params.id);
    const sql = 'DELETE FROM memo1 WHERE title = ?';
    con.query(sql,[req.params.id],function(err,result,fields){
  
        if(err)throw err;
        console.log(result);
        res.redirect('/memo1');
    });
  });

app.get('/delete2/:id',(req,res)=>{
    console.log(req.params.id);
    const sql = 'DELETE FROM memo2 WHERE title = ?';
    con.query(sql,[req.params.id],function(err,result,fields){
  
        if(err)throw err;
        console.log(result);
        res.redirect('/memo2');
    });
});

app.post('/update1/:id',(req,res)=>{
    const sql = 'UPDATE memo1 SET ? WHERE title =\''+req.params.id+"\'";
    con.query(sql, req.body, function (err, result, fields){
        if(err) throw err;
        console.log(result);
        res.redirect('/memo1');
    });
});

app.post('/update2/:id',(req,res)=>{
    const sql = 'UPDATE memo2 SET ? WHERE title =\''+req.params.id+"\'";
    con.query(sql, req.body, function (err, result, fields){
        if(err) throw err;
        console.log(result);
        res.redirect('/memo2');
    });
});

app.post('/insert1',(req,res)=>{
    const sql ='INSERT INTO memo1 SET ?';
    con.query(sql,req.body,function(err,result,fields){
        console.log(result);
        res.send('등록이 완료되었습니다');
    });
});


app.post('/insert2',(req,res)=>{
    const sql ='INSERT INTO memo2 SET ?';
    con.query(sql,req.body,function(err,result,fields){
        console.log(result);
        res.send('등록이 완료되었습니다');
    });
});

app.get('/create1',(req,res)=>
    res.sendFile(path.join(__dirname,'html/form1.html'))
)

app.get('/create2',(req,res)=>
    res.sendFile(path.join(__dirname,'html/form2.html'))
)
app.listen(port, () => {
  console.log(`${port}번 포트에서 서버 대기중입니다.`)
});