const express = require('express');
const router = express()
const {
    create,
    checking,
    transit,
    accepted,
    wash,
    dry,
    done,
    find
} = require('./controller')
const {
    authenticateUser,
    authhorizeRoles,
} = require('../../../middlewares/auth');

// router.get('/tracker', index)

router.post('/tracker', create);

router.get('/tracker/:id', find);

router.put('/tracker/checking/:id',   checking);

router.put('/tracker/transit/:id',  transit);

router.put('/tracker/accepted/:id',  accepted);

router.put('/tracker/wash/:id',  wash);

router.put('/tracker/dry/:id',   dry);

router.put('/tracker/done/:id',   done);

module.exports = router;