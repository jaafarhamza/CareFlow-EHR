import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { attachPermissions, requirePermissions } from '../middlewares/rbac.middleware.js';
import { PERMISSIONS } from '../utils/constants.js';
import { triggerReminderJobManually } from '../jobs/reminder.job.js';
import appointmentRepo from '../repositories/appointment.repository.js';
import { addEmailToQueue } from '../queues/email.queue.js';
import logger from '../config/logger.js';

const router = Router();

router.get(
  '/reminders',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.APPT_READ_ANY),
  async (req, res) => {
    try {
      logger.info('Manual reminder test triggered by user:', req.user.sub);
      
      const now = new Date();
      const reminderWindow = {
        start: new Date(now.getTime() + 23 * 60 * 60 * 1000),
        end: new Date(now.getTime() + 24 * 60 * 60 * 1000)
      };

      const appointments = await appointmentRepo.findPendingReminders(
        reminderWindow.start,
        reminderWindow.end
      );

      logger.info(`Found ${appointments.length} appointments for testing`);

      const results = [];
      for (const appointment of appointments) {
        const patient = appointment.patientId;
        const doctor = appointment.doctorId;
        const patientUser = patient?.userId;
        const doctorUser = doctor?.userId;

        if (!patientUser || !patientUser.email) {
          results.push({
            appointmentId: appointment._id,
            status: 'skipped',
            reason: 'No patient email'
          });
          continue;
        }

        const appointmentDate = new Date(appointment.startAt);
        const appointmentTime = appointmentDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        const appointmentDay = appointmentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        await addEmailToQueue('appointment-reminder', {
          email: patientUser.email,
          patientName: `${patientUser.firstName} ${patientUser.lastName}`,
          doctorName: doctorUser ? `Dr. ${doctorUser.firstName} ${doctorUser.lastName}` : 'Your Doctor',
          doctorSpecialization: doctor.specialization || '',
          appointmentDate: appointmentDay,
          appointmentTime: appointmentTime,
          appointmentType: appointment.type,
          meetingLink: appointment.meetingLink,
          reason: appointment.reason,
          appointmentId: appointment._id
        });

        await appointmentRepo.markReminderSent(appointment._id);

        results.push({
          appointmentId: appointment._id,
          patientEmail: patientUser.email,
          patientName: `${patientUser.firstName} ${patientUser.lastName}`,
          doctorName: doctorUser ? `Dr. ${doctorUser.firstName} ${doctorUser.lastName}` : 'Unknown',
          appointmentTime: `${appointmentDay} at ${appointmentTime}`,
          status: 'queued'
        });
      }

      res.json({
        success: true,
        message: `Processed ${appointments.length} appointments`,
        reminderWindow: {
          start: reminderWindow.start,
          end: reminderWindow.end
        },
        results
      });
    } catch (error) {
      logger.error('Test reminder failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test reminders',
        error: error.message
      });
    }
  }
);

/**
 * Test reminder for specific appointment (bypass 24h window)
 * POST /api/test/reminder/:id
 */
router.post(
  '/reminder/:id',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.APPT_READ_ANY),
  async (req, res) => {
    try {
      const Appointment = (await import('../models/appointment.model.js')).default;
      
      const appointment = await Appointment.findById(req.params.id)
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'firstName lastName email' }
        })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'firstName lastName' }
        });
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      const patient = appointment.patientId;
      const doctor = appointment.doctorId;
      const patientUser = patient?.userId;
      const doctorUser = doctor?.userId;

      logger.info('Appointment data:', {
        appointmentId: appointment._id,
        patientId: patient?._id,
        patientUserId: patientUser?._id,
        patientEmail: patientUser?.email,
        hasPatient: !!patient,
        hasPatientUser: !!patientUser,
        hasEmail: !!patientUser?.email
      });

      if (!patientUser || !patientUser.email) {
        return res.status(400).json({
          success: false,
          message: 'Patient has no email address',
          debug: {
            hasPatient: !!patient,
            hasPatientUser: !!patientUser,
            hasEmail: !!patientUser?.email,
            patientUserId: patientUser?._id
          }
        });
      }

      const appointmentDate = new Date(appointment.startAt);
      const appointmentTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const appointmentDay = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      await addEmailToQueue('appointment-reminder', {
        email: patientUser.email,
        patientName: `${patientUser.firstName} ${patientUser.lastName}`,
        doctorName: doctorUser ? `Dr. ${doctorUser.firstName} ${doctorUser.lastName}` : 'Your Doctor',
        doctorSpecialization: doctor.specialization || '',
        appointmentDate: appointmentDay,
        appointmentTime: appointmentTime,
        appointmentType: appointment.type,
        meetingLink: appointment.meetingLink,
        reason: appointment.reason,
        appointmentId: appointment._id
      });

      logger.info(`Test reminder sent for appointment ${appointment._id} to ${patientUser.email}`);

      res.json({
        success: true,
        message: 'Reminder email queued successfully',
        appointment: {
          id: appointment._id,
          patientEmail: patientUser.email,
          patientName: `${patientUser.firstName} ${patientUser.lastName}`,
          doctorName: doctorUser ? `Dr. ${doctorUser.firstName} ${doctorUser.lastName}` : 'Unknown',
          appointmentTime: `${appointmentDay} at ${appointmentTime}`,
          type: appointment.type
        }
      });
    } catch (error) {
      logger.error('Test reminder for specific appointment failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test reminder',
        error: error.message
      });
    }
  }
);

export default router;
