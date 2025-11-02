import pharmacyService from '../services/pharmacy.service.js';

const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

class PharmacyController {
  create = handleAsync(async (req, res) => {
    const pharmacy = await pharmacyService.createPharmacy(
      req.body,
      req.user.sub
    );

    res.status(201).json({
      success: true,
      message: 'Pharmacy created successfully',
      data: pharmacy
    });
  });

  list = handleAsync(async (req, res) => {
    const result = await pharmacyService.listPharmacies(req.query);

    res.status(200).json({
      success: true,
      data: result
    });
  });

  getById = handleAsync(async (req, res) => {
    const pharmacy = await pharmacyService.getPharmacyById(req.params.id);

    res.status(200).json({
      success: true,
      data: pharmacy
    });
  });

  update = handleAsync(async (req, res) => {
    const pharmacy = await pharmacyService.updatePharmacy(
      req.params.id,
      req.body,
      req.user.sub
    );

    res.status(200).json({
      success: true,
      message: 'Pharmacy updated successfully',
      data: pharmacy
    });
  });

  delete = handleAsync(async (req, res) => {
    await pharmacyService.deletePharmacy(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Pharmacy deleted successfully'
    });
  });

  deactivate = handleAsync(async (req, res) => {
    const pharmacy = await pharmacyService.deactivatePharmacy(
      req.params.id,
      req.user.sub
    );

    res.status(200).json({
      success: true,
      message: 'Pharmacy deactivated successfully',
      data: pharmacy
    });
  });

  activate = handleAsync(async (req, res) => {
    const pharmacy = await pharmacyService.activatePharmacy(
      req.params.id,
      req.user.sub
    );

    res.status(200).json({
      success: true,
      message: 'Pharmacy activated successfully',
      data: pharmacy
    });
  });

  findNearby = handleAsync(async (req, res) => {
    const { longitude, latitude, maxDistance, limit } = req.query;
    
    const pharmacies = await pharmacyService.findNearbyPharmacies(
      longitude,
      latitude,
      maxDistance,
      limit
    );

    res.status(200).json({
      success: true,
      data: pharmacies
    });
  });

  findByCity = handleAsync(async (req, res) => {
    const { city } = req.params;
    const pharmacies = await pharmacyService.findPharmaciesByCity(city, req.query);

    res.status(200).json({
      success: true,
      data: pharmacies
    });
  });

  getActive = handleAsync(async (req, res) => {
    const pharmacies = await pharmacyService.getActivePharmacies(req.query);

    res.status(200).json({
      success: true,
      data: pharmacies
    });
  });

  getStats = handleAsync(async (req, res) => {
    const stats = await pharmacyService.getPharmacyStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  });
}

export default new PharmacyController();
