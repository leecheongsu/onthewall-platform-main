import {Router} from "express";
import * as admin from 'firebase-admin';
import {ApiResponse} from "./form/api";

const router = Router();

router.post('/validate-phone', async (req, res, next) => {
    try {
        const { phone } = req.body;

        const db = admin.firestore();

        const snapshot = await db.collectionGroup('User')
            .where('phone', '==', phone)
            .where('createdAt', '!=', null)
            .get();

        if(!snapshot.empty) {
            return res.status(400).send(new ApiResponse().denied('Phone number already exists.'));
        }

        return res.status(200).send(new ApiResponse().success({}));
    } catch (e) {
        console.error('Validate Phone Number : ', e);
        return next(e);
    }
});


export default router;