const express = require('express');
const knex = require('knex');
// knex takes an object as an argument, that's why you need to call
// the `development` object from knexfile export
const knexConfig = require('../knexfile').development;

const db = knex(knexConfig);
const routes = express.Router();

routes.use(express.json());

// [GET] all students - returns an ARRAY of objects with all students
routes.get('/', async (req, res) => {
  try {
    const students = await db('students');
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error });
  }
});

// [GET] student by ID - returns an object with student data
routes.get('/:id', async (req, res) => {
  const studentId = req.params.id;
  try {
    const oneStudent = 
      await db
        .select('students.id', 'students.name', 'cohorts.name as cohort_name')
        .from('students')
        .where('students.id', studentId)
        .innerJoin('cohorts', 'cohorts.id', '=', 'students.cohort_id')
        .first();

    if (oneStudent) {
      res.status(200).json(oneStudent);
    } else {
      res.status(404).json({ message: `Student with ID ${studentId} does not exist.`});
    }

  } catch (error) {
    res.status(500).json({ error });
  }
});


// [POST] create new student - returns an ARRAY with ID of new student
routes.post('/', async (req, res) => {
  const studentName = req.body.name;
  if (studentName) {
    try {
      const newStudent = await db('students').insert({ name: studentName });
      res.status(200).json(newStudent);
    } catch (error) {
      res.status(500).json({ error });
    }
  } else {
    res.status(400).json({ message: `Please include name in request body.` })
  }
});

// [DELETE] student by ID - returns number of deleted rows
routes.delete('/:id', async (req, res) => {
  const studentId = req.params.id;
  try {
    const deletedStudent = await db('students').where('id', studentId).del();

    if (deletedStudent > 0) {
      res.status(200).json({ message: `Student with ID ${studentId} was deleted.` });
    } else {
      res.status(404).json({ message: `Student with ID ${studentId} does not exist.`});
    }

  } catch (error) {
    res.status(500).json({ error });
  }
});

// [PUT] create new student - returns updated student OBJECT
routes.put('/:id', async (req, res) => {
  const studentBody = req.body;
  const studentId = req.params.id;

  if (studentBody) {
    try {
      const updatedStudent = await db('students').where('id', studentId).update(studentBody);
      if (updatedStudent > 0) {
        const oneStudent = await db('students').where('id', studentId).first();
        res.status(200).json(oneStudent);
      } else {
        res.status(404).json({ message: `Student with ID ${studentId} does not exist.`});
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  } else {
    res.status(400).json({ message: `Please include name in request body.` })
  }
});


module.exports = routes;