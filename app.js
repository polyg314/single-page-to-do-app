var express  = require('express');
var app      = express();                
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

// configuration =================
var pg = require('pg');

var db = {};

db.config = {
  database: "todoapp",
  port: 5432,
  host: "localhost"
};

db.connect = function(runAfterConnecting) {
  pg.connect(db.config, function(err, client, done){
    if (err) {
      console.error("OOOPS!!! SOMETHING WENT WRONG!", err);
    }
    runAfterConnecting(client);
    done();
  });
};

db.query = function(statement, params, callback){
  db.connect(function(client){
    client.query(statement, params, callback);
  });
};


app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':true}));
// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");

app.get('/', function(req, res){
	res.render('home');
})


app.get('/api/todos', function(req,res){
	db.query('SELECT * FROM todo', function(err, dbRes){
		console.log(dbRes);
		res.send({items: dbRes.rows})
	});
})


app.post('/api/todos', function(req, res){
	var item = req.body.item;
	db.query('INSERT INTO todo (item) VALUES ($1)', [item], function(err, dbRes){
		console.log(dbRes);
		if(err){
			res.send(err);
		}
		else{
				db.query('SELECT * FROM todo', function(err, dbRes){
				console.log(dbRes);
				res.send({items: dbRes.rows})
			});
		}
	})
})


app.delete('/api/todos/:todo_id', function(req, res){
	identity = req.params.todo_id;
	db.query('DELETE FROM todo WHERE id = $1', [identity], function(err, dbRes){
		if(err){
			res.send(err);
		}
		else{
				db.query('SELECT * FROM todo', function(err, dbRes){
				console.log(dbRes);
				res.send({items: dbRes.rows})
			});
		}
	});
});



