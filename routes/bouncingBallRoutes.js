const bodyParser = require("body-parser");
const express = require('express');
const router = express.Router();
const bounceCtrl = require('../controllers/bouncingBall.controller');
const fs = require("fs");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

/**
 * Calc bounces,co-ordinates and create data entry
 */
router.post("/calcBounce",
    async function (req, res) {
        try {

            const { height = 5, coefficient = 0.75, timeStep = 0.1 } = req.body;

            // calc bounces and x,y co-ordinates
            const { bounces, tCoOrdinate, hCoOrdinate } = await bounceCtrl.calcBounce({ height, coefficient, timeStep })

            // final data
            const data = { bounces, tCoOrdinate, hCoOrdinate }

            // make data entry in json file
            await bounceCtrl.createDataEntry({ bounces, hCoOrdinate, tCoOrdinate, height, coefficient, timeStep })

            res.status(200).json({ status: 'success', data })
        } catch (e) {
            const errObj = {
                message: e.message,
                stack: e.stackTrace
            }
            res.status(400).json({ status: 'fail', error: errObj })
        }
    });


/**
 * Get previous calculations
 */
router.get("/getCalc",
    async function (req, res) {
        try {
            // check data exists
            let data;
            if (fs.existsSync('data.json')) {
                data = await readFile('data.json')
                data = JSON.parse(data)
            } else {
                throw new Error('No data found');
            }

            res.status(200).json({ status: 'success', data })
        } catch (e) {
            const errObj = {
                message: e.message,
                stack: e.stackTrace
            }
            res.status(400).json({ status: 'fail', error: errObj })
        }
    });




module.exports = router;