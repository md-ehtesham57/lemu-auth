import { registerSchema, loginSchema } from '../validation/auth.schema.js';
import { validate } from '../middleware/validate.js';

// ... (your other imports)

router.post('/register', validate(registerSchema), authController.register);

router.post('/login', validate(loginSchema), authController.login);