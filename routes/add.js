const express = require('express');
const router = express.Router();
const axios = require('axios')
const crypto = require('crypto')

// const dotenv = require('dotenv').config()

/* GET users listing. */
router.post('/', async function(req, res, next) {
  if (!req.body) return

  const referenceId = randomValueHex(10, req.body.email)

  console.info(`${process.env.DB_HOST}/quotes/${referenceId}.json`)

  // check if exists in fb
  try {
    const { data } = await axios({
      method: 'post',
      // url: `${process.env.DB_HOST}/quotes/${referenceId}.json`,
      url: `${process.env.DB_HOST}/quotes/${referenceId}.json`,
      data: {
        firstName: 'Fred',
        lastName: 'Flintstone'
      }
    });

    res.json({ message: 'respond with a resource' });
  } catch (e) {
    res.status(400).json(e)
  }
});


/**
 * 
 * @param {Number} len the length of the randomValue to generate
 */
function randomValueHex(len) {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString('hex') // convert to hexadecimal format
    .slice(0, len) // return required number of characters
}

module.exports = router;
