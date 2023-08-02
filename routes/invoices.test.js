process.env.NODE_ENV = "test"

const request = require("supertest");

const app = require("../app");
const { createData } = require("../test-common");
const db = require("../db");

// helpful resources jest --watch 
// note these tests are consistently passing when running jest invoices.test.js but failing when running jest as whole. There may be a race condition that is throwing something off. It appears the tests are running asyncronously when running them together with jest. 

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
  

describe('GET /invoices', function () {
    test('gets all invoices', async function() {
    const res = await request(app).get("/invoices");
    expect(res.body).toEqual({
        "invoices": [
            {id: 1, comp_code: "chey"},
            {id: 2, comp_code: "chey"},
            {id: 3, comp_code: "roc"}
        ]
    });
    })
});

describe('GET /invoices/:id', function () {
    
    test('gets invoice with specific id', async function() {
    const res = await request(app).get("/invoices/1");
    expect(res.body).toEqual({
        "invoice": {
            id: 1,
            company: {
            code: "chey", 
            name: "Cheyenne Capidolls",
            description: "A roller derby team" },
            amt: 100,
            paid: true,
            add_date: expect.any(String),
            paid_date: "2023-06-10T06:00:00.000Z"
            },
        });
    })

    test('returns 404 with non-existent invoice code', async function(){
        const res = await request(app).get("/invoices/0");
        expect(res.body).toEqual({
            "message": "Can't find invoice with id of 0"
        });
        expect(res.status).toEqual(404)
    })
});

describe('POST /invoices', function () {

    test('adds new invoice to invoices', async function() {
        const res = await request(app).post("/invoices").send({comp_code: "chey", amt: 500});
        expect(res.body).toEqual({
            "invoice": {
                id: 4, 
                comp_code: "chey",
                amt: 500,
                paid: false,
                add_date: expect.any(String),
                paid_date: null
                },
            });
        })
})

describe('PUT /invoices/:id', function () {

    test('changes description of already existing invoice', async function() {
        const res = await request(app).put("/invoices/3").send({amt: 5000});
        expect(res.body).toEqual({
            "invoice": {
                id: 3,
                comp_code: "roc",
                amt: 5000,
                paid: false,
                add_date: "2023-08-01T06:00:00.000Z",
                paid_date: expect.any(String)
            },
        });
    })
})

describe('DELETE invoices/:id/', function () {

    test('deletes existing invoice', async function() {
        const res = await request(app).delete("/invoices/1");
        expect(res.body).toEqual({
            status: "deleted"
            });
        })

    test('returns 404 for non existent invoice', async function() {
        const res = await request(app).delete("/invoices/0");
        expect(res.body).toEqual({
            message: "Can't find invoice with id of 0"
            });
        })
})

