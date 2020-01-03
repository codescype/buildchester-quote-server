const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Mailgun = require("mailgun-js");
const mailgun = new Mailgun({
  apiKey: process.env.MG_API_KEY,
  domain: process.env.MG_DOMAIN
});

const admin = require("../init");
const db = admin.firestore().collection("quotes");

// const dotenv = require('dotenv').config()

/* GET users listing. */
router.post("/", async function(req, res, next) {
  if (!req.body)
    return res.json({
      error: {
        status: 400,
        message: "NO DATA SUPPLIED"
      }
    });

  try {
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

    const document = await db.doc(referenceId).set(req.body);
    res.json({ status: "success", referenceId });

    sendEmails({ ...req.body, referenceId });
  } catch (e) {
    console.error(e);

    return res.json({
      error: {
        status: 400,
        message: "AN ERROR OCCURRED"
      }
    });
  }
});

/**
 *
 * @param {Number} len the length of the randomValue to generate
 */
function randomValueHex(len) {
  // randomBytes();
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

function sendEmails(data) {
  sendEmailToAdmin(data);
  sendEmailToUser(data);
}

function sendEmailToAdmin(data) {
  const mailData = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_ADMIN,
    cc: process.env.EMAIL_ADMIN_CC,
    //Subject and text data
    subject: "New Quote Request",
    html: `Fullname: ${data.fullName} <br>
      Phone Number: ${data.phoneNumber} <br>
      Email: ${data.email} <br>
      Age: ${data.age} <br>
      Date of birth: ${formatDate(data.dateOfBirth)} <br>
      Occupation: ${data.occupation} <br>
      Address: ${data.address} <br>
      Date Created: ${formatDate(data.dateCreated)} <br><br>
      <strong>Reference ID: ${data.referenceId}</strong>`
  };

  //Invokes the method to send emails given the above data with the helper library
  mailgun.messages().send(mailData, function(err, body) {
    //If there is an error, render the error page
    if (err) {
      // res.render('error', { error : err});
      console.error("got an error: ", err);
    }
    //Else we can greet    and leave
    else {
      //Here "submitted.jade" is the view file for this landing page
      //We pass the variable "email" from the url parameter in an object rendered by Jade
      // res.render('submitted', { email : req.params.mail });
      // console.info(body);
      console.info(`Mail sent to admin for ${data.referenceId} successfully`);
    }
  });
}

function sendEmailToUser(data) {
  const mailData = {
    from: process.env.EMAIL_FROM,
    // to: process.env.EMAIL_ADMIN,
    to: data.email,
    // cc: process.env.EMAIL_ADMIN_CC,
    //Subject and text data
    subject: "Quote Request Received",
    html: `Your quote request has been received. <br><br>
    Your <strong>Reference ID is <code>${data.referenceId}</code></strong>`
  };

  //Invokes the method to send emails given the above data with the helper library
  mailgun.messages().send(mailData, function(err, body) {
    //If there is an error, render the error page
    if (err) {
      // res.render('error', { error : err});
      console.error("got an error: ", err);
    }
    //Else we can greet    and leave
    else {
      //Here "submitted.jade" is the view file for this landing page
      //We pass the variable "email" from the url parameter in an object rendered by Jade
      // res.render('submitted', { email : req.params.mail });
      // console.info(body);
      console.info(`Mail sent to admin for ${data.referenceId} successfully`);
    }
  });
}

function formatDate(dateString) {
  console.info(dateString)
  const date = new Date(dateString)
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return (
    date.getMonth() +
    1 +
    "/" +
    date.getDate() +
    "/" +
    date.getFullYear() +
    "  " +
    strTime
  );
}

module.exports = router;
