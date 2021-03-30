const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const GatePass = require("./../models/gatepass.model");
const Student = require("./../models/student.model");
const { auth } = require("./../functions/jwt");

//get gate pass requests made by the user.
router.get("/", auth, async (req, res) => {
  const email = req.user.email;
  const requests = await GatePass.find({ requestBy: email });
  res.json({ data: requests.reverse(), success: true });
});

router.post("/cancel", auth, async (req, res) => {
  try {
    const email = req.user.email;
    const requests = await GatePass.findOne({
      requestBy: email,
      _id: req.body.deleteId,
    });
    if (!requests) {
      return res.json({ success: false, msg: "invalid id" });
    }
    requests.status = -1;
    await requests.save();
    return res.json({ success: true, msg: "Gatepass cancelled" });
  } catch (err) {
    console.log(err);
    return res.json({ msg: "error", success: false });
  }
});

//gate pass requests to be displayed to the hod of particular department
router.get("/userrequests/:department", auth, async (req, res) => {
  try {
    const department = req.params.department;
    const results = await GatePass.find({ department: department });
    res.json({ data: results, success: true });
  } catch (e) {
    console.log(`Error:${e}`.red);
    return res.json({
      success: false,
      message: "Something went wrong..! Unable to fetch gate pass requests.",
    });
  }
});

//create a gate pass request
router.post("/request", auth, async (req, res) => {
  try {
    const user = await Student.findOne({ email: req.user.email });
    const department = user["department"];
    const { onDate, onTime, description, time } = req.body;
    if (!onDate || !onTime || !description) {
      return res.status(422).json({ error: "please fill all fields!!" });
    } else {
      console.log(`Reason:${description},Date:${onDate},Time:${onTime}`.green);
    }
    const gatePass = new GatePass({
      onDate,
      onTime,
      description,
      department,
      requestBy: req.user.email,
      time,
    });
    await gatePass.save();
    return res.json({
      message: "gate pass requested successfully",
      success: true,
    });
  } catch (e) {
    console.log(`Error:${e}`.red);
    return res.json({
      success: false,
      message: "Something went wrong..! Gate pass request failed.",
    });
  }
});

router.post("/edit", auth, async (req, res) => {
  try {
    const { email } = req.user;
    const { onDate, onTime, description, _id } = req.body;

    const result = await GatePass.findOne({ _id, requestBy: email });
    if (!result) {
      return res.json({ success: false, msg: "An error occurred" });
    } else {
      result.onDate = onDate;
      result.onTime = onTime;
      result.description = description;
      await result.save();
      return res.json({ success: true });
    }
  } catch (err) {
    return res.json({ success: false, msg: "error" });
  }
});
module.exports = router;
