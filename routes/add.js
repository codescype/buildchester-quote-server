const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");

const admin = require("../init");
const db = admin.firestore().collection("quotes");

// const dotenv = require('dotenv').config()

/* GET users listing. */
router.post("/", async function(req, res, next) {
  if (!req.body) return res.json({
    error: {
      status: 400,
      message: "NO DATA SUPPLIED"
    }
  });;

  if (await checkForExistingEmail(req.body.email)) {
    return res.json({
      error: {
        status: 400,
        message: "EMAIL EXISTS"
      }
    });
  }

  let referenceId = randomValueHex(10, req.body.email);

  while (await checkForExistingDocument(referenceId)) {
    referenceId = randomValueHex(10, req.body.email);

    if (!checkForExistingDocument(referenceId)) {
      break;
    }
  }

  console.info(`${process.env.DB_HOST}/quotes/${referenceId}.json`);

  try {
    // const { data } = await axios({
    //   method: "post",
    //   // url: `${process.env.DB_HOST}/quotes/${referenceId}.json`,
    //   url: `${process.env.DB_HOST}/quotes/${referenceId}.json`,
    //   data: {
    //     firstName: "Fred",
    //     lastName: "Flintstone"
    //   }
    // });

    const document = await db.doc(referenceId).set(req.body);
    console.dir(document);
    res.json({ status: 'success', referenceId });
  } catch (error) {
    res.json({
      error
    });;
  }
});

/**
 *
 * @param {Number} len the length of the randomValue to generate
 */
function randomValueHex(len) {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex") // convert to hexadecimal format
    .slice(0, len); // return required number of characters
}

/**
 *
 * @param {String} email
 * @returns {Promise<Boolean>}
 */
async function checkForExistingEmail(email) {
  try {
    const snapshot = await db.where("email", "==", email).get();
    return !snapshot.empty;
  } catch (e) {
    return false;
  }
}

/**
 *
 * @param {String} id
 * @returns {Promise<Boolean>}
 */
async function checkForExistingDocument(id) {
  try {
    const doc = await db.doc(id).get();
    return doc.exists;
  } catch (e) {
    return false;
  }
}

module.exports = router;
