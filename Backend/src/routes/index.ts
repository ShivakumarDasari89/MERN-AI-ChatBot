import {Router} from 'express'
import userRouters from './user_routers.js';
import chatRouters from './chat_routes.js';

const appRouter=Router();

appRouter.use('/user',userRouters); //domain/api/sp8/user
appRouter.use('/chat',chatRouters); //domain/api/sp8/charts

export default appRouter;