import LabResult from '../models/labResult.model.js';

class LabResultRepository {
  async create(labResultData) {
    const labResult = new LabResult(labResultData);
    await labResult.save();
    return this.findById(labResult._id);
  }

  async findById(id) {
    return LabResult.findById(id)
      .populate({
        path: 'labOrderId',
        populate: [
          { path: 'consultationId', select: 'consultationDate chiefComplaint' },
          { 
            path: 'patientId',
            populate: { path: 'userId', select: 'firstName lastName email' }
          },
          {
            path: 'doctorId',
            populate: { path: 'userId', select: 'firstName lastName email' }
          }
        ]
      })
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone dateOfBirth'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate('performedBy', 'firstName lastName email')
      .populate('validatedBy', 'firstName lastName email')
      .populate('releasedBy', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('pdfReport.uploadedBy', 'firstName lastName');
  }

  async findByIdSimple(id) {
    return LabResult.findById(id);
  }

  async findByLabOrderId(labOrderId) {
    return LabResult.findByLabOrderId(labOrderId);
  }

  async update(id, updates) {
    return LabResult.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
  }

  async delete(id) {
    return LabResult.findByIdAndDelete(id);
  }

  async list(options = {}) {
    const {
      page = 1,
      limit = 20,
      filter = {},
      sort = { performedDate: -1 }
    } = options;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      LabResult.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'patientId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          }
        })
        .populate({
          path: 'doctorId',
          select: '-permissions',
          populate: {
            path: 'userId',
            select: 'firstName lastName'
          }
        })
        .populate('labOrderId', 'orderNumber priority tests')
        .populate('performedBy', 'firstName lastName')
        .populate('validatedBy', 'firstName lastName'),
      LabResult.countDocuments(filter)
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  buildFilter(params) {
    const filter = {};

    if (params.status) {
      filter.status = params.status;
    }

    if (params.patientId) {
      filter.patientId = params.patientId;
    }

    if (params.doctorId) {
      filter.doctorId = params.doctorId;
    }

    if (params.labOrderId) {
      filter.labOrderId = params.labOrderId;
    }

    if (params.hasCriticalValues !== undefined) {
      filter.hasCriticalValues = params.hasCriticalValues === 'true';
    }

    if (params.hasAbnormalValues !== undefined) {
      filter.hasAbnormalValues = params.hasAbnormalValues === 'true';
    }

    if (params.performedBy) {
      filter.performedBy = params.performedBy;
    }

    if (params.validatedBy) {
      filter.validatedBy = params.validatedBy;
    }

    if (params.fromDate || params.toDate) {
      filter.performedDate = {};
      if (params.fromDate) {
        filter.performedDate.$gte = new Date(params.fromDate);
      }
      if (params.toDate) {
        filter.performedDate.$lte = new Date(params.toDate);
      }
    }

    if (params.search) {
      filter.$or = [
        { 'results.testName': { $regex: params.search, $options: 'i' } },
        { 'results.testCode': { $regex: params.search, $options: 'i' } }
      ];
    }

    return filter;
  }

  async findByPatientId(patientId, options = {}) {
    const { status, limit = 50 } = options;
    const query = { patientId };
    
    if (status) {
      query.status = status;
    }

    return LabResult.find(query)
      .sort({ performedDate: -1 })
      .limit(limit)
      .populate('doctorId', 'userId specialization')
      .populate('labOrderId', 'orderNumber tests')
      .populate('performedBy', 'firstName lastName')
      .populate('validatedBy', 'firstName lastName');
  }

  async findByDoctorId(doctorId, options = {}) {
    const { status, limit = 50 } = options;
    const query = { doctorId };
    
    if (status) {
      query.status = status;
    }

    return LabResult.find(query)
      .sort({ performedDate: -1 })
      .limit(limit)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('labOrderId', 'orderNumber tests')
      .populate('performedBy', 'firstName lastName')
      .populate('validatedBy', 'firstName lastName');
  }

  async findCritical(options = {}) {
    return LabResult.findCritical(options);
  }

  async findPendingValidation(options = {}) {
    return LabResult.findPendingValidation(options);
  }

  async findByStatus(status, options = {}) {
    return LabResult.findByStatus(status, options);
  }

  async getStatistics() {
    const stats = await LabResult.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const criticalCount = await LabResult.countDocuments({ 
      hasCriticalValues: true,
      status: 'released'
    });

    const abnormalCount = await LabResult.countDocuments({ 
      hasAbnormalValues: true,
      status: 'released'
    });

    const result = {
      total: 0,
      draft: 0,
      pending_validation: 0,
      validated: 0,
      released: 0,
      critical: criticalCount,
      abnormal: abnormalCount
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  }
}

export default new LabResultRepository();
