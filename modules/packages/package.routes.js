import { Router } from 'express';

import {
    createPackage,
    getPublicPackages,
    getAdminPackages,
    updatePackage,
    archivePackage,
    reorderPackages,
    deletePackage,
    togglePackageVisibility,
} from './package.controller.js'

import { protect } from '../../middlewares/auth.middleware.js'
import { allowRoles } from "../../middlewares/role.middleware.js"
import { ROLES } from '../../constants/roles.js';
import { upload } from '../../middlewares/upload.middleware.js';

const packageRouter = Router();
// Public
packageRouter.get("/", getPublicPackages);

packageRouter.use(protect, allowRoles(ROLES.ADMIN));

packageRouter.get("/admin", getAdminPackages);
packageRouter.post("/", upload.single("image"), createPackage);
packageRouter.put("/:id", upload.single("image"), updatePackage);
packageRouter.patch("/:id/archive", archivePackage);
packageRouter.post("/reorder", reorderPackages);
packageRouter.delete('/:id', deletePackage)
packageRouter.patch("/:id/visibility", togglePackageVisibility);


export default packageRouter;