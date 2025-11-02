import Prescription from '../models/prescription.model.js';

class PrescriptionRepository {
  async create(data) {
    const prescription = new Prescription(data);
    return prescription.save();
  }

  async findById(id) {
    return Prescription.findById(id)
      .populate('consultationId', 'consultationDate chiefComplaint')
      .populate({
        path: 'patientId',
        select: 'userId dateOfBirth gender bloodType allergies',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone'
        }
      })
      .populate({
        path: 'doctorId',
        select: 'userId specialization department licenseNumber',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone'
        }
      })
      .populate('pharmacyId', 'name address phone email')
      .populate('createdBy', 'firstName lastName email')
      .populate('dispensedBy', 'firstName lastName email');
  }

  async findByIdSimple(id) {
    return Prescription.findById(id);
  }

  async list({ page = 1, limit = 20, filter = {}, sort = { prescriptionDate: -1 } }) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Prescription.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('consultationId', 'consultationDate chiefComplaint')
        .populate({
          path: 'patientId',
          select: 'userId',
          populate: {
            path: 'userId',
            select: 'firstName lastName'
          }
        })
        .populate({
          path: 'doctorId',
          select: 'userId specialization',
          populate: {
            path: 'userId',
            select: 'firstName lastName'
          }
        })
        .populate('pharmacyId', 'name'),
      Prescription.countDocuments(filter)
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findByPatientId(patientId, options = {}) {
    const { limit = 50, startDate, endDate } = options;
    
    const filter = { patientId };
    
    if (startDate || endDate) {
      filter.prescriptionDate = {};
      if (startDate) filter.prescriptionDate.$gte = new Date(startDate);
      if (endDate) filter.prescriptionDate.$lte = new Date(endDate);
    }

    return Prescription.find(filter)
      .sort({ prescriptionDate: -1 })
      .limit(limit)
      .populate({
        path: 'doctorId',
        select: 'userId specialization',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('pharmacyId', 'name address phone');
  }

  async findByDoctorId(doctorId, options = {}) {
    const { limit = 50, startDate, endDate } = options;
    
    const filter = { doctorId };
    
    if (startDate || endDate) {
      filter.prescriptionDate = {};
      if (startDate) filter.prescriptionDate.$gte = new Date(startDate);
      if (endDate) filter.prescriptionDate.$lte = new Date(endDate);
    }

    return Prescription.find(filter)
      .sort({ prescriptionDate: -1 })
      .limit(limit)
      .populate({
        path: 'patientId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('pharmacyId', 'name');
  }

  async findByPharmacyId(pharmacyId, options = {}) {
    const { limit = 50, status } = options;
    
    const filter = { pharmacyId };
    if (status) filter.status = status;

    return Prescription.find(filter)
      .sort({ sentAt: -1 })
      .limit(limit)
      .populate({
        path: 'patientId',
        select: 'userId dateOfBirth',
        populate: {
          path: 'userId',
          select: 'firstName lastName phone'
        }
      })
      .populate({
        path: 'doctorId',
        select: 'userId specialization',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      });
  }

  async findByConsultationId(consultationId) {
    return Prescription.find({ consultationId })
      .populate('pharmacyId', 'name address phone');
  }

  async update(id, data) {
    return Prescription.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async delete(id) {
    return Prescription.findByIdAndDelete(id);
  }

  async countByStatus(filter = {}) {
    return Prescription.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getActiveForPatient(patientId) {
    return Prescription.getActiveForPatient(patientId);
  }

  async getPendingForPharmacy(pharmacyId) {
    return Prescription.getPendingForPharmacy(pharmacyId);
  }

  buildFilter(params) {
    const filter = {};

    if (params.patientId) filter.patientId = params.patientId;
    if (params.doctorId) filter.doctorId = params.doctorId;
    if (params.pharmacyId) filter.pharmacyId = params.pharmacyId;
    if (params.consultationId) filter.consultationId = params.consultationId;
    if (params.status) filter.status = params.status;

    if (params.startDate || params.endDate) {
      filter.prescriptionDate = {};
      if (params.startDate) filter.prescriptionDate.$gte = new Date(params.startDate);
      if (params.endDate) filter.prescriptionDate.$lte = new Date(params.endDate);
    }

    if (params.search) {
      filter.$or = [
        { 'medications.name': { $regex: params.search, $options: 'i' } },
        { 'medications.genericName': { $regex: params.search, $options: 'i' } },
        { notes: { $regex: params.search, $options: 'i' } }
      ];
    }

    return filter;
  }
}

export default new PrescriptionRepository();
