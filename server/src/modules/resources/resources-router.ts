import express from "express";
import { resourcesController } from "./resources-controller";
import { requireAuth } from "@clerk/express";

const router = express.Router();


router.get("/", resourcesController.getAllResources);

router.get("/tags", resourcesController.getAllResourceTags);

router.get("/personalized", requireAuth(), resourcesController.getPersonalizedRecommendations);

// Search endpoints (no auth required)
router.get("/search/articles", resourcesController.searchExternalArticles);
router.get("/search/videos", resourcesController.searchExternalVideos);

router.get("/:id", resourcesController.getResourceById);

// CRUD operations (auth required)
router.post("/", requireAuth(), resourcesController.createResource);

router.put("/:id", requireAuth(), resourcesController.updateResource);

router.delete("/:id", requireAuth(), resourcesController.deleteResource);


export { router as resourcesRouter };