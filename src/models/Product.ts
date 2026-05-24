import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IProductSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImageUrl: string;
  canonicalUrl: string;
}

export interface IProduct extends Document {
  slug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  detailedDescription: string;
  currentPrice: number;
  originalPrice: number;
  currency: string;
  discountPercent: number;
  discountLabel: string;
  isActive: boolean;
  isFeatured: boolean;
  isSaleEnabled: boolean;
  tags: string[];
  seo: IProductSeo;
  samplePdfUrl: string;
  fullPdfR2Key: string;
  coverImageUrl: string;
  features: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  trustBadges: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const ProductSeoSchema = new Schema<IProductSeo>(
  {
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    keywords: [{ type: String }],
    ogImageUrl: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true },
    detailedDescription: { type: String, required: true },
    currentPrice: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      required: true,
      min: [0, 'Original price cannot be negative'],
    },
    currency: { type: String, required: true, default: 'INR', uppercase: true, maxlength: 3 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discountLabel: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isSaleEnabled: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],
    seo: { type: ProductSeoSchema, required: true },
    samplePdfUrl: { type: String, default: '' },
    fullPdfR2Key: { type: String, required: true },
    coverImageUrl: { type: String, default: '' },
    features: [{ type: String }],
    ctaPrimary: { type: String, default: 'Buy Now' },
    ctaSecondary: { type: String, default: 'Preview Book' },
    trustBadges: [{ type: String }],
    version: { type: Number, default: 1 },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    // Never leak the R2 key to API responses unless explicitly selected
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.__v = undefined;
        ret.fullPdfR2Key = undefined; // never expose R2 key publicly
        return ret;
      },
    },
  }
);

// Compound index: active products by slug (most common query)
ProductSchema.index({ slug: 1, isActive: 1 });
// Text search across title + description
ProductSchema.index({ title: 'text', shortDescription: 'text', tags: 'text' });
// Soft-delete filter
ProductSchema.index({ deletedAt: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
