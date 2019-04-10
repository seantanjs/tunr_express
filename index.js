console.log("starting up!!");

const express = require('express');
const methodOverride = require('method-override');
const pg = require('pg');

// Initialise postgres client
const configs = {
  user: 'sean',
  host: '127.0.0.1',
  database: 'tunr_db',
  port: 5432,
};

const pool = new pg.Pool(configs);

pool.on('error', function (err) {
  console.log('idle client error', err.message, err.stack);
});


/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();


app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(methodOverride('_method'));

app.use(express.static("public"));


// Set react-views to be the default view engine
const reactEngine = require('express-react-views').createEngine();
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', reactEngine);

/**
 * ===================================
 * Routes
 * ===================================
 */

app.get('/', (request, response) => {
  response.render('home');
});


/**
 * ===================================
 * Index
 * ===================================
 */



app.get('/artists/', (request, response) => {
  // query database for all pokemon
  const queryString = "SELECT * FROM artists ORDER BY id";

  pool.query(queryString, (errorObj, result) => {
    if(errorObj) {
        console.log(errorObj.stack);
        response.send("query error test 2");
    } else {
        const data = { artists: result.rows }

        response.render( "index", data );
    }
  })

});

/**
 * ===================================
 * Create
 * ===================================
 */

app.get('/artists/new', (request, response) => {
   response.render("create");
})


app.post('/artists', (request, response) => {

    console.log(request.body);
    const queryString = "INSERT INTO artists (name, photo_url, nationality) VALUES ($1, $2, $3)";

    const values = [request.body.name, request.body.photo_url, request.body.nationality];

    pool.query(queryString, values, (errorObj, result) => {
        if(errorObj) {
            console.log(errorObj.stack);
            response.send("query error test 3");
        } else {
            response.send("A new artist has been added!" + "<br><br><a href=/artists/>Home</a>");
        }
    })

})


/**
 * ===================================
 * Edit
 * ===================================
 */


app.get('/artists/:id/edit', (request, response) => {

    const queryString = "SELECT * FROM artists WHERE id=" + request.params.id;

    pool.query(queryString, (errorObj, result) => {
        if(errorObj) {
            console.log(errorObj.stack);
            response.send("query error test 4");
        } else {
            const data = { artist: result.rows }
            response.render("edit", data );
        }
    })


});

 app.put('/artists/:id', (request, response) => {

        const queryString = "UPDATE artists SET name = $1, photo_url=$2, nationality=$3 WHERE id=$4";

        const values = [request.body.name, request.body.photo_url, request.body.nationality, request.params.id];

        pool.query(queryString, values, (errorObj, result) => {
            if(errorObj) {
                console.log(errorObj.stack);
                response.send("query error test 5");
            } else {
                response.send("Artist has been edited!" + "<br><br><a href=/artists/>Home</a>");
            }
        })

  });


 /**
 * ===================================
 * Delete
 * ===================================
 */


app.get('/artists/:id/delete',(request, response) => {

    const queryString = "SELECT * FROM artists WHERE id=" + request.params.id;

    pool.query(queryString, (errorObj, result)=> {
        if(errorObj) {
            console.log(errorObj.stack);
            respons.send("query error test 6");
        } else {

            const data = { artist: result.rows };
            response.render("delete", data);
        }
    })

});


 app.delete('/artists/:id', (request, response) => {

    const queryString = "DELETE from artists WHERE id =" + request.params.id;

        pool.query(queryString, (errorObj, result) => {
            if(errorObj) {
                console.log(errorObj.stack);
                response.send("query error test 5");
            } else {
                response.send("Artist has been deleted!" +"<br><br><a href=/artists/>Home</a>");
            }
        })

});


/**
 * ===================================
 * View
 * ===================================
 */



app.get('/artists/:id', (request, response) => {
  // query database for all pokemon
console.log(request.params.id)
  const artistId = request.params.id;

  const queryString = "SELECT * FROM artists WHERE id=" + artistId;

  pool.query(queryString, (errorObj, result) => {
    if(errorObj) {
        console.log(errorObj.stack);
        response.send("query error test 6");
    } else {
        const data = { artist: result.rows }

        response.render( "show", data );
    }
  })

});







/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
const server = app.listen(3000, () => console.log('~~~ Tuning in to the waves of port 3000 ~~~'));

let onClose = function(){

  console.log("closing");

  server.close(() => {

    console.log('Process terminated');

    pool.end( () => console.log('Shut down db connection pool'));
  })
};

process.on('SIGTERM', onClose);
process.on('SIGINT', onClose);