const express = require('express');
const cors = require('cors');
const md5 = require('md5');
const { getAllSubjects, getExams, addExams } = require('./getSubjects');
const { pool } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [respose] = await pool.query(
      'SELECT * FROM admin WHERE username = ?',
      [username]
    );
    if (respose.length == 0) {
      return res.status(400).send({ msg: 'Username not found' });
    }
    if (respose[0].user_password == md5(password)) {
      return res.status(200).send({ authenticated: true });
    } else {
      return res
        .status(400)
        .send({ authenticated: false, msg: 'Invalid password' });
    }
  } catch (error) {
    return res.status(500).send({ msg: 'Internal Server error' });
  }
});

app.get('/search/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const nameArr = name.split(' ');

    const [response] =
      nameArr.length == 1
        ? await pool.query(`
      SELECT * FROM student_info WHERE fname LIKE '%${nameArr[0]}%' 
    `)
        : await pool.query(`
    SELECT * FROM student_info WHERE fname LIKE '%${nameArr[0]}%'  AND lname LIKE '%${nameArr[1]}%'
    `);
    res.send(response);
  } catch (e) {
    console.log(e);
  }
});

app.get('/get-all-students/', async (req, res) => {
  try {
    const [response] = await pool.query(
      'SELECT student_id, fname, lname, gender, phone, email FROM student_info'
    );
    res.send(response);
  } catch (error) {
    console.log(error);
  }
});

app.get('/get-student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const [details] = await pool.query(
      'SELECT * FROM student_info WHERE student_id = ?',
      [studentId]
    );

    let courses = [];
    let marks = [];
    if (details[0].course_id) {
      courses = await getAllSubjects(studentId);
      marks = await getExams(studentId);
    }

    res.send({
      details: details[0],
      courses,
      marks,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post('/create-student', async (req, res) => {
  try {
    const { fname, lname, email, phone, gender, dob, doj, fees, paid } =
      req.body;
    const [response] = await pool.query(
      `INSERT INTO 
       student_info (fname,lname,email,phone,gender,dob,doj,fees,paid)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [fname, lname, email, phone, gender, dob, doj, fees, paid]
    );
    return res.send({ id: response.insertId });
  } catch (error) {
    console.log(error);
    if (error.errno == 1062) {
      return res.status(400).send({ msg: 'Email already exists' });
    }
    return res.status(500).send({ msg: 'Internal Server Error' });
  }
});

app.get('/get-available-courses', async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT * FROM available_courses');
    res.send({
      courses,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post('/register-courses', async (req, res) => {
  const { s1, s2, s3, s4, s5, s6, studentId } = req.body;
  try {
    const [response] = await pool.query(
      `INSERT INTO
       registered_courses 
       (subject_1,subject_2,subject_3,subject_4,subject_5,subject_6)
       VALUES(?,?,?,?,?,?)`,
      [s1, s2, s3, s4, s5, s6]
    );

    await pool.query(`
      UPDATE student_info
      SET course_id = ${response.insertId}
      WHERE student_id = ${studentId}
    `);

    res.send({
      done: true,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post('/add-marks', async (req, res) => {
  const { s1, s2, s3, s4, s5, s6, studentId, examName } = req.body;
  try {
    const [response] = await pool.query(
      `
      INSERT INTO
      marks
      (subject_1,subject_2,subject_3,subject_4,subject_5,subject_6)
      VALUES(?,?,?,?,?,?)
      `,
      [s1, s2, s3, s4, s5, s6]
    );
    await addExams(response.insertId, studentId, examName);
    res.send({ done: true });
  } catch (error) {
    res.status(500).send({ mdg: 'Internal Server Error' });
  }
});

app.post('/update-student-details', async (req, res) => {
  try {
    const { fname, lname, phone, fees, paid, marks, student_id, email } =
      req.body;
    if (!student_id) {
      return;
    }
    await pool.query(
      `
      UPDATE student_info
      SET
      fname = ?,
      lname = ?,
      email = ?,
      phone = ?,
      fees = ?,
      paid = ?
      WHERE student_id = ?
    `,
      [fname, lname, email, phone, fees, paid, student_id]
    );

    marks.forEach(async (data) => {
      const {
        marks_id,
        subject_1,
        subject_2,
        subject_3,
        subject_4,
        subject_5,
        subject_6,
      } = data;
      await pool.query(
        `
          UPDATE marks
          SET
          subject_1 = ?,
          subject_2 = ?,
          subject_3 = ?,
          subject_4 = ?,
          subject_5 = ?,
          subject_6 = ?

          WHERE marks_id = ?
        `,
        [
          subject_1,
          subject_2,
          subject_3,
          subject_4,
          subject_5,
          subject_6,
          marks_id,
        ]
      );
    });
    res.send({ done: true });
  } catch (error) {
    console.log(error);
  }
});

app.post('/delete-student', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM student_info WHERE student_id = ?',
      req.body.student_id
    );
    res.send({ done: true });
  } catch (error) {
    console.log(error);
  }
});

app.listen(3001, () => {
  console.log('Server running on PORT 3001');
});
