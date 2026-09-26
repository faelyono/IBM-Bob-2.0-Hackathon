import { User } from '../database/models';

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ where: { emailAddress: req.params.emailAddress } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
