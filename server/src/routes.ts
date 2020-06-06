import express from 'express';
import { celebrate, Joi } from 'celebrate';
import multer from 'multer';
import multerConfig from './config/multer';

import knex from './database/connection';
import PointsController from './controllers/pointsController';
import ItemsController from './controllers/itemsController';

const routes = express.Router();
const upload = multer(multerConfig);

const pointsController = new PointsController();
const itemsController = new ItemsController();

// index: lista de itens
// show: mostrar um único registro
// create/store: criar um único registro
// update: atualizar um único registro
// delete/destroy: deletar um único registro

routes.get('/items', itemsController.index);
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);

routes.post(
    '/points', 
    upload.single('image'),  
    celebrate({
        body: Joi.object().keys({
            name: Joi.string().required(), 
            email: Joi.string().required().email(),
            whatzapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(), 
            uf: Joi.string().required(),
            items: Joi.string().required()
        })

    },
    {
        abortEarly: false
    }),
    pointsController.create);


export default routes;