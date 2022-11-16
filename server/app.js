const express = require('express');
const app = express();
const session = require('express-session');

//node restart 없이 자동반영되게끔
const fs = require('fs');

app.use(session({
    secret: 'secret code',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 //쿠키 유효 시간 1시간
    }
}));

//server port 열기
const server = app.listen(3200, ()=> {  //3200번 포트
    console.log('Server Started. port 3200.');
});

const sql = require('./sql.js');

//sql 바로 반영
fs.watchFile(__dirname + '/sql.js', (curr, prev) => {
    console.log('sql 변경 시 재시작 없이 반영되도록 함');
    delete require.cache[require.resolve('./sql.js')];          //캐시를날림
    sql = require('./sql.js');                                  //변경한 쿼리를 다시 담아줌 
});

//DB연결 정의
const db = {
    database: "findHome",
    connectionLimit: 10,
    host: "127.0.0.1",
    user: "root",
    password: "mariadb"
};
const dbPool = require('mysql').createPool(db);     //db 연동

//db 연결부
const req = { 
    async db(alias, param = [], where = '' ) {
        return new Promise((resolve, reject) => dbPool.query(sql[alias].query + where , param, (error, rows) => {
             if ( error ) {
                if ( error.code != 'ER_DUP_ENTRY')
                    console.log(error); 
                resolve({
                    error
                });
             } else resolve(rows);
        }));
     } 
};
//:alias DB 연결부
app.post('/api/:alias', async (request, res) => {
    try {
        res.send(await req.db(request.params.alias, request.body.param));
    } catch(err) {
        res.status(500).send({
            error: err
        });
    }
});

//어드민 로그인이 꼭 필요할 때 사용하는 부분 (apiAdmin)
app.post('/apiAdmin/:alias', async (request, res) => {
    //특정 권한 처리를 줄때 사용
    if(!request.session.email){
        return res.status(401).send({
            error: '로그인 아이디를 확인하세요.'
        });
    }

    try {
        res.send(await req.db(request.params.alias, request.body.param));
    } catch(err) {
        res.status(500).send({
            error: err
        });
    }
});

//로그인
app.post('/api/login', async(request, res) => {
    request.session['email'] = 'hbg199@naver.com'
    res.send('ok');
});
//로그아웃
app.post('/api/logout', async(request, res) => {
    request.session.destroy();
    res.send('Ok');
});

