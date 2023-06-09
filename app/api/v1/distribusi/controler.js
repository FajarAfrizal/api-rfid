const { createDistribusi, downloadDistribusi, getAllDistribusi, getOneDistribusi, updateDistribusi, deleteDistrbusi, countDistrbusi } = require('../../../service/mongoose/distribusi');
const { StatusCodes } = require('http-status-codes');
const Distribusi = require('./model');
const ExcelJS = require('exceljs');

const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');

const csv = require('csvtojson')
const xlsx = require('xlsx');
const puppeteer = require('puppeteer')


const Linen = require('../linen/model');
const Category = require('../category/model');
const Hospital = require('../hospital/model');
const Tracker = require('../tracker/model');
const { BadRequestError } = require('../../../errors');



const create = async (req, res, next) => {
    try {
        const result = await createDistribusi(req);

        res.status(StatusCodes.CREATED).json({
            
            message: 'distribusi created successfully',
            data: result,
            
        });
    } catch (err) {
        next(err);
    }
}

const index = async (req, res, next) => {
    try {
        const result = await getAllDistribusi(req)

        res.status(StatusCodes.OK).json({
            total: result.length,
            data: result
        })
    } catch (err) {
        next(err);
    }
}

const find = async (req, res, next) => {
    try {
        const result = await getOneDistribusi(req)

        res.status(StatusCodes.OK).json({
            data: result
        })
    } catch (err) {
        next(err)
    }
}

const update = async (req, res, next) => {
    try {
        const result = await updateDistribusi(req)

        res.status(StatusCodes.OK).json({
            message: 'distribusi update successfully',
            data: result
        })
    } catch (err) {
        next(err)
    }
}


const destroy = async (req, res, next) => {
    try {
        const result = await deleteDistrbusi(req)

        res.status(StatusCodes.OK).json({
            message: 'distribusi delete successfully',
            data: result
        })
    } catch {
        next(err)
    }
}

