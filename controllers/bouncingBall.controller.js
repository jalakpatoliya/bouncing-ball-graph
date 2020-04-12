const fs = require("fs");
const { promisify } = require("util");

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const calcBounce = async ({ height = 5, coefficient = 0.75, timeStep = 0.1 }) => {

    let h0 = height         // initial height m 
    let v = 0          // m / s, current velocity
    let g = 10         // m / s / s
    let t = 0          // starting time
    // let dt = 0.001     // time step
    let dt = timeStep     // time step
    let rho = coefficient     // coefficient of restitution
    let tau = 0.10     // contact time for bounce
    let hmax = h0      // keep track of the maximum height
    let h = h0
    let hstop = 0.01   //# stop when bounce is less than 1 cm
    let freefall = true //# state: freefall or in contact
    let t_last = -Math.sqrt(2 * h0 / g) //# time we would have launched to get to h0 at t = 0
    let vmax = Math.sqrt(2 * hmax * g)
    let H = []
    let T = []
    let coordinates = [];
    let bounces = 0;

    while (hmax > hstop) {
        if (freefall) {
            hnew = h + v * dt - 0.5 * g * dt * dt
            if (hnew < 0) {
                t = t_last + 2 * Math.sqrt(2 * hmax / g)
                freefall = false
                t_last = t + tau
                h = 0
                //testing
                bounces++
            }
            else {
                t = t + dt
                v = v - g * dt
                h = hnew
            }
        }
        else {
            t = t + tau
            vmax = vmax * rho
            v = vmax
            freefall = true
            h = 0
        }
        hmax = 0.5 * vmax * vmax / g
        H.push(h)
        T.push(t)

        coordinates.push([h, t])
    }

    return { bounces, hCoOrdinate: H, tCoOrdinate: T };
}

exports.calcBounce = calcBounce;


const createDataEntry = async ({ bounces, tCoOrdinate, hCoOrdinate, height, coefficient }) => {
    /**
     * Creating time stamp
     */
    let timeStamp = new Date();
    timeStamp = timeStamp.toISOString()

    // Create data obj
    const dataObj = {
        timeStamp,
        height,
        coefficient,
        bounces,
        hCoOrdinate,
        tCoOrdinate
    }

    /**
     * Create or update json file
     */
    // check if file exists
    let data;
    if (!fs.existsSync('data.json')) {
        data = { table: [] }
    } else {
        data = await readFile('data.json')
        data = JSON.parse(data)
    }

    // push dataObj to data
    data.table.push(dataObj);

    // convert data to json format
    const dataJson = JSON.stringify(data)

    // save or create data in json file
    await writeFile("data.json", dataJson);

    return data;
}

exports.createDataEntry = createDataEntry;