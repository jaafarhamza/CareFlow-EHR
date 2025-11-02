import Pharmacy from '../models/pharmacy.model.js';

class PharmacyRepository {
  async create(data) {
    const pharmacy = new Pharmacy(data);
    return pharmacy.save();
  }

  async findById(id) {
    return Pharmacy.findById(id)
      .populate('managerId', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async findByIdSimple(id) {
    return Pharmacy.findById(id);
  }

  async findByLicenseNumber(licenseNumber) {
    return Pharmacy.findOne({ licenseNumber });
  }

  async list({ page = 1, limit = 20, filter = {}, sort = { name: 1 } }) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Pharmacy.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('managerId', 'firstName lastName email phone'),
      Pharmacy.countDocuments(filter)
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findNearby(longitude, latitude, maxDistance = 5000, limit = 20) {
    return Pharmacy.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
      .limit(limit)
      .populate('managerId', 'firstName lastName phone');
  }

  async findByCity(city, options = {}) {
    const { limit = 50, isActive = true } = options;
    
    const filter = { 'address.city': new RegExp(city, 'i') };
    if (isActive !== undefined) filter.isActive = isActive;

    return Pharmacy.find(filter)
      .sort({ name: 1 })
      .limit(limit)
      .populate('managerId', 'firstName lastName phone');
  }

  async findActive(options = {}) {
    const { limit = 50 } = options;
    
    return Pharmacy.find({ isActive: true })
      .sort({ name: 1 })
      .limit(limit)
      .populate('managerId', 'firstName lastName phone');
  }

  async update(id, data) {
    return Pharmacy.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async delete(id) {
    return Pharmacy.findByIdAndDelete(id);
  }

  async deactivate(id) {
    return Pharmacy.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );
  }

  async activate(id) {
    return Pharmacy.findByIdAndUpdate(
      id,
      { $set: { isActive: true } },
      { new: true }
    );
  }

  async count(filter = {}) {
    return Pharmacy.countDocuments(filter);
  }

  buildFilter(params) {
    const filter = {};

    if (params.isActive !== undefined) {
      filter.isActive = params.isActive === 'true' || params.isActive === true;
    }

    if (params.city) {
      filter['address.city'] = new RegExp(params.city, 'i');
    }

    if (params.state) {
      filter['address.state'] = new RegExp(params.state, 'i');
    }

    if (params.country) {
      filter['address.country'] = new RegExp(params.country, 'i');
    }

    if (params.is24Hours !== undefined) {
      filter.is24Hours = params.is24Hours === 'true' || params.is24Hours === true;
    }

    if (params.deliveryAvailable !== undefined) {
      filter.deliveryAvailable = params.deliveryAvailable === 'true' || params.deliveryAvailable === true;
    }

    if (params.acceptsInsurance !== undefined) {
      filter.acceptsInsurance = params.acceptsInsurance === 'true' || params.acceptsInsurance === true;
    }

    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { 'address.street': { $regex: params.search, $options: 'i' } },
        { 'address.city': { $regex: params.search, $options: 'i' } },
        { licenseNumber: { $regex: params.search, $options: 'i' } }
      ];
    }

    return filter;
  }
}

export default new PharmacyRepository();