const download = async (req, res, next) => {
    try {
        const result = await getAllDistribusi(req)

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('data');

        worksheet.columns = [
            { header: 'Customer', key: 'customer', width: 30, alignment: { horizontal: 'middle' } },
            { header: 'Category', key: 'category', width: 20, alignment: { horizontal: 'middle' } },
            { header: 'Linen', key: 'linen', width: 40, alignment: { horizontal: 'middle' } },
            { header: 'Service', key: 'service', width: 20, alignment: { horizontal: 'middle' } },
            { header: 'Quality', key: 'quality', width: 20, alignment: { horizontal: 'middle' } },
            { header: 'Status', key: 'status', width: 20, alignment: { horizontal: 'middle' } },
            { header: 'Date In', key: 'dateIn', width: 15, alignment: { horizontal: 'middle' } },
            { header: 'Date Out', key: 'dateOut', width: 15, alignment: { horizontal: 'middle' } },
            { header: 'Amount', key: 'amount', width: 10, alignment: { horizontal: 'middle' } },
            { header: 'Weight', key: 'weight', width: 10, alignment: { horizontal: 'middle' } },
        ];

        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00FF00' }
        };

        worksheet.columns.forEach(column => {
            column.headerStyle = {
                alignment: { horizontal: 'middle' },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF00FF00' }
                }
            };
        });

        result.forEach(item => {
            item.linen.forEach(linen => {
                const statusValue = item.status ? item.status.status : '-';
        
                worksheet.addRow({
                    customer: item.customer.name,
                    category: linen.category,
                    linen: linen.epc,
                    service: item.service,
                    quality: item.quality,
                    status: statusValue,
                    dateIn: item.dateIn,
                    dateOut: item.dateOut,
                    amount: item.amount,
                    weight: item.weight,
                });
            });
        });


        await workbook.xlsx.writeFile('data.xlsx');
        res.download('data.xlsx');

    } catch (err) {
        next(err)
    }
}
const downloadTemplateExcel = async (req, res, next) => {
    try {
        const result = await getAllDistribusi(req)

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('data');

        worksheet.columns = [
            { header: 'Customer', key: 'customer', width: 30, alignment: { horizontal: 'middle' } },
            { header: 'Category', key: 'category', width: 20, alignment: { horizontal: 'middle' } },
            { header: 'Linen', key: 'linen', width: 20, alignment: { horizontal: 'middle' } },
            { header: 'Service', key: 'service', width: 20, alignment: { horizontal: 'middle' } },
            { header: 'Quality', key: 'quality', width: 20, alignment: { horizontal: 'middle' } },
            { header: 'Status', key: 'status', width: 20, alignment: { horizontal: 'middle' } },
            { header: 'Date In', key: 'dateIn', width: 15, alignment: { horizontal: 'middle' } },
            { header: 'Date Out', key: 'dateOut', width: 15, alignment: { horizontal: 'middle' } },
            { header: 'Amount', key: 'amount', width: 10, alignment: { horizontal: 'middle' } },
            { header: 'Weight', key: 'weight', width: 10, alignment: { horizontal: 'middle' } },
        ];

        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00FF00' }
        };

        worksheet.columns.forEach(column => {
            column.headerStyle = {
                alignment: { horizontal: 'middle' },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF00FF00' }
                }
            };
        });
        await workbook.xlsx.writeFile('templateDistribusi.xlsx');
        res.download('templateDistribusi.xlsx');

    } catch (err) {
        next(err)
    }
}
const downloadDistribusiPDF = async (req, res, next) => {
    try {
        const distribusi = await getAllDistribusi(req);

        const data = {
            distribusi: distribusi
        };
        const filePathName = path.resolve(__dirname, '../../../../public/pdf/distribusi.ejs');
        const htmlString = fs.readFileSync(filePathName).toString();
        const ejsData = ejs.render(htmlString, data);

        const options = {
            format: 'Letter'
        };

        pdf.create(ejsData, options).toBuffer(async (err, buffer) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Failed to generate PDF');
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment;filename="distribusi.pdf"');

            res.send(buffer);
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send('Failed to generate PDF');
    }
};


const importExcel = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
            throw new Error('Empty data');
        }

        const transformedData = jsonData.map(async (item) => {
            const hospitalName = item.Customer;
            const categoryName = item.Category;
            const linenName = item.Linen;
            const statusName = item.Status;

            const hospital = await Hospital.findOne({ name: hospitalName }, '_id');
            const category = await Category.findOne({ name: categoryName }, '_id');
            const linen = await Linen.findOne({ epc: linenName }, '_id');
            const status = await Tracker.findOne({ status: statusName }, '_id')

            if (hospital) {
                item.customer = hospital._id;
            }
            if (category) {
                item.category = category._id;
            }
            if (linen) {
                item.linen = linen._id;
            }

            const transformedItem = {
                weight: item.Weight,
                amount: item.Amount,
                dateOut: item['Date Out'],
                dateIn: item['Date In'],
                quality: item.Quality,
                status: status,
                service: item.Service,
                linen: linen ? linen._id.toString() : null,
                category: category ? category._id.toString() : null,
                customer: hospital ? hospital._id.toString() : null
            };


            return transformedItem;
        });
        const transformedformis = await Promise.all(transformedData);



        const result = await Distribusi.create(transformedformis);

        res.status(200).json({
            data: result,
            message: 'Success'
        })

    } catch (err) {
        next(err)
    }
}

const count = async (req, res, next) => {
    try {
        const result = await countDistrbusi();

        res.json({
            data: result
        })
    } catch (err) {

        next(err)
    }
}

const serahTerima = async (req, res, next) => {
    try {
        const data = await getOneDistribusi(req);
        const filePath = path.join(__dirname, "../../../../views/serah.ejs")
        ejs.renderFile(filePath, { data }, (err, html) => {
            if (err) {
                console.log(err)
            }
            return res.send(html)
        })


    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to generate or send PDF');
        next
    }
};

const generatePdf = async (req, res, next) => {
    try {
        const { id } = req.params
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        await page.goto(`http://localhost:9000/api/v1/rfid/serahTerima/${id}`,
            {
                waitUntil: 'networkidle0'
            });


        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
        });

        await browser.close();

        const filePath = path.join(__dirname, 'report.pdf');
        fs.writeFileSync(filePath, pdf);

       

        res.download(filePath, 'serahterima.pdf', (err) => {
            if (err) {
                console.error(err);
                return next(err);
            }

            fs.unlinkSync(filePath);
        });



    } catch (err) {
        next(err)
    }
}


module.exports = {
    create,
    find,
    update,
    index,
    destroy,
    download,
    downloadDistribusiPDF,
    importExcel,
    count,
    downloadTemplateExcel,
    serahTerima,
    generatePdf
}
