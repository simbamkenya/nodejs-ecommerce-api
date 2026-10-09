const Category = require('../models/category');
const { isValidId, run, updateOptions } = require('./mongo');

const categoryRepository = {
    findAll() {
        return Category.find().lean();
    },

    async findById(id) {
        if (!isValidId(id)) return null;
        return Category.findById(id).lean();
    },

    async exists(id) {
        if (!isValidId(id)) return false;
        return Boolean(await Category.exists({ _id: id }));
    },

    async create(data) {
        const category = await run(() => Category.create(data));
        return category.toObject();
    },

    async update(id, data) {
        if (!isValidId(id)) return null;
        return run(() => Category.findByIdAndUpdate(id, data, updateOptions).lean());
    },

    async delete(id) {
        if (!isValidId(id)) return null;
        return Category.findByIdAndDelete(id).lean();
    }
};

module.exports = categoryRepository;
