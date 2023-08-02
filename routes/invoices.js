
const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");


router.get('/', async (req, res, next) => {
    try {
      const results = await db.query(`SELECT id, comp_code FROM invoices ORDER BY id`); 
      return res.json({ invoices: results.rows })
    } catch (e) {
      return next(e);
    }
  })


router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(
        `SELECT i.id, 
                i.comp_code, 
                i.amt, 
                i.paid, 
                i.add_date, 
                i.paid_date, 
                c.name, 
                c.description 
         FROM invoices AS i
           INNER JOIN companies AS c ON (i.comp_code = c.code)  
         WHERE id = $1`,
      [id]);

      if (result.rows.length === 0) {
        res.status(404).send({ message: `Can't find invoice with id of ${id}` })
      }

    const data = result.rows[0];
    const invoice = {
            id: data.id,
            company: {
              code: data.comp_code,
              name: data.name,
              description: data.description,
            },
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
          };
      
      return res.send({ "invoice": invoice })
    } catch (e) {
      return next(e)
    }
  })

router.post('/', async (req, res, next) => {
    try {
      let { comp_code, amt } = req.body;
      const result = await db.query(
        'INSERT INTO invoices (comp_code, amt)   VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);

      return res.status(201).json({ "invoice": result.rows[0] })
    } catch (e) {
      return next(e)
    }
  })


router.put('/:id', async (req, res, next) => {
    try {
      let { id } = req.params;
      console.log("id:", id)
      let { amt, paid } = req.body; 
      let paid_date = null

      const currResult = await db.query(`SELECT paid_date from invoices WHERE id = $1`, [id])

      if (currResult.rows.length === 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
      }

      if(paid === true && currResult.rows[0].paid_date === null) {
        paid_date = new Date();
      } else if(paid === false) {
        paid_date = null;
      } else {
        paid_date = currResult.rows[0].paid_date
      }

      const result = await db.query('UPDATE invoices SET amt=$2, paid=$3, paid_date=$4 WHERE id=$1 RETURNING id, comp_code, amt, paid, add_date, paid_date', [id, amt, paid, paid_date])
 
      return res.send({ invoice: result.rows[0] })
    } catch (e) {
      return next(e)
    }
  })

router.delete('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const answer = await db.query('SELECT * FROM invoices WHERE id=$1', [id])
      console.log("answer", answer)
      const result = await db.query('DELETE FROM invoices WHERE id = $1', [id])
      console.log("result.rows.length", result.rows.length)
      if (answer.rows.length === 0) {
        res.status(404).send({ message: `Can't find invoice with id of ${id}`
      })}
      return res.send({ status: "deleted" })
    } catch (e) {
      return next(e)
    }
  })
  

  module.exports = router; 