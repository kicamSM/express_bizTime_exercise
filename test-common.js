/** code common to tests. */

const db = require("./db");

async function createData() {
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");
    await db.query("SELECT setval('invoices_id_seq', 1, false)");
    // this is setting the value of the invoices Id to one
    
    await db.query(`INSERT INTO companies (code, name, description) VALUES ('chey', 'Cheyenne Capidolls', 'A roller derby team'), ('roc', 'Bittersweet Bombshells', 'A Rock Springs Roller Derby Team')`);

    db.query(`INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('chey', 100, true, '2023-06-10'), ('chey', 50, true, '2022-03-07'), ('roc', 70, false, '2022-01-01')`)

};


// so still with this running each file individually is giving me they all pass but running jest at the same time is causing them to not pass. Ask Kate tomorrow.

module.exports = { createData };
