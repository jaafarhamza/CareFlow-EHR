import pharmacyRepo from '../repositories/pharmacy.repository.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';

class PharmacyService {
  async createPharmacy(input, createdBy) {
    const { licenseNumber, location, ...pharmacyData } = input;

    // Check if license number already exists
    const existing = await pharmacyRepo.findByLicenseNumber(licenseNumber);
    if (existing) {
      throw new ValidationError('Pharmacy with this license number already exists');
    }

    // Validate location coordinates if provided
    if (location && location.coordinates) {
      const [longitude, latitude] = location.coordinates;
      if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        throw new ValidationError('Invalid coordinates: longitude must be -180 to 180, latitude must be -90 to 90');
      }
    }

    // Create pharmacy
    const pharmacy = await pharmacyRepo.create({
      licenseNumber,
      location,
      ...pharmacyData,
      createdBy
    });

    return pharmacyRepo.findById(pharmacy._id);
  }

  async listPharmacies(params) {
    const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc', ...filters } = params;
    
    const filter = pharmacyRepo.buildFilter(filters);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    
    return pharmacyRepo.list({ page, limit, filter, sort });
  }

  async getPharmacyById(id) {
    const pharmacy = await pharmacyRepo.findById(id);
    if (!pharmacy) {
      throw new NotFoundError('Pharmacy not found');
    }

    return pharmacy;
  }

  async updatePharmacy(id, updates, userId) {
    const pharmacy = await pharmacyRepo.findByIdSimple(id);
    if (!pharmacy) {
      throw new NotFoundError('Pharmacy not found');
    }

    // If updating license number, check for duplicates
    if (updates.licenseNumber && updates.licenseNumber !== pharmacy.licenseNumber) {
      const existing = await pharmacyRepo.findByLicenseNumber(updates.licenseNumber);
      if (existing) {
        throw new ValidationError('Pharmacy with this license number already exists');
      }
    }

    // Validate location coordinates if provided
    if (updates.location && updates.location.coordinates) {
      const [longitude, latitude] = updates.location.coordinates;
      if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        throw new ValidationError('Invalid coordinates: longitude must be -180 to 180, latitude must be -90 to 90');
      }
    }

    updates.updatedBy = userId;
    const updated = await pharmacyRepo.update(id, updates);
    
    return pharmacyRepo.findById(updated._id);
  }

  async deletePharmacy(id) {
    const pharmacy = await pharmacyRepo.findByIdSimple(id);
    if (!pharmacy) {
      throw new NotFoundError('Pharmacy not found');
    }

    return pharmacyRepo.delete(id);
  }

  async deactivatePharmacy(id, userId) {
    const pharmacy = await pharmacyRepo.findByIdSimple(id);
    if (!pharmacy) {
      throw new NotFoundError('Pharmacy not found');
    }

    if (!pharmacy.isActive) {
      throw new ValidationError('Pharmacy is already inactive');
    }

    await pharmacyRepo.update(id, { isActive: false, updatedBy: userId });
    return pharmacyRepo.findById(id);
  }

  async activatePharmacy(id, userId) {
    const pharmacy = await pharmacyRepo.findByIdSimple(id);
    if (!pharmacy) {
      throw new NotFoundError('Pharmacy not found');
    }

    if (pharmacy.isActive) {
      throw new ValidationError('Pharmacy is already active');
    }

    await pharmacyRepo.update(id, { isActive: true, updatedBy: userId });
    return pharmacyRepo.findById(id);
  }

  async findNearbyPharmacies(longitude, latitude, maxDistance = 5000, limit = 20) {
    // Validate coordinates
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);
    
    if (isNaN(lon) || isNaN(lat)) {
      throw new ValidationError('Invalid coordinates: must be valid numbers');
    }

    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      throw new ValidationError('Invalid coordinates: longitude must be -180 to 180, latitude must be -90 to 90');
    }

    // Validate maxDistance
    const distance = parseInt(maxDistance);
    if (isNaN(distance) || distance <= 0) {
      throw new ValidationError('Invalid maxDistance: must be a positive number');
    }

    if (distance > 50000) {
      throw new ValidationError('maxDistance cannot exceed 50km (50000 meters)');
    }

    const pharmacies = await pharmacyRepo.findNearby(lon, lat, distance, limit);

    // Calculate distance for each pharmacy
    return pharmacies.map(pharmacy => {
      const pharmacyObj = pharmacy.toObject({ virtuals: true });
      
      if (pharmacy.location && pharmacy.location.coordinates) {
        const [pLon, pLat] = pharmacy.location.coordinates;
        const distance = this._calculateDistance(lat, lon, pLat, pLon);
        pharmacyObj.distance = Math.round(distance);
        pharmacyObj.distanceKm = (distance / 1000).toFixed(2);
      }

      return pharmacyObj;
    });
  }

  async findPharmaciesByCity(city, options = {}) {
    if (!city || city.trim().length < 2) {
      throw new ValidationError('City name must be at least 2 characters');
    }

    return pharmacyRepo.findByCity(city, options);
  }

  async getActivePharmacies(options = {}) {
    return pharmacyRepo.findActive(options);
  }

  async getPharmacyStats() {
    const [total, active, inactive, with24Hours, withDelivery] = await Promise.all([
      pharmacyRepo.count(),
      pharmacyRepo.count({ isActive: true }),
      pharmacyRepo.count({ isActive: false }),
      pharmacyRepo.count({ is24Hours: true, isActive: true }),
      pharmacyRepo.count({ deliveryAvailable: true, isActive: true })
    ]);

    return {
      total,
      active,
      inactive,
      with24Hours,
      withDelivery
    };
  }

  // Haversine formula to calculate distance between two coordinates
  _calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this._toRad(lat2 - lat1);
    const dLon = this._toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this._toRad(lat1)) * Math.cos(this._toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  _toRad(degrees) {
    return degrees * (Math.PI / 180);
  }
}

export default new PharmacyService();
