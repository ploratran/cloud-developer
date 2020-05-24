import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';

const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response, err) => {

    const items = await FeedItem.findAndCountAll({ order: [['id', 'DESC']] });

    items.rows.map(item => {
            if (item.url) {
                // url is the requested signed url from S3 to download the resource:  
                item.url = AWS.getGetSignedUrl(item.url);
            }
    });
    res.status(200).send(items);
});

//@TODO
//Add an endpoint to GET a specific resource by Primary Key
router.get('/:id', async (req: Request, res: Response) => {
    let { id } = req.params;

    if (!id) {
        return res.status(400).send({message: 'Id is required'});
    }

    const item = await FeedItem.findByPk(id);

    res.status(200).send(item); // expect status code 200
}); 

// update a specific resource
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
    //@TODO try it yourself
    let { id } = req.params.id; 

    // body : {caption: string, fileName: string};
    let caption: string = req.body.caption;
    let fileName: string = req.body.url;

    // find specific id in FeedItem database:
    const item: FeedItem = await FeedItem.findByPk(id);


    // check if caption exist: 
    if (caption != null || undefined) {
        item.caption = caption;
    }

    // check if url exist: 
    if (fileName != null || undefined) {
        item.url = fileName; 
    }

    // save the updated item back into FeedItem database: 
    const updatedItem = await item.save();

    res.status(200).send(updatedItem);
});

// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', requireAuth, async (req: Request, res: Response) => {
    let { fileName } = req.params;

    // get the URL given back by S3: 
    const url = AWS.getPutSignedUrl(fileName);

    // send back the URL given back by S3: 
    res.status(200).send({url: url}); // should send back 200 status code
});

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is the key name in the s3 bucket.
router.post('/', requireAuth, async (req: Request, res: Response) => {

    // body : {caption: string, fileName: string};
    const caption: string = req.body.caption;
    const fileName: string = req.body.url;

    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }

    const item = await new FeedItem({
            caption: caption,
            url: fileName
    });

    // save the new item into FeedItem database: 
    const saved_item = await item.save();

    // save the requested url from S3 into FeedItem database: 
    saved_item.url = AWS.getGetSignedUrl(saved_item.url);

    res.status(201).send(saved_item);
});

export const FeedRouter: Router = router;