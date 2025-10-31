import appointmentRepo from '../repositories/appointment.repository.js';
import patientRepo from '../repositories/patient.repository.js';
import doctorRepo from '../repositories/doctor.repository.js';
import { ConflictError, NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';

class AppointmentService {
  async createAppointment(input, createdBy) {
    const { patientId, doctorId, startAt, endAt, type, reason, notes, meetingLink } = input;

    // Validate patient exists
    const patient = await patientRepo.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Validate doctor exists
    const doctor = await doctorRepo.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    if (!doctor.isAvailable) {
      throw new ValidationError('Doctor is not available for appointments');
    }

    // Validate dates
    const start = new Date(startAt);
    const end = new Date(endAt);
    const now = new Date();

    if (start < now) {
      throw new ValidationError('Cannot create appointment in the past');
    }

    if (end <= start) {
      throw new ValidationError('End time must be after start time');
    }

    const durationMinutes = Math.round((end - start) / (1000 * 60));
    if (durationMinutes < 5) {
      throw new ValidationError('Appointment must be at least 5 minutes long');
    }

    // Check for conflicts
    const conflicts = await appointmentRepo.findOverlapping(doctorId, start, end);
    if (conflicts.length > 0) {
      throw new ConflictError('Doctor has a conflicting appointment at this time');
    }

    // Check if appointment is within doctor's working hours
    const dayOfWeek = this._getDayName(start);
    const workingHours = doctor.workingHours?.[dayOfWeek];
    
    if (!workingHours || workingHours.length === 0) {
      throw new ValidationError(`Doctor does not work on ${dayOfWeek}s`);
    }

    const isWithinWorkingHours = this._isWithinWorkingHours(start, end, workingHours);
    if (!isWithinWorkingHours) {
      throw new ValidationError('Appointment is outside doctor\'s working hours');
    }

    // Check max daily appointments if set
    if (doctor.maxDailyAppointments) {
      const appointmentCount = await appointmentRepo.countByDoctor(doctorId, start);
      if (appointmentCount >= doctor.maxDailyAppointments) {
        throw new ConflictError('Doctor has reached maximum appointments for this day');
      }
    }

    // Create appointment
    const appointment = await appointmentRepo.create({
      patientId,
      doctorId,
      startAt: start,
      endAt: end,
      type,
      reason,
      notes,
      meetingLink: type === 'virtual' ? meetingLink : null,
      status: 'scheduled',
      createdBy
    });

    return appointmentRepo.findById(appointment._id);
  }

  async listAppointments(params, userId, userRole) {
    const { page = 1, limit = 20, sortBy = 'startAt', sortOrder = 'desc', ...filters } = params;
    
    // Apply role-based filtering
    const filter = appointmentRepo.buildFilter(filters);
    
    // If user is a patient, only show their appointments
    if (userRole === 'patient') {
      const patient = await patientRepo.findByUserId(userId);
      if (!patient) {
        throw new NotFoundError('Patient profile not found');
      }
      filter.patientId = patient._id;
    }
    
    // If user is a doctor, optionally filter to their appointments
    if (userRole === 'doctor' && !filters.doctorId) {
      const doctor = await doctorRepo.findByUserId(userId);
      if (doctor) {
        filter.doctorId = doctor._id;
      }
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    return appointmentRepo.list({ page, limit, filter, sort });
  }

  async getAppointmentById(id, userId, userRole) {
    const appointment = await appointmentRepo.findById(id);
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    // Check access permissions
    await this._checkAccessPermission(appointment, userId, userRole);

    return appointment;
  }

  async updateAppointment(id, input, updatedBy, userRole) {
    const appointment = await appointmentRepo.findByIdSimple(id);
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    // Check access permissions
    await this._checkAccessPermission(appointment, updatedBy, userRole);

    // Cannot update completed or cancelled appointments
    if (appointment.status === 'completed') {
      throw new ValidationError('Cannot update completed appointment');
    }

    if (appointment.status === 'cancelled') {
      throw new ValidationError('Cannot update cancelled appointment');
    }

    const updates = { updatedBy };

    // Handle time changes
    if (input.startAt || input.endAt) {
      const newStart = input.startAt ? new Date(input.startAt) : appointment.startAt;
      const newEnd = input.endAt ? new Date(input.endAt) : appointment.endAt;

      if (newStart < new Date()) {
        throw new ValidationError('Cannot reschedule appointment to the past');
      }

      if (newEnd <= newStart) {
        throw new ValidationError('End time must be after start time');
      }

      // Check for conflicts (excluding current appointment)
      const conflicts = await appointmentRepo.findOverlapping(
        appointment.doctorId,
        newStart,
        newEnd,
        appointment._id
      );

      if (conflicts.length > 0) {
        throw new ConflictError('Doctor has a conflicting appointment at this time');
      }

      updates.startAt = newStart;
      updates.endAt = newEnd;
      updates.reminderSentAt = null; // Reset reminder if time changed
    }

    // Update other fields
    if (input.type !== undefined) updates.type = input.type;
    if (input.reason !== undefined) updates.reason = input.reason;
    if (input.notes !== undefined) updates.notes = input.notes;
    if (input.meetingLink !== undefined) {
      updates.meetingLink = updates.type === 'virtual' ? input.meetingLink : null;
    }

    return appointmentRepo.updateById(id, updates);
  }

  async cancelAppointment(id, cancellationReason, cancelledBy, userRole) {
    const appointment = await appointmentRepo.findByIdSimple(id);
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    // Check access permissions
    await this._checkAccessPermission(appointment, cancelledBy, userRole);

    if (!appointment.canBeCancelled()) {
      throw new ValidationError('Appointment cannot be cancelled');
    }

    return appointmentRepo.updateById(id, {
      status: 'cancelled',
      cancellationReason,
      cancelledAt: new Date(),
      cancelledBy,
      updatedBy: cancelledBy
    });
  }

  async completeAppointment(id, notes, completedBy) {
    const appointment = await appointmentRepo.findByIdSimple(id);
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    if (!appointment.canBeCompleted()) {
      throw new ValidationError('Only scheduled appointments can be marked as completed');
    }

    const updates = {
      status: 'completed',
      completedAt: new Date(),
      updatedBy: completedBy
    };

    if (notes) {
      updates.notes = appointment.notes ? `${appointment.notes}\n\n${notes}` : notes;
    }

    return appointmentRepo.updateById(id, updates);
  }

  async markAsNoShow(id, updatedBy) {
    const appointment = await appointmentRepo.findByIdSimple(id);
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    if (appointment.status !== 'scheduled') {
      throw new ValidationError('Only scheduled appointments can be marked as no-show');
    }

    return appointmentRepo.updateById(id, {
      status: 'no_show',
      updatedBy
    });
  }

  async getMyAppointments(userId, userRole, options = {}) {
    if (userRole === 'patient') {
      const patient = await patientRepo.findByUserId(userId);
      if (!patient) {
        throw new NotFoundError('Patient profile not found');
      }
      return appointmentRepo.findByPatientId(patient._id, options);
    }

    if (userRole === 'doctor') {
      const doctor = await doctorRepo.findByUserId(userId);
      if (!doctor) {
        throw new NotFoundError('Doctor profile not found');
      }
      return appointmentRepo.findByDoctorId(doctor._id, options);
    }

    throw new ForbiddenError('Only patients and doctors can view their appointments');
  }

  async getDoctorAppointments(doctorId, options = {}) {
    const doctor = await doctorRepo.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    return appointmentRepo.findByDoctorId(doctorId, options);
  }

  async getPatientAppointments(patientId, options = {}) {
    const patient = await patientRepo.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    return appointmentRepo.findByPatientId(patientId, options);
  }

  async checkAvailability(doctorId, date, durationMinutes = 30) {
    const doctor = await doctorRepo.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    if (!doctor.isAvailable) {
      return { available: false, slots: [], message: 'Doctor is not available' };
    }

    const targetDate = new Date(date);
    const dayName = this._getDayName(targetDate);
    const workingHours = doctor.workingHours?.[dayName];

    if (!workingHours || workingHours.length === 0) {
      return { available: false, slots: [], message: `Doctor does not work on ${dayName}s` };
    }

    // Get all scheduled appointments for this doctor on this date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await appointmentRepo.findByDoctorId(doctor._id, {
      status: 'scheduled',
      startDate: startOfDay,
      endDate: endOfDay
    });

    // Generate available slots
    const slots = this._generateAvailableSlots(
      targetDate,
      workingHours,
      appointments,
      durationMinutes,
      doctor.bufferMinutes || 0
    );

    return {
      available: slots.length > 0,
      slots,
      doctorId: doctor._id,
      date: targetDate,
      durationMinutes
    };
  }

  // Private helper methods
  _getDayName(date) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  _isWithinWorkingHours(startAt, endAt, workingHours) {
    const startTime = this._formatTime(startAt);
    const endTime = this._formatTime(endAt);

    return workingHours.some(slot => {
      return startTime >= slot.start && endTime <= slot.end;
    });
  }

  _formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  _generateAvailableSlots(date, workingHours, appointments, durationMinutes, bufferMinutes) {
    const slots = [];
    const now = new Date();

    for (const slot of workingHours) {
      const [startHour, startMin] = slot.start.split(':').map(Number);
      const [endHour, endMin] = slot.end.split(':').map(Number);

      let currentTime = new Date(date);
      currentTime.setHours(startHour, startMin, 0, 0);

      const slotEnd = new Date(date);
      slotEnd.setHours(endHour, endMin, 0, 0);

      while (currentTime < slotEnd) {
        const slotStart = new Date(currentTime);
        const slotEndTime = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);

        // Skip if slot end exceeds working hours
        if (slotEndTime > slotEnd) break;

        // Skip if slot is in the past
        if (slotStart <= now) {
          currentTime = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);
          continue;
        }

        // Check if slot conflicts with existing appointments
        const hasConflict = appointments.some(apt => {
          const aptStart = new Date(apt.startAt);
          const aptEnd = new Date(apt.endAt);
          return (slotStart < aptEnd && slotEndTime > aptStart);
        });

        if (!hasConflict) {
          slots.push({
            startAt: slotStart.toISOString(),
            endAt: slotEndTime.toISOString(),
            available: true
          });
        }

        // Move to next slot (duration + buffer)
        currentTime = new Date(currentTime.getTime() + (durationMinutes + bufferMinutes) * 60 * 1000);
      }
    }

    return slots;
  }

  async _checkAccessPermission(appointment, userId, userRole) {
    // Admins, nurses, and secretaries can access all appointments
    if (['admin', 'nurse', 'secretary'].includes(userRole)) {
      return;
    }

    // Doctors can access their own appointments
    if (userRole === 'doctor') {
      const doctor = await doctorRepo.findByUserId(userId);
      if (doctor && String(appointment.doctorId) === String(doctor._id)) {
        return;
      }
    }

    // Patients can access their own appointments
    if (userRole === 'patient') {
      const patient = await patientRepo.findByUserId(userId);
      if (patient && String(appointment.patientId) === String(patient._id)) {
        return;
      }
    }

    throw new ForbiddenError('You do not have permission to access this appointment');
  }
}

export default new AppointmentService();
