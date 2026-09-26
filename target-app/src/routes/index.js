<<<<<<< HEAD
console.log('this is placeholder for routes');
=======
import { Router } from 'express';
import { getUser } from '../controllers/userController';

const router = Router();

// GET /users/:email — look up a user by their email address
router.get('/users/:email', getUser);

export default router;
>>>>>>> 0f49992 (Adding new things yoyo)
