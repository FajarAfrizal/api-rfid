const Linen = require('../../api/v1/linen/model');
const { BadRequestError, NotFoundError } = require('../../errors');
const xlsx = require('xlsx');
const Audit = require('../../api/v1/audit trail/model');

const createLinen = async (req) => {
    const { name } = req.body;

    const checkName = await Linen.findOne({ name: name })

    if (checkName) throw new BadRequestError('Name has already been registered');

    const result = await Linen.create({
        name,
    })

    await Audit.create({
        task: 'Linen',
        status: 'CREATE',
        user: req.user.id
    })
    return result;
}

const getAllLinen = async (req) => {
    const result = await Linen.find()
        .select('epc category date hospital counter code')
        .populate({
            path: 'category',
            select: 'name'
        })
        .populate({
            path: 'hospital',
            select: 'name'
        })
    if (!result) throw new NotFoundError('Linen not found');

    return result;
}

const getOneLinen = async (req) => {
    const { id } = req.params;

    const result = await Linen.findOne({ _id: id })
        .select('epc category')

    if (!result) throw new NotFoundError('Linen not found');

    return result;
}

const updateLinen = async (req) => {
    const { id } = req.params;
    const { category } = req.body;

    const result = await Linen.findByIdAndUpdate(
        { _id: id },
        { category },
        { new: true, runValidators: true }
    )

    if (!result) throw new NotFoundError(`Linen name id ${id} not found`);

    await Audit.create({
        task: `Linen updated ${id}`,
        status: 'UPDATE',
        user: req.user.id
    })

    return result;
}

const deleteLinen = async (req) => {
    const { id } = req.params;

    const result = await Linen.findByIdAndDelete({ _id: id })

    if (!result) throw new NotFoundError(`Linen name ${id} not found`);

    await Audit.create({    
        task: `Linen deleted ${id}`,
        status: 'DELETE',
        user: req.user.id
    })

    return result;
}


const checkLinen = async (id) => {
    const result = await Linen.findOne({ _id: id })

    if (!result) throw new NotFoundError('Linen id not found');

    return result
}

const countLinen = async () => {
    const result = await Linen.find().count();

    return result
}

const countLinenByHospital = async (req) => {
    const  idHospital   = req.params.id;
    const Linen = await Linen.countDocuments({ hospital: idHospital })

    return result 
}


module.exports = {
    createLinen,
    getAllLinen,
    getOneLinen,
    updateLinen,
    deleteLinen,
    checkLinen,
    countLinen,
    countLinenByHospital
};