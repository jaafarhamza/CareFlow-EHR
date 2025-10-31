import Appointment from '../models/appointment.model.js';

class AppointmentRepository {
  async create(data) {
    const appointment = new Appointment(data);
    return appointment.save();
  }

  async findById(id) {
    return Appointment.findById(id)
      .populate('patientId', 'userId')
      .populate('doctorId', 'userId specialization')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .populate('cancelledBy', 'firstName lastName email');
  }

  async findByIdSimple(id) {
    return Appointment.findById(id);
  }

  async updateById(id, data) {
    return Appointment.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('patientId', 'userId')
      .populate('doctorId', 'userId specialization')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async deleteById(id) {
    return Appointment.findByIdAndDelete(id);
  }

  async list({ page = 1, limit = 20, filter = {}, sort = { startAt: -1 } }) {
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      Appointment.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('patientId', 'userId')
        .populate('doctorId', 'userId specialization')
        .populate('createdBy', 'firstName lastName email'),
      Appointment.countDocuments(filter)
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
    const { status, startDate, endDate, limit = 50 } = options;
    const filter = { patientId };

    if (status) {
      filter.status = Array.isArray(status) ? { $in: status } : status;
    }

    if (startDate || endDate) {
      filter.startAt = {};
      if (startDate) filter.startAt.$gte = new Date(startDate);
      if (endDate) filter.startAt.$lte = new Date(endDate);
    }

    return Appointment.find(filter)
      .sort({ startAt: -1 })
      .limit(limit)
      .populate('doctorId', 'userId specialization')
      .populate('createdBy', 'firstName lastName email');
  }

  async findByDoctorId(doctorId, options = {}) {
    const { status, startDate, endDate, limit = 50 } = options;
    const filter = { doctorId };

    if (status) {
      filter.status = Array.isArray(status) ? { $in: status } : status;
    }

    if (startDate || endDate) {
      filter.startAt = {};
      if (startDate) filter.startAt.$gte = new Date(startDate);
      if (endDate) filter.startAt.$lte = new Date(endDate);
    }

    return Appointment.find(filter)
      .sort({ startAt: 1 })
      .limit(limit)
      .populate('patientId', 'userId')
      .populate('createdBy', 'firstName lastName email');
  }

  async findOverlapping(doctorId, startAt, endAt, excludeId = null) {
    return Appointment.findOverlapping(doctorId, startAt, endAt, excludeId);
  }

  async findUpcomingForReminders(hoursAhead = 24) {
    const now = new Date();
    const targetTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    const oneHourBefore = new Date(targetTime.getTime() - 60 * 60 * 1000);
    const oneHourAfter = new Date(targetTime.getTime() + 60 * 60 * 1000);

    return Appointment.find({
      status: 'scheduled',
      startAt: { $gte: oneHourBefore, $lte: oneHourAfter },
      reminderSentAt: null
    })
      .populate('patientId', 'userId')
      .populate('doctorId', 'userId specialization');
  }

  async markReminderSent(id) {
    return Appointment.findByIdAndUpdate(
      id,
      { reminderSentAt: new Date() },
      { new: true }
    );
  }

  async countByDoctor(doctorId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Appointment.countDocuments({
      doctorId,
      status: { $in: ['scheduled', 'completed'] },
      startAt: { $gte: startOfDay, $lte: endOfDay }
    });
  }

  buildFilter(params) {
    const filter = {};

    if (params.patientId) filter.patientId = params.patientId;
    if (params.doctorId) filter.doctorId = params.doctorId;
    if (params.status) {
      filter.status = Array.isArray(params.status) ? { $in: params.status } : params.status;
    }
    if (params.type) filter.type = params.type;

    if (params.startDate || params.endDate) {
      filter.startAt = {};
      if (params.startDate) filter.startAt.$gte = new Date(params.startDate);
      if (params.endDate) filter.startAt.$lte = new Date(params.endDate);
    }

    return filter;
  }

  async findPendingReminders(startWindow, endWindow) {
    const appointments = await Appointment.find({
      status: 'scheduled',
      startAt: {
        $gte: startWindow,
        $lte: endWindow
      },
      reminderSentAt: null
    })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName email' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .sort({ startAt: 1 });

    // Debug: Log what we found
    console.log(`Found ${appointments.length} appointments in reminder window`);
    appointments.forEach(apt => {
      console.log('Appointment:', {
        id: apt._id,
        patientId: apt.patientId?._id,
        patientUserId: apt.patientId?.userId?._id,
        patientEmail: apt.patientId?.userId?.email,
        doctorId: apt.doctorId?._id
      });
    });

    return appointments;
  }

  async markReminderSent(appointmentId) {
    return Appointment.findByIdAndUpdate(
      appointmentId,
      { reminderSentAt: new Date() },
      { new: true }
    );
  }
}

export default new AppointmentRepository();
