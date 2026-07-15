import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import donorsRouter from "./donors";
import patientsRouter from "./patients";
import facilitiesRouter from "./facilities";
import inventoryRouter from "./inventory";
import emergencyRouter from "./emergency";
import walletRouter from "./wallet";
import notificationsRouter from "./notifications";
import analyticsRouter from "./analytics";
import dashboardRouter from "./dashboard";
import searchRouter from "./search";
import geographyRouter from "./geography";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(donorsRouter);
router.use(patientsRouter);
router.use(facilitiesRouter);
router.use(inventoryRouter);
router.use(emergencyRouter);
router.use(walletRouter);
router.use(notificationsRouter);
router.use(analyticsRouter);
router.use(dashboardRouter);
router.use(searchRouter);
router.use(geographyRouter);

export default router;
