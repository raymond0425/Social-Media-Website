var express = require('express')
var router = express.Router()
var session = require("express-session")

// router.get('/', (req, res) => { 
//     res.send("sss")
// });

// router.use(session({
//     secret: 'random_string_goes_here',
//     resave: false,
//     saveUnitialized: true
// }))

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

// 1. HTTP POST requests for http://localhost:3001/signin.
router.post('/signin', express.urlencoded({ extended: true }), (req, res) => {
	var name = req.body.name;
	var pwd = req.body.password;

	var db = req.db;
    var user_col = db.get("userList");
	user_col.find({'name':name},{}, function(error, login_user){
        if(error === null) {
            if((login_user.length>0)&&(login_user[0].password==pwd)) {
                session.userId = login_user[0]._id;
                db.collection("noteList").find({'userId': `${login_user[0]._id}`}).then((docs)=>{
                    if (error === null){
                        res.send({
                            name: login_user[0].name,
                            icon: login_user[0].icon,
                            notewritten: docs,
                            length: login_user[0]._id
                        });
                    }
                    else {
                        res.send( "Login failure" );
                    }
                });
            } else {
                res.send( "Login failure" );
            }
        } else {       // Have error
            res.send( "Login failure" );
        }
    });
});

//2. HTTP GET requests for http://localhost:3001/logout.
router.get('/logout', (req, res) => {
    session.userId = null;
  	res.send("");
});

//3. HTTP GET requests for http://localhost:3001/getnote?noteid=xx.
router.get('/getnote', (req, res) => {
    var noteid = req.query.noteid;

    var db = req.db;
    var note_col = db.get("noteList");
    
    note_col.find({'_id': `${noteid}`},function(err,note){
        if (err === null){
            if (note.length > 0){
                res.send({
                    _id: note[0]._id,
                    lastsavedtime: note[0].lastsavedtime,
                    title: note[0].title,
                    content: note[0].content
                });
            }
            else {
                res.send("There is no result.");
            }
        }
        else{
            res.send( "Error in finding note in noteList." );
        }
    });
});

//4. HTTP POST requests for http://localhost:3001/addnote.
router.post('/addnote', (req, res) => {

    var userId = session.userId;
    var title = req.body.title;
	var content = req.body.content;

    var db = req.db;
    var note_col = db.get("noteList");

    //set lastsavedtime
    const week_c = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const month_c = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var time = new Date();
    var hhmmss= time.toISOString().substring(11, 19);
    var week = week_c[time.getDay()];
    var month = month_c[time.getMonth()];
    var date_month = time.getDate();
    var year = time.getFullYear();
    var time_string = `${hhmmss} ${week} ${month} ${date_month} ${year}`;

    objectToInsert = {'userId': `${userId}`, 
                    'lastsavedtime': `${time_string}`, 
                    'title': `${title}`, 
                    'content': `${content}`}

    note_col.insert(objectToInsert, function (err){
                        if (err === null) {
                            res.send({
                                lastsavedtime: time_string,
                                _id: objectToInsert._id
                            });
                        }
                        else{
                            res.send( "Error in adding new notes to db." );
                        }
                    }
                );

});

//5. HTTP PUT requests for http://localhost:3001/savenote/:noteid.
router.put('/savenote/:noteid', (req, res) => {
    var noteid = req.params.noteid;
    var title_this = req.body.title;
    var content_this = req.body.content;

    var db = req.db;
    var note_col = db.get("noteList");

    //set lastsavedtime
    const week_c = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const month_c = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var time = new Date();
    var hhmmss= time.toISOString().substring(11, 19);
    var week = week_c[time.getDay()];
    var month = month_c[time.getMonth()];
    var date_month = time.getDate();
    var year = time.getFullYear();
    var time_string = `${hhmmss} ${week} ${month} ${date_month} ${year}`;

    note_col.update({'_id': `${noteid}`}, 
                    {$set:{'lastsavedtime': `${time_string}`,
                        'title': `${title_this}`, 
                        'content': `${content_this}`}}, function (err){
                        if (err === null) {
                            res.send({
                                lastsavedtime: time_string,
                            });
                        }
                        else{
                            res.send( "Error" );
                        }
                    }
                );

});

//6. HTTP GET requests for http://localhost:3001/searchnotes?searchstr=xx. 
router.get('/searchnotes', function (req, res){
    var searchstr = req.query.searchstr;

    var db = req.db;
    var note_col = db.get("noteList");

    var arr = [];
    note_col.find({'userId': `${session.userId}`},function (err, note){
        if (err === null){
            for (n of note) {
                for (const [key, value] of Object.entries(n)) {
                    if ((String(value)).includes(searchstr)) {
                        arr.push(n);
                        break;
                    }
                }
            }
            res.send(arr);
        }
        else{
            res.send( "Error");
        }
    });
});

//7. HTTP DELETE requests for http://localhost:3001/deletenote/:noteid.
router.delete('/deletenote/:noteid', function (req, res){
    var noteid = req.params.noteid;

    var db = req.db;
    var note_col = db.get("noteList");

    note_col.remove({"_id": `${noteid}`}).then((docs)=>{
        res.send("")
    }).catch((err)=>{
        res.send(err);
    });

});



module.exports = router;

