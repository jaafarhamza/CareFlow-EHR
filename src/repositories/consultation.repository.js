import Consultation from '../models/consultation.model.js';

class ConsultationRepository {
  async create(data) {
    const consultation = new Consultation(data);
    return consultation.save();
  }

  async findById(id) {
    return Consultation.findById(id)
      .populate('appointmentId', 'startAt endAt type status')
      .populate('patientId', 'userId dateOfBirth gender bloodType')
      .populate('doctorId', 'userId specialization department')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async findByIdSimple(id) {
    return Consultation.findById(id);
  }

  async updateById(id, data) {
    return Consultation.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('appointmentId', 'startAt endAt type status')
      .populate('patientId', 'userId dateOfBirth gender bloodType')
      .populate('doctorId', 'userId specialization department')
      .populate('updatedBy', 'firstName lastName email');
  }

  async deleteById(id) {
    return Consultation.findByIdAndDelete(id);
  }

  async list({ page = 1, limit = 20, filter = {}, sort = { consultationDate: -1 } }) {
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      Consultation.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('appointmentId', 'startAt endAt type')
        .populate('patientId', 'userId')
        .populate('doctorId', 'userId specialization')
        .populate('createdBy', 'firstName lastName'),
      Consultation.countDocuments(filter)
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
      filter.consultationDate = {};
      if (startDate) filter.consultationDate.$gte = new Date(startDate);
      if (endDate) filter.consultationDate.$lte = new Date(endDate);
    }

    return Consultation.find(filter)
      .sort({ consultationDate: -1 })
      .limit(limit)
      .populate('doctorId', 'userId specialization')
      .populate('appointmentId', 'startAt type')
      .populate('createdBy', 'firstName lastName');
  }

  async findByDoctorId(doctorId, options = {}) {
    const { limit = 50, startDate, endDate } = options;
    const filter = { doctorId };

    if (startDate || endDate) {
      filter.consultationDate = {};
      if (startDate) filter.consultationDate.$gte = new Date(startDate);
      if (endDate) filter.consultationDate.$lte = new Date(endDate);
    }

    return Consultation.find(filter)
      .sort({ consultationDate: -1 })
      .limit(limit)
      .populate('patientId', 'userId dateOfBirth gender')
      .populate('appointmentId', 'startAt type')
      .populate('createdBy', 'firstName lastName');
  }

  async findByAppointmentId(appointmentId) {
    return Consultation.findOne({ appointmentId })
      .populate('patientId', 'userId dateOfBirth gender bloodType')
      .populate('doctorId', 'userId specialization department')
      .populate('createdBy', 'firstName lastName email');
  }

  async countByPatient(patientId, startDate, endDate) {
    const filter = { patientId };
    
    if (startDate || endDate) {
      filter.consultationDate = {};
      if (startDate) filter.consultationDate.$gte = new Date(startDate);
      if (endDate) filter.consultationDate.$lte = new Date(endDate);
    }

    return Consultation.countDocuments(filter);
  }

  async countByDoctor(doctorId, startDate, endDate) {
    const filter = { doctorId };
    
    if (startDate || endDate) {
      filter.consultationDate = {};
      if (startDate) filter.consultationDate.$gte = new Date(startDate);
      if (endDate) filter.consultationDate.$lte = new Date(endDate);
    }

    return Consultation.countDocuments(filter);
  }

  buildFilter(params) {
    const filter = {};

    if (params.patientId) filter.patientId = params.patientId;
    if (params.doctorId) filter.doctorId = params.doctorId;
    if (params.appointmentId) filter.appointmentId = params.appointmentId;

    if (params.startDate || params.endDate) {
      filter.consultationDate = {};
      if (params.startDate) filter.consultationDate.$gte = new Date(params.startDate);
      if (params.endDate) filter.consultationDate.$lte = new Date(params.endDate);
    }

    // Search in chief complaint or diagnoses
    if (params.search) {
      const searchTerm = params.search.trim();
      filter.$or = [
        { chiefComplaint: { $regex: searchTerm, $options: 'i' } },
        { 'diagnoses.description': { $regex: searchTerm, $options: 'i' } },
        { 'diagnoses.icdCode': { $regex: searchTerm, $options: 'i' } }
      ];
    }

    return filter;
  }
}

export default new ConsultationRepository();
