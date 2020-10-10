const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//requiring swagger details
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const {check, body, validationResult } = require('express-validator');

const options = {
  swaggerDefinition: {
    info: {
      title:'Rest + Swagger Assignment',
      version: '1.0.0',
      description: 'API generating functions '
    },
    host: '159.89.54.43:3000',
    basePath: '/',
  },
  apis: ['./server.js'],
};


const specs = swaggerJsdoc(options);

//configuring endpoint ofor swagger

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors());


// requiring database details
const mariadb = require('mariadb');
const pool = mariadb.createPool({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'sample',
	port: 3306,
	connectionlimit: 5
});

/**
 * @swagger
 * /agents:
 *     get:
 *       description: Return all agents
 *       produces:
 *           - application/json
 *       responses:
 *           200:
 *               description: Object containing agents contaitng array
 * 
 */

app.get('/agents', function (req,res){
	pool.getConnection()
    .then(conn => {
    
      conn.query("SELECT * FROM agents")
        .then((rows) => {
          console.log(rows);
           res.json(rows);
        })
        .then((res) => {
          console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
          conn.end();
        })
        .catch(err => {
          //handle error
          console.log(err); 
          conn.end();
        })
        
    }).catch(err => {
      //not connected
})
});		

app.post('/agents', function(req,res){



});








/**
 * @swagger
 * /customer:
 *     get:
 *       description: Return all agents
 *       produces:
 *           - application/json
 *       responses:
 *           200:
 *               description: Object containing agents contaitng array
 * 
 */


app.get('/customer', function (req,res){
        pool.getConnection()
    .then(conn => {

      conn.query("SELECT * FROM customer WHERE CUST_COUNTRY='INDIA' ")
        .then((rows) => {
          console.log(rows);
           res.json(rows);
	  console.log("Displaying Records from the database filtered by country India")
	  
        })
        .then((res) => {
          console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
          conn.end();
        })
        .catch(err => {
          //handle error
          console.log(err);
          conn.end();
        })

    }).catch(err => {
      //not connected
})
});


/**
 * @swagger
 * /customer:
 *     delete:
 *       description: Return all agents
 *       produces:
 *           - application/json
 *       responses:
 *           200:
 *               description: Object containing agents contaitng array
 * 
 */


app.delete('/customer/', function (req,res){
  pool.getConnection()
.then(conn => {

conn.query("SELECT * FROM customer WHERE CUST_NAME ='req.body.name' ")
  .then((rows) => {
    console.log(rows);
     res.json(rows);
console.log("Displaying Records from the database filtered by country India")

  })
  .then((res) => {
    console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
    conn.end();
  })
  .catch(err => {
    //handle error
    console.log(err);
    conn.end();
  })

}).catch(err => {
//not connected
})
});
/**
 * @swagger
 * /order:
 *     get:
 *       description: Return all agents
 *       produces:
 *           - application/json
 *       responses:
 *           200:
 *               description: Object containing agents contaitng array
 * 
 */

app.get('/order', function (req,res){
        pool.getConnection()
    .then(conn => {

      conn.query("SELECT * FROM orders")
        .then((rows) => {
          console.log(rows);
           res.json(rows);
        })
        .then((res) => {
          console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
          conn.end();
        })
        .catch(err => {
          //handle error
          console.log(err);
          conn.end();
        })

    }).catch(err => {
      //not connected
})
});


//post request root foods 

/**
 * @swagger
 * definitions:
 *   Foods:
 *     properties:
 *       itemid:
 *         type: string
 *       itemname:
 *         type: string
 *       itemunit:
 *         type: string
 *       companyid:
 *         type: string
 */
/**
 * @swagger
 * /foods:
 *    post:
 *      description: add record to Foods table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Added data to Foods table
 *          500:
 *              description: Data already exists
 *      parameters:
 *          - name: Foods
 *            description: company object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/Foods'
 *
 *
 */
app.post("/foods",urlencodedParser,[

  check('item_id').isNumeric()
  .withMessage('id be a number').isLength({max:6}).withMessage("Max 5 numbers allowed"),
  check('item_name').isAlpha().trim().escape()
  .withMessage('Name should have Alphabets').isLength({max:25}).withMessage("Max 20 characters"),
  check('item_unit').isAlpha().trim().escape()
  .withMessage('Should be Alphabets').isLength({max:5}).withMessage("Max 5 characters"),
  check('company_id').isAlpha().trim().escape()
  .withMessage('Company ID should be only Alphabets').isLength({max:5}).withMessage("Compay ID should be max 5 ch")

],async(req, res) => {

  var errors= validationResult(req);

  if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() })

  }else{ 
  if(req.body==null || req.body.itemname==null || req.body.itemunit==null
    || req.body.companyid==null){
     res.header("Content-Type", "application/json");
     res.status(400);
     res.send("Body is Invalid");
     return;
    }
  pool
    .getConnection()
    .then((conn) => {
      conn.query("SELECT * FROM foods where ITEM_ID=?",[req.body.itemid]).then((row)=>{
        if(row.length>0){
          res.header("Content-Type", "application/json");
          res.status(500).send({error:"Data is already present"});
          conn.close();
          return;
        }
        conn.query("INSERT INTO foods VALUE (?,?,?,?)",
          [req.body.itemid,req.body.itemname, req.body.itemunit,req.body.companyid])
            .then((data) => {
              res.header("Content-Type", "application/json");
              res.status(200);
              res.send(data);
              conn.close();
            })
      })
    }).catch((err) => {
      console.log(err);
      conn.close();
    });
  }
});

 
app.listen(port, () => {
        console.log (`Listening to port ${port}!`)
});


