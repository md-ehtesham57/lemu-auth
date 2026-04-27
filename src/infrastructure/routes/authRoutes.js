import { registerSchema,
         loginSchema,
         forgotPasswordSchema } from '../validation/auth.schema.js';
import { validate } from '../middleware/validate.js';
import { userController } from '../../delivery/http/container.js';


router.post('/register', validate(registerSchema), authController.register);

router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));

router.post('/forgot-password', validate(forgotPasswordSchema), (req, res, next) => userController.forgotPassword(req, res, next));