const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const users = require("../models/users");
const fs = require("fs");



// image upload

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image"); //image ici c'est le name du input image




// Insert an user into database  route

router.post("/add", upload, async (req, res) => {
  console.log(req.body);

  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
    });

    // Utilisation de await pour gérer l'opération asynchrone
    await user.save();

    req.session.message = {
      type: "success",
      message: "User added successfully!",
    };
    res.redirect("/");
  } catch (err) {
    // Gérer les erreurs ici
    res.json({
      message: err.message,
      type: "danger",
    });
  }
});




//Get all users route

router.get("/", async (req, res) => {
  try {
    //   // res.send("Home Page");  renvoie un texte precis sur la page
    //   // console.log(User);
    //   // res.render("index", { title: "Home page" });

    // Récupérer tous les utilisateurs de la base de données
    const users = await User.find(); // Pas besoin d'utiliser exec ici avec await
    // Rendre la vue "index" avec les utilisateurs récupérés
    res.render("index", { title: "Home page", users: users });
  } catch (err) {
    // Gérer les erreurs
    res.json({ message: err.message });
  }
});

// router.get("/users" ,(req , res)=>{
//     res.send("All Users");
// })

router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add Users" });
});

// Edit an user route

router.get("/edit/:id", async (req, res) => {
  try {
    let id = req.params.id;
    // Utilisation de async/await pour la requête Mongoose
    const user = await User.findById(id);

    if (!user) {
      // Si l'utilisateur n'existe pas, redirection vers la page d'accueil
      return res.redirect("/");
    }
    // Si l'utilisateur est trouvé, on rend la vue avec les données
    res.render("edit_users", {
      title: "Edit User",
      user: user,
    });
  } catch (err) {
    console.error(err);
    // En cas d'erreur, redirection vers la page d'accueil
    res.redirect("/");
  }
});





// Update user route

router.post("/update/:id", upload, async (req, res) => {
  let id = req.params.id;
  let new_image = "";

  if (req.file) {
    new_image = req.file.filename;
    
    try {
      // Assurez-vous que l'ancienne image existe avant de tenter de la supprimer
      if (req.body.old_image && fs.existsSync("./uploads/" + req.body.old_image)) {
        // Suppression asynchrone de l'ancienne image
        await fs.promises.unlink("./uploads/" + req.body.old_image);
        console.log("Ancienne image supprimée : " + req.body.old_image);
      } else {
        console.log("Ancienne image non trouvée : " + req.body.old_image);
      }
    } catch (err) {
      console.log("Erreur lors de la suppression de l'ancienne image : ", err);
    }
  } else {
    new_image = req.body.old_image; // Si aucune nouvelle image n'est téléchargée, garder l'ancienne
  }

  try {
    // Mise à jour des informations de l'utilisateur
    await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image
    });

    // Message de succès
    req.session.message = {
      type: "success",
      message: "User updated successfully!"
    };

    // Redirection après la mise à jour
    res.redirect("/");
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'utilisateur : ", err);
    res.json({ message: err.message, type: 'danger' });
  }
});



/// Delete user route 

router.get('/delete/:id', async (req, res) => {
  let id = req.params.id;

  try {
    // Récupérer l'utilisateur à supprimer
    const result = await User.findByIdAndDelete(id);

    if (result) {
      // Si l'utilisateur a une image associée, la supprimer du répertoire 'uploads'
      if (result.image && result.image !== '') {
        try {
          await fs.promises.unlink("./uploads/" + result.image);
          console.log("Image supprimée : " + result.image);
        } catch (err) {
          console.error("Erreur lors de la suppression de l'image : ", err);
        }
      }

      // Ajouter un message de succès
      req.session.message = {
        type: 'success',
        message: 'User deleted successfully!'
      };

      // Redirection après suppression
      res.redirect('/');
    } else {
      // Si l'utilisateur n'existe pas
      req.session.message = {
        type: 'danger',
        message: 'User not found!'
      };
      res.redirect('/');
    }
  } catch (err) {
    // En cas d'erreur lors de la suppression de l'utilisateur
    console.error("Erreur lors de la suppression de l'utilisateur : ", err);
    res.json({ message: err.message });
  }
});

module.exports = router;
