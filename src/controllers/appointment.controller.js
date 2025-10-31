import appointmentService from '../services/appointment.service.js';
import { handleAsync } from '../utils/async.util.js';

class AppointmentController {
  create = handleAsync(async (req, res) => {
    const appointment = await appointmentService.createAppointment(
      req.body,
      req.user.sub
    );

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  });

  list = handleAsync(async (req, res) => {
    const result = await appointmentService.listAppointments(
      req.query,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: result
    });
  });

  getById = handleAsync(async (req, res) => {
    const appointment = await appointmentService.getAppointmentById(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: appointment
    });
  });

  update = handleAsync(async (req, res) => {
    const appointment = await appointmentService.updateAppointment(
      req.params.id,
      req.body,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  });

  cancel = handleAsync(async (req, res) => {
    const appointment = await appointmentService.cancelAppointment(
      req.params.id,
      req.body.cancellationReason,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  });

  complete = handleAsync(async (req, res) => {
    const appointment = await appointmentService.completeAppointment(
      req.params.id,
      req.body.notes,
      req.user.sub
    );

    res.status(200).json({
      success: true,
      message: 'Appointment marked as completed',
      data: appointment
    });
  });

  markNoShow = handleAsync(async (req, res) => {
    const appointment = await appointmentService.markAsNoShow(
      req.params.id,
      req.user.sub
    );

    res.status(200).json({
      success: true,
      message: 'Appointment marked as no-show',
      data: appointment
    });
  });

  getMyAppointments = handleAsync(async (req, res) => {
    const appointments = await appointmentService.getMyAppointments(
      req.user.sub,
      req.user.role,
      req.query
    );

    res.status(200).json({
      success: true,
      data: appointments
    });
  });

  getDoctorAppointments = handleAsync(async (req, res) => {
    const appointments = await appointmentService.getDoctorAppointments(
      req.params.doctorId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: appointments
    });
  });

  getPatientAppointments = handleAsync(async (req, res) => {
    const appointments = await appointmentService.getPatientAppointments(
      req.params.patientId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: appointments
    });
  });

  checkAvailability = handleAsync(async (req, res) => {
    const { doctorId, date, durationMinutes } = req.query;
    
    const availability = await appointmentService.checkAvailability(
      doctorId,
      date,
      durationMinutes ? parseInt(durationMinutes) : 30
    );

    res.status(200).json({
      success: true,
      data: availability
    });
  });
}

export default new AppointmentController();
