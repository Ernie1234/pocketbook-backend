import mongoose from 'mongoose';
import slugify from 'slugify';

const commoditySchema = new mongoose.Schema({
  slug: { type: String, unique: true },
  commodityName: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
  prices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Price' }],

  unit: {
    type: String,
    required: true,
  },
  minQuantity: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    require: true,
  },
  maxQuantity: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    // You can use a pre-save hook to update this automatically if needed
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

commoditySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Pre-save hook to generate slug
commoditySchema.pre('save', function (next) {
  if (this.isModified('commodityName')) {
    this.slug = slugify(this.commodityName, { lower: true });
  }
  next();
});

const Commodity = mongoose.model('Commodity', commoditySchema);

export default Commodity;
