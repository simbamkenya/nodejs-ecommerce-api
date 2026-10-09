const Product = require('../models/product');
const { isValidId, run, updateOptions } = require('./mongo');

const productRepository = {
    async findPage({ categoryIds, featured, page, limit }) {
        const filter = {};
        if (categoryIds) filter.category = { $in: categoryIds.filter(isValidId) };
        if (featured) filter.isFeatured = true;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('category')
                .sort({ dateCreated: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Product.countDocuments(filter)
        ]);
        return { products, total };
    },

    async findById(id) {
        if (!isValidId(id)) return null;
        return Product.findById(id).populate('category').lean();
    },

    async existsInCategory(categoryId) {
        if (!isValidId(categoryId)) return false;
        return Boolean(await Product.exists({ category: categoryId }));
    },

    async exists(id) {
        if (!isValidId(id)) return false;
        return Boolean(await Product.exists({ _id: id }));
    },

    async create(data) {
        const product = await run(() => Product.create(data));
        return product.toObject();
    },

    async update(id, data) {
        if (!isValidId(id)) return null;
        return run(() => Product.findByIdAndUpdate(id, data, updateOptions).lean());
    },

    async delete(id) {
        if (!isValidId(id)) return null;
        return Product.findByIdAndDelete(id).lean();
    },

    // atomically take `quantity` out of stock; returns the product, or null if missing or short on stock
    async reserveStock(id, quantity) {
        if (!isValidId(id)) return null;
        return Product.findOneAndUpdate(
            { _id: id, countInStock: { $gte: quantity } },
            { $inc: { countInStock: -quantity } },
            { returnDocument: 'after' }
        ).lean();
    },

    // put stock back for [{ product, quantity }]
    async releaseStock(items) {
        await Promise.all(items.map((item) =>
            Product.updateOne({ _id: item.product }, { $inc: { countInStock: item.quantity } })
        ));
    }
};

module.exports = productRepository;
