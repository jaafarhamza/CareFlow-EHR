import LabOrder from '../models/labOrder.model.js';

class LabOrderRepository {
  async create(labOrderData) {
    const labOrder = new LabOrder(labOrderData);
    await labOrder.save();
    return this.findById(labOrder._id);
  }

  async findById(id) {
    return LabOrder.findById(id)
      .populate({
        path: 'consultationId',
        select: 'consultationDate chiefComplaint diagnosis'
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
      .populate('collectedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('results');
  }

  async findByIdSimple(id) {
    return LabOrder.findById(id);
  }

  async findByOrderNumber(orderNumber) {
    return LabOrder.findByOrderNumber(orderNumber);
  }

  async update(id, updates) {
    return LabOrder.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
  }

  async delete(id) {
    return LabOrder.findByIdAndDelete(id);
  }

  async list(options = {}) {
    const {
      page = 1,
      limit = 20,
      filter = {},
      sort = { createdAt: -1 }
    } = options;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      LabOrder.find(filter)
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
          populate: {
            path: 'userId',
            select: 'firstName lastName'
          }
        })
        .populate('assignedTo', 'firstName lastName')
        .populate('results'),
      LabOrder.countDocuments(filter)
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

    if (params.priority) {
      filter.priority = params.priority;
    }

    if (params.patientId) {
      filter.patientId = params.patientId;
    }

    if (params.doctorId) {
      filter.doctorId = params.doctorId;
    }

    if (params.consultationId) {
      filter.consultationId = params.consultationId;
    }

    if (params.assignedTo) {
      filter.assignedTo = params.assignedTo;
    }

    if (params.category) {
      filter['tests.category'] = params.category;
    }

    if (params.fromDate || params.toDate) {
      filter.createdAt = {};
      if (params.fromDate) {
        filter.createdAt.$gte = new Date(params.fromDate);
      }
      if (params.toDate) {
        filter.createdAt.$lte = new Date(params.toDate);
      }
    }

    if (params.search) {
      filter.$or = [
        { orderNumber: { $regex: params.search, $options: 'i' } },
        { 'tests.testName': { $regex: params.search, $options: 'i' } },
        { 'tests.testCode': { $regex: params.search, $options: 'i' } }
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

    return LabOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('doctorId', 'userId specialization')
      .populate('consultationId', 'consultationDate')
      .populate('assignedTo', 'firstName lastName')
      .populate('results');
  }

  async findByDoctorId(doctorId, options = {}) {
    const { status, limit = 50 } = options;
    const query = { doctorId };
    
    if (status) {
      query.status = status;
    }

    return LabOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('consultationId', 'consultationDate')
      .populate('assignedTo', 'firstName lastName')
      .populate('results');
  }

  async findByConsultationId(consultationId) {
    return LabOrder.find({ consultationId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('assignedTo', 'firstName lastName')
      .populate('results');
  }

  async findPending(options = {}) {
    return LabOrder.findPending(options);
  }

  async findByStatus(status, options = {}) {
    return LabOrder.findByStatus(status, options);
  }

  async findUrgent() {
    return LabOrder.findUrgent();
  }

  async getStatistics() {
    const stats = await LabOrder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await LabOrder.aggregate([
      {
        $match: { status: { $in: ['pending', 'collected', 'processing'] } }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      pending: 0,
      collected: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
      urgent: 0,
      stat: 0,
      routine: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    priorityStats.forEach(stat => {
      result[stat._id] = stat.count;
    });

    return result;
  }
}

export default new LabOrderRepository();
