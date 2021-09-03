const { pool } = require('./db');

pool;

const getAllSubjects = async (studentID) => {
  try {
    const [
      res,
    ] = await pool.query(`SELECT * FROM student_info WHERE student_id=?`, [
      studentID,
    ]);

    const [
      [subjects_ids],
    ] = await pool.query(
      `SELECT * FROM registered_courses WHERE course_id = ?`,
      [res[0].course_id]
    );

    const subJectArray = [];

    for (let [key, value] of Object.entries(subjects_ids)) {
      if (key != 'course_id') {
        const [
          [subject],
        ] = await pool.query(`SELECT * FROM available_courses WHERE id=?`, [
          value,
        ]);
        subJectArray.push(subject);
      }
    }
    return subJectArray;
  } catch (error) {
    console.log(error);
  }
};

const getExams = async (studentID) => {
  try {
    const [res] = await pool.query(`SELECT * from exams WHERE student_id=?`, [
      studentID,
    ]);
    // console.log(res);
    let marksArray = [];

    for (let i = 0; i < res.length; i++) {
      const [marks] = await pool.query(`SELECT * FROM marks WHERE marks_id=?`, [
        res[i].marks_id,
      ]);
      marks[0].exam_name = res[i].exam_name;
      marksArray.push(marks[0]);
    }

    return marksArray;
  } catch (error) {
    console.log(error);
  }
};

const addExams = async (marksId, studentID, examName) => {
  try {
    await pool.query(
      `
      INSERT INTO 
      exams
      (exam_name,marks_id,student_id)
      VALUES (?,?,?)
    `,
      [examName, marksId, studentID]
    );
  } catch (error) {}
};

module.exports = { getAllSubjects, getExams, addExams };
