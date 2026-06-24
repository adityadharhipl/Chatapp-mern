import bcrypt from "bcryptjs";
import User from "../user/user.model.js";
import generateToken from "../../utils/generateToken.js";








// Register
export const register = async (
  req,
  res
) => {

  try {

    const {
      name,
      email,
      password,
      confirmPassword
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    const exists =
      await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await User.create({
        name,
        email,
        password: hashedPassword
      });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};
// Login
export const login = async (
  req,
  res
) => {

  const { email, password } =
    req.body;

  const user =
    await User.findOne({ email });

  if (
    user &&
    (await bcrypt.compare(
      password,
      user.password
    ))
  ) {

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });

  }

  res.status(401).json({
    message: "Invalid credentials"
  });
};