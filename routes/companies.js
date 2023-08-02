const express = require("express");
const slugify = require('slugify');
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");



router.get('/', async (req, res, next) => {
    try {
      const results = await db.query(`SELECT code, name FROM companies`); 
      return res.json({ companies: results.rows })
    } catch (e) {
      return next(e);
    }
  })


router.get('/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const result = await db.query(
        `SELECT code, name, description 
        FROM companies 
          WHERE code = $1`, [code]
          );

      const invRes = await db.query(
        `SELECT id
        FROM invoices WHERE comp_code = $1`, [code]
      );

      const indCompRes = await db.query(`SELECT industry_code FROM companies_industries WHERE company_code=$1`, [code])
      const indCode = indCompRes.rows[0].industry_code

      const indRes = await db.query( `SELECT industry FROM industries WHERE code=$1`, [indCode])

      if (result.rows.length === 0) {
        res.status(404).send({ message: `Can't find company with code of ${code}` })
      }
      const dataComp = result.rows[0];
      const invoices = invRes.rows
      const industries = indRes.rows
      dataComp.invoices = invoices.map(inv => inv.id)
      dataComp.industries = industries.map(ind => ind.industry)
 
    return res.send({ company: dataComp })

    } catch (e) {
      return next(e)
    }
  })

router.post('/', async (req, res, next) => {
    try {
      const {name, description } = req.body;
      const code = slugify(name, { lower: true, remove: /[-\s]/ });
      const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
      return res.status(201).json({ company: results.rows[0] })
    } catch (e) {
      return next(e)
    }
  })


router.put('/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const { name, description } = req.body;
      const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING name, description, code', [name, description, code])
      if (results.rows.length === 0) {
        // throw new ExpressError(`Can't update company with code of ${code}`, 404)
        res.status(404).send({ message: `Can't update company with code of ${code}`
      })}
      return res.send({ company: results.rows[0] })
    } catch (e) {
      return next(e)
    }
  })

router.delete('/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const result = await db.query('DELETE FROM companies WHERE code=$1 returning code', [code])
      if (result.rows.length == 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
    } else {
        return res.json({ status: "deleted" })
      }
    } catch (e) {
      return next(e)
    }
  })
  

  module.exports = router; 
