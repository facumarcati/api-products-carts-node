import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";

import User from "../models/user.model.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, lastname, email, age, password } = req.body;

    if (!name || !lastname || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Faltan datos",
      });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).send("El usuario ya existe");
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await User.create({
      name,
      lastname,
      email,
      age,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Usuario creado", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error del servidor");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("Usuario no encontrado");
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      return res.status(400).send("Contraseña incorrecta");
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      "secretJWT",
      { expiresIn: "1h" },
    );

    res.json({
      message: "Login exitoso",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error del servidor");
  }
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      user: req.user,
    });
  },
);

export default router;
