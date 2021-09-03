CREATE TABLE admin(
     username VARCHAR(200) PRIMARY KEY,
     user_password VARCHAR(200)
);

CREATE TABLE student_info(
    student_id int not null auto_increment PRIMARY KEY,
    fname char(30),
    lname char(30),
    email varchar(30) UNIQUE,
    phone varchar(11),
    gender char(1),
    dob date,
    doj date,
    fees int,
    paid int,
    course_id int REFERENCES registered_courses(course_id)
);

CREATE TABLE registered_courses(
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_1 INT REFERENCES available_course(id),
    subject_2 INT REFERENCES available_course(id),
    subject_3 INT REFERENCES available_course(id),
    subject_4 INT REFERENCES available_course(id),
    subject_5 INT REFERENCES available_course(id),
    subject_6 INT REFERENCES available_course(id)
);

CREATE TABLE marks(
    marks_id int AUTO_INCREMENT PRIMARY KEY,
    subject_1 INT,
    subject_2 INT,
    subject_3 INT,
    subject_4 INT,
    subject_5 INT,
    subject_6 INT
);

CREATE TABLE exams(
    exam_id int AUTO_INCREMENT PRIMARY KEY,
    exam_name varchar(30),
    marks_id int REFERENCES marks(marks_id),
    student_id int REFERENCES student_info(student_id )
);

CREATE TABLE available_courses(
    id int AUTO_INCREMENT PRIMARY KEY,
    course_name varchar(30),
    teacher varchar(30)
);
