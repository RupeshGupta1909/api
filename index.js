const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs/dist/bcrypt');

const app = express();
const port = 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection setup
const connection = mysql.createConnection({
      host: 'localhost',  user: 'root',  password: 'Rg7052950426',  database: 'sm' 
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});
app.get('/get/mob_email' , async(req, res)=>{
    try {
        const device_serial= req.body.device_serial;
        const query = `SELECT Mobile_Number, Email_Id FROM (SELECT Mobile_Number, Email_Id, 'Adult' AS User_Type FROM ADULT_CREDENTIAL WHERE Device_Serial_Number = ?  UNION ALL SELECT Mobile_Number, Email_Id, 'Kid' AS User_Type FROM KID_CREDENTIAL  WHERE Device_Serial_Number = ? ) AS CombinedResults`
        connection.query(query,[device_serial, device_serial],(error,results)=>{
            if (error) {
                console.error('Error!', error);
                res.status(500).send('Something went wrong!');
              } else {
                res.json(results);
              }
        })
    } catch (error) {
        console.log(error);
        res.status(500).send('Something went wrong!');
    }
})

app.post('/post/register', async (req,res)=>{
    try {
        const srl_no=req.body.srl_no;
        const name= req.body.name;
        const mobile= req.body.mobile;
        const email= req.body.email;
        const aadhar= req.body.aadhar;
        const password= req.body.password;

        const hash = await bcrypt.hash(password,8);
        const query='INSERT INTO ADULT_CREDENTIAL (Device_Serial_Number, User_Name, Mobile_Number, Email_Id, Aadhar_ID, Password)VALUES (?,?,?,?,?,?)'
        connection.query(query, [srl_no, name, mobile, email, aadhar, hash], (error, results) => {
            if (error) {
              console.error('Error inserting data into the database:', error);
              res.status(500).send('Something went wrong!');
            } else {
              console.log('User registered successfully');
              res.send('User registered successfully');
            }
          });
    } catch (error) {
        console.log(error);
        res.status(505).send("somting wrong!!")
    }
  })

app.post('/post/login', async (req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const query = 'Select * from ADULT_CREDENTIAL where Email_Id= ?';
        connection.query(query,[email], async (error , results)=>{
            if(error){
                console.error('Error in retrieving',error);
                res.status(500).send('Someting went Wrong!');
            }
            else{
                if (results.length > 0) {
                    const user = results[0];
                    const validPassword = await bcrypt.compare(password, user.Password);
                    if (validPassword) {
                      res.status(200).json('Valid Email and Password');
                    } else {
                      res.status(400).json('Wrong Password!');
                    }
                  } else {
                    res.status(404).json('User not found');
                  }
                }
              });
            } catch (error) {
              console.log(error);
              res.status(500).send('Something went wrong!');
            }
          });

// Define a route to fetch all users
app.get('/get/device', (req, res) => {
       const query = "SELECT * FROM KID_CREDENTIAL";
 console.log("running");
    connection.query(query, (error, results) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).json({ error: 'Error fetching users' });
      } else {
        res.json(results);
      }
    });
  });

  app.get('/get/d', (req, res) => {
    const query = "SELECT * FROM KID_CREDENTIAL";
console.log("running");
 connection.query(query, (error, results) => {
   if (error) {
     console.error('Error executing MySQL query:', error);
     res.status(500).json({ error: 'Error fetching users' });
   } else {
     res.json(results);
   }
 });
});


// Start the server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });
const server = app.listen(0, () => {
    const port = server.address().port;
    console.log(`Server is running on port ${port}`);
  });




