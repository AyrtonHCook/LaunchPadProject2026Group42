const express = require("express");
const router = express.Router();

const pool = require("../db");
async function getTemp(){
    const apiKey = "b05ea907e4a44f379d9132412260506 "; // insert key here
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Birmingham&aqi=no`;
    try{
        res = await fetch(url);
        if(!res.ok){
            return -999;
        }
        const data = await  res.json();
        const temp = data.current.temp_c;
        return temp;
    }
    catch(error){
        console.error(error);
        return -999;
    }
}


router.get('/userDash', async(req, res) => {
    try{
        const temp = await getTemp();
        console.log(temp)
        const results = await pool.query(
            `SELECT * FROM trucks`
        )

        if(temp == -1){
            return res.json({
                success: false,
                message: "failed",
                body:{
                    currentTemp: -1,
                    trucks: results.rows
                }
            })
        }
        res.json({
            success: true,
            message: "success",
            body: {
                currentTemp: temp,
                trucks: results.rows
            }
        })
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "server error",
            body: {
                currentTemp: -1,
                trucks: []
            }
        });
    }
})

module.exports = router;