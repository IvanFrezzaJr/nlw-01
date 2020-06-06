import knex from '../database/connection';
import { Request, Response } from 'express';

class PointsController {
    async create (request: Request, response: Response){
        const  {
            name,
            email,
            whatzapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;
    
        const trx = await knex.transaction();
    
        const point = {
            image: request.file.filename,
            name,
            email,
            whatzapp,
            latitude,
            longitude,
            uf,
            city,
        }

        const insertedIds = await trx('points').insert(point);
    
        const points_id = insertedIds[0]
    
        const pointItems = items
        .split(',')
        .map((item: string) => Number(item.trim()))
        .map((items_id: number) => {
            return {
                items_id,
                points_id: points_id
            };
        })
    
        await trx("points_items").insert(pointItems);

        await trx.commit();

        return response.json({
            id: points_id,
            ...point,
        });
    }

    async show (request: Request, response: Response) {
        const id = request.params.id;

        const point = await knex('points').where('id', id).first();

        if (!point) {
            return response.status(400).json({message: 'Point not found.'});
        }

        const serializedPoint = {
            ...point,
            image_url: `http://192.168.178.28:3333/uploads/${point.image}`
        };
        

        const items = await knex('items')
        .join('points_items', 'items.id', '=', 'points_items.items_id')
        .where('points_items.points_id', id)
        .select("name");


        return response.json({point: serializedPoint, items});

    }   


    async index(request: Request, response: Response) {
        
        const { city, uf, items } = request.query;
        const parsedItems = String(items)
        .split(',')
        .map(item => Number(item.trim()));

        const points = await knex('points').join('points_items', 'points.id', '=', 'points_items.points_id')
        .whereIn('points_items.items_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('points.*');

        
        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.178.28:3333/uploads/${point.image}`
            };
        })
        

        return response.json(serializedPoints);
        
    }
}

export default PointsController;