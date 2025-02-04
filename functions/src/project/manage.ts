import * as admin from "firebase-admin";
import {ApiResponse} from "../common/form/api";
import router from "./account";

router.patch('/:projectId/config/modify', async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { field, value } = req.body;

        const db = admin.firestore();

        await db.collection('Project')
            .doc(projectId)
            .update({[field]: value});

        return res.status(200).send(new ApiResponse().success({}));
    } catch (e) {
        console.error('Modify Project Config : ', e);
        return next(e);
    }
});


export default router;