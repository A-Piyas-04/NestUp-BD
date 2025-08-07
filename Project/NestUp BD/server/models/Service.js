import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  propertyType: String,
  description: String,
  district: String,
  area: String,
  address: String,
  price: String,
  availableFrom: String,
  availableTo: String,
  bedrooms: String,
  bathrooms: String,
  squareFeet: String,
  furnishing: String,
  amenities: Object,
  photos: [String],
  contactName: String,
  contactPhone: String,
  contactEmail: String,
  contactWhatsapp: String,
  termsAgreed: Boolean
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
