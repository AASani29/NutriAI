import express from "express";
import { resourcesController } from "./resources-controller";
    
const router = express.Router();


router.get("/", resourcesController.getAllResources);

router.get("/tags", resourcesController.getAllResourceTags);

router.get("/:id", resourcesController.getResourceById);

router.post("/", (req, res) => {
    // complete implementation
    res.status(201).json({ message: "Resource created", data: req.body });
});

router.put("/:id", (req, res) => {
    // complete implementation
    res.json({ message: `Resource ${req.params.id} updated`, data: req.body });
});

router.delete("/:id", (req, res) => {
    // complete implementation
    res.json({ message: `Resource ${req.params.id} deleted` });
});

    
export { router as resourcesRouter };