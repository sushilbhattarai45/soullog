import userSchema from '../schema/userSchema.js';

export const registerUser = async (req, res) => {
  try {
    console.log ('i am here');

    const {username, password} = req.body;
    console.log ('i am here');
    const newUser = new userSchema ({username: username, password});
    await newUser.save ();
    console.log ('User registered:', newUser);
    res.status (201).json ({message: 'User registered successfully'});
  } catch (error) {
    res.status (500).json ({message: 'Error registering user', error});
  }
};

export const loginUser = async (req, res) => {
  try {
    const {username, password} = req.body;
    const user = await userSchema.findOne ({username: username, password});
    if (user) {
      res.status (200).json ({message: 'Login successful', user: user});
    } else {
      res.status (401).json ({message: 'Invalid credentials'});
    }
  } catch (error) {
    res.status (500).json ({message: 'Error logging in', error});
  }
};
