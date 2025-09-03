const router= require('express').Router();
const {body}= require('express-validator');
const slangCtrl = require('../controllers/slang.controller');
const auth = require("../middleware/auth");

router.post("/",auth,[body('word').notEmpty().withMessage("Word is required"),body('meaning').notEmpty().withMessage("Word is required")],
slangCtrl.createSlang);
router.get('/',slangCtrl.getSlangs);
router.get('/:id',slangCtrl.getSlang);
router.put('/:id',auth, slangCtrl.updateSlang);
router.delete('/:id',auth,slangCtrl.deleteSlang);

router.post("/:id/like", auth, slangCtrl.likeSlang);
router.post("/:id/favorite", auth, slangCtrl.toggleFavorite);

module.exports = router;