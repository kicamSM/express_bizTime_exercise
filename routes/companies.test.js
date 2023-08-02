process.env.NODE_ENV = "test"

const request = require("supertest");

const app = require("../app");
const { createData } = require("../test-common");
const db = require("../db");

// helpful resources jest --watch 
// note these tests are consistently passing when running jest companies.test.js but failing when running jest as whole. There may be a race condition that is throwing something off. 

beforeEach(createData);

// beforeEach(async function() {
//     await db.query("DELETE FROM invoices");
//     await db.query("DELETE FROM companies");
//     await db.query("SELECT setval('invoices_id_seq', 1, false)");
//     // this is setting the value of the invoices Id to one
    
//     await db.query(`INSERT INTO companies (code, name, description) VALUES ('chey', 'Cheyenne Capidolls', 'A roller derby team'), ('roc', 'Bittersweet Bombshells', 'A Rock Springs Roller Derby Team')`);

//     db.query(`INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('chey', 100, true, '2023-06-10'), ('chey', 50, true, '2022-03-07'), ('roc', 70, false, '2022-01-01')`)

// });

afterAll(async () => {
    await db.end()
  })
  

describe('GET /companies', function () {
    test('gets all companies', async function() {
    const res = await request(app).get("/companies");
    expect(res.body).toEqual({
        "companies": [
            {code: "chey", name: "Cheyenne Capidolls"},
            {code: "roc", name: "Bittersweet Bombshells"}
        ]
    });
    })
});

describe('GET /companies/:code', function () {
    
    test('gets company with specific code', async function() {
    const res = await request(app).get("/companies/chey");
    expect(res.body).toEqual({
        "company": {
            code: "chey", 
            name: "Cheyenne Capidolls",
            description: "A roller derby team",
            invoices: [1, 2]
            },
        });
    })

    test('returns 404 with non-existent comapny code', async function(){
        const res = await request(app).get("/companies/lar");
        expect(res.body).toEqual({
            "message": "Can't find company with code of lar"
        });
        expect(res.status).toEqual(404)
    })
});

describe('POST /companies', function () {

    test('adds new company to companies', async function() {
        const res = await request(app).post("/companies").send({code: "buf", name: "Buffalo Derby Devils", description: "A roller derby team in Buffalo WY."});
        expect(res.body).toEqual({
            "company": {
                code: "buf",
                name: "Buffalo Derby Devils",
                description: "A roller derby team in Buffalo WY."
                },
            });
        })
})

describe('PUT /companies/:code', function () {

    test('changes description of already existing company', async function() {
        const res = await request(app).put("/companies/roc").send({name: "Bittersweet Bombshells", description: "A roller derby team in Rock Springs WY that kicks butt."});
        expect(res.body).toEqual({
            "company": {
                code: "roc",
                name: "Bittersweet Bombshells",
                description: "A roller derby team in Rock Springs WY that kicks butt."
                },
            });
        })
})

describe('DELETE companies/:code/', function () {

    test('deletes existing company', async function() {
        const res = await request(app).delete("/companies/roc");
        expect(res.body).toEqual({
            status: "deleted"
            });
        })

    test('returns 404 for non existent company', async function() {
        const res = await request(app).delete("/companies/madeUp");
        expect(res.body).toEqual({
            message: "No such company: madeUp"
            });
        })
})

