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
const validator = require('validator');

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
 * /customer/{cust_country}:
 *     get:
 *       description: Return all agents
 *       produces:
 *           - application/json
 *       responses:
 *           200:
 *               description: Object containing agents contaitng array
 *       parameters:
 *           - name: cust_country
 *             description: customer object
 *             in: path
 *             require: true
 * 
 */


app.get('/customer/:cust_country', function (req,res){
        pool.getConnection()
    .then(conn => {

      conn.query("SELECT * FROM customer WHERE CUST_COUNTRY=?",[req.params.cust_country] )
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

app.get('/order', urlencodedParser,[

  check('custcountry').isAlpha()
  .withMessage('Country should be alphabets').isLength({max:20}).withMessage("Maximum of 20 numbers")],
  
  function (req,res){
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
 *   Company:
 *     properties:
 *       companyid:
 *         type: string
 *       companyname:
 *         type: string
 *       companycity:
 *         type: string
 */

/**
 * @swagger
 * /company:
 *    post:
 *      description: Create new Company Record
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Added data to company table
 *          500:
 *              description: Data already exists
 *      parameters:
 *          - name: Company
 *            description: company object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/Company'
 *
 *
 */
app.post("/company",urlencodedParser,[

  check('companyid').isNumeric()
  .withMessage('Company ID should be numbers').isLength({max:6}).withMessage("Maximum of 6 numbers"),
  check('companyname').trim().escape().custom(value => /^([a-zA-Z\s])*$/.test(value))
  .withMessage('Company Name should be Alphabets').isLength({max:25}).withMessage("Maximum of 25 characters"),
  check('companycity').trim().escape().custom(value => /^([a-zA-Z\s])*$/.test(value))
  .withMessage('City Name should be Alphabets').isLength({max:25}).withMessage("Maximum of 25 characters"),

],async(req, res) => {

  var errors= validationResult(req);

  if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() })

  }else{ 
  if(req.body==null || req.body.companyname==null || req.body.companycity==null
    || req.body.companyid==null){
     res.header("Content-Type", "application/json");
     res.status(400);
     res.send("INvalid Body ");
     return;
    }
  pool
    .getConnection()
    .then((conn) => {
      conn.query("SELECT * FROM commpany where COMPANY_ID=?",[req.body.companyid]).then((row)=>{
        if(row.length>0){
          res.header("Content-Type", "application/json");
          res.status(500).send({error:"Data is already present"});
          conn.close();
          return;
        }
        conn.query("INSERT INTO company VALUE (?,?,?)",
          [req.body.companyid, req.body.companyname, req.body.companycity])
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

//
//
// Delete Request
//
//
//

/**
 * @swagger
 * /company/{companyid}:
 *    delete:
 *      description: delete record from table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: deleted data from company table
 *          500:
 *              description: Data already exists
 *      parameters:
 *          - name: companyid
 *            description: company object
 *            in: path
 *            required: true
 *
 *
 */
app.delete('/company/:company_id',[
  check('company_id').isNumeric()
  .withMessage('Company ID should be numbers').isLength({max:6}).withMessage("Maximum of 6 numbers")  
],(req, res)=>{
 var errors= validationResult(req);
 
 if (!errors.isEmpty()) {
         return res.status(422).json({ errors: errors.array() })
       
 }else{
   console.log(req.params)
   if(req.params==null ){
     res.header("Content-Type", "application/json");
     res.status(400);
     res.send("Enter a valid data ");
   }
 pool.getConnection()
 .then(con =>{

     con.query("SELECT * FROM company where COMPANY_ID=?",[req.params.company_id]).then((row)=>{
         if(row.length==0){
           res.header("Content-Type", "application/json");
           res.status(500).send({error:"Data does not exist"});
           con.close();
           return;
         }
         con.query("DELETE from company WHERE COMPANY_ID='"+[req.params.company_id]+"'")
         .then(()=>{
             
             res.send("Successfully Deleted");
             con.end();
         })
     })
        .catch(err =>{
             // print the error
             console.log(err);
             // close the connection
             con.end();
         });
 }).catch(err=>{
         console.log(err);
 });
}
});

//
//
// Patch Request
//
//
//






 /**
 * @swagger
 * /company:
 *    patch:
 *      description: add record to company table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Patched data to company table
 *      parameters:
 *          - name: companyid
 *            description: company object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/company'
 *
 *
 */
app.patch('/company',[
  check('companyid').isNumeric()
  .withMessage('Company ID should be numbers').isLength({max:6}).withMessage("Maximum of 6 numbers"),
  check('companyname').trim().escape().custom(value => /^([a-zA-Z\s])*$/.test(value))
  .withMessage('Company Name should be Alphabets').isLength({max:25}).withMessage("Maximum of 25 characters"),
  check('companycity').trim().escape().custom(value => /^([a-zA-Z\s])*$/.test(value))
  .withMessage('City Name should be Alphabets').isLength({max:25}).withMessage("Maximum of 25 characters"),
  
] ,(req, res)=>{
  var errors= validationResult(req);
  
  if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() })
        
  }else{

  pool.getConnection()
  .then(con =>{
          
           con.query("SELECT * FROM company where COMPANY_ID=?",[req.body.companyid]).then((data)=>{
             console.log(data[0]);
             const arr=data[0];

             if(req.body.companyname!=null){
                 arr.COMPANY_NAME=req.body.companyname
              }
             if(req.body.companycity!=null){
              arr.COMPANY_CITY=req.body.companycity
              }
             
              if (data.length == 0){
                res.status(500).send({error:"No such company exist"});
                con.close();
                return;
              }
              con.query("UPDATE company SET COMPANY_NAME=?, COMPANY_CITY=? WHERE COMPANY_ID=?",
              [arr.COMPANY_NAME, arr.COMPANY_CITY, arr.COMPANY_ID])
                .then(()=>{
                 
                res.send("Successfully Updated");
                con.end();
              })
            
         })
         .catch(err =>{
              
              console.log(err);
              
              con.end();
          });
  }).catch(err=>{
          console.log(err);
  });
}
}); 


//
//
// Put request
//
//
//
//


  /**
 * @swagger
 * /company/put:
 *    put:
 *      description: add record to company table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description:  data put to company table
 *          500:
 *              description: Data already exists
 *      parameters:
 *          - name: company_id
 *            description: company object
 *            in: path
 *            required: true
 *            schema:
 *              $ref: '#/definitions/Company'
 *          - name: Company
 *            description: company object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/Company'
 *
 *
 */
app.put("/company",[

  check('companyid').isNumeric()
  .withMessage('Company ID should be numbers').isLength({max:6}).withMessage("Maximum of 6 numbers"),
  check('companyname').trim().escape().custom(value => /^([a-zA-Z\s])*$/.test(value))
  .withMessage('Company Name should be Alphabets').isLength({max:25}).withMessage("Maximum of 25 characters"),
  check('companycity').trim().escape().custom(value => /^([a-zA-Z\s])*$/.test(value))
  .withMessage('City Name should be Alphabets').isLength({max:25}).withMessage("Maximum of 25 characters"),

] ,(req, res) => {
  var errors= validationResult(req);
  
  if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() })
        
  }else{

  console.log(req.body);
  pool
    .getConnection()
    .then((conn) => {
      conn.query("SELECT * FROM company where COMPANY_ID=?",[req.body.companyid]).then((row)=>{
        if(row.length==0){
          res.header("Content-Type", "application/json");
          conn.query("INSERT INTO company VALUE (?,?,?)",
          [req.body.companyid,req.body.companyname,req.body.companycity])
            .then((data) => {
              res.header("Content-Type", "application/json");
              res.status(200);
              res.send(data);
              conn.close();
            })
           
          return;
        }
        conn.query("UPDATE company SET COMPANY_ID=?, COMPANY_NAME=?, COMPANY_CITY=? WHERE COMPANY_ID=?",
          [req.body.companyid, req.body.companyname,req.body.companycity])
            .then((data) => {
              res.header("Content-Type", "application/json");
              res.status(200);
              res.send(data);
              conn.close();
            })
            .catch((err) => {
              console.log(err);
              conn.end();
            });

      })
    .catch((err) => {
      console.log(err);
      conn.end();
    });
  });
}
});


app.listen(port, () => {
        console.log (`Listening to port ${port}!`)
});
