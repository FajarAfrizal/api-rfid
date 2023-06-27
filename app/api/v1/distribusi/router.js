const express = require('express');
const router = express();
const { create,
    index,
    update,
    find,
    destroy,
    download,
    downloadDistribusiPDF,
    importExcel,
    count,
    downloadTemplateExcel,
    serahTerima,
    generatePdf
} = require('./controler');
const { authenticateUser, authhorizeRoles } = require('../../../middlewares/auth');

const upload = require('../../../middlewares/multer');


router.post('/distribusi', authenticateUser, upload, create);

router.get('/distribusi', authenticateUser, index);

router.get('/distribusi/:id', authenticateUser,  find);

router.put('/distribusi/:id', authenticateUser, update);

router.delete('/distribusi/:id', authenticateUser,  destroy);

router.get('/distribusiDownload', authenticateUser, download);

router.get('/distribusiDownloadPdf', authenticateUser, downloadDistribusiPDF);

router.post('/distribusi/upload', authenticateUser, upload, importExcel);

router.get('/distribusiCount', authenticateUser, count);

router.get('/distribusiDownloadTemplate', authenticateUser, downloadTemplateExcel);

router.get('/serahTerima/:id', authenticateUser, serahTerima)

router.get('/generatePDFSerahTerima/:id', authenticateUser, generatePdf);

module.exports = router;