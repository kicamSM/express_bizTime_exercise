const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
    const indRes = await db.query(`SELECT industry, code FROM industries`);
    let assocCodes = []
    for(const industry of indRes.rows) {
    let compCode = await db.query(`SELECT company_code FROM companies_industries WHERE industry_code=$1`, [industry.code]);
    assocCodes.push({
    industry: industry.industry,
    companyCodes: compCode.rows
    });
    }
    return res.json({ industries: assocCodes });
    } catch (e) {
    return next(e);
    }
    });

router.post('/', async (req, res, next) => {
    try {
        const {code, industry } = req.body;
        const results = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry', [code, industry]);
        return res.status(201).json({ company: results.rows[0] })
    } catch (e) {
        return next(e)
    }
    })

router.post('/:industry_code', async (req, res, next) => {
    try {
        const { industry_code } = req.params
        const {company_code } = req.body;
        const results = await db.query('INSERT INTO companies_industries (industry_code, company_code) VALUES ($1, $2) RETURNING industry_code, company_code', [industry_code, company_code]);
        return res.status(201).json({ company: results.rows[0] })
    } catch (e) {
        return next(e)
    }
    })


module.exports = router; 