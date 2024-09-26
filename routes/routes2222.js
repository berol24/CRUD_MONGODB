const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");

// Image upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.filename + "_" + Date.now() + "_" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
}).single("image"); // 'image' est le nom du champ dans le formulaire

// Insert a user into the database
router.post("/add", upload, async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename, // Correction : utiliser `filename` au lieu de `fieldname`
    });

    await user.save();
    
    req.session.message = {
      type: "success",
      message: "User added successfully!",
    };
    res.redirect("/");
  } catch (err) {
    res.json({
      message: err.message,
      type: "danger",
    });
  }
});

// Home page route
router.get("/", (req, res) => {
  res.render("index", { title: "Home page" });
});

// Route for rendering the Add Users page
router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add Users" });
});

module.exports = router;
