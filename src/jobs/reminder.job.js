import cron from 'node-cron';
import appointmentRepo from '../repositories/appointment.repository.js';
import { addEmailToQueue } from '../queues/email.queue.js';
import logger from '../config/logger.js';

/**
 * Appointment Reminder Job
 * Runs every hour to check for appointments 24 hours in advance
 * Sends email reminders to patients
 */
export function startReminderJob() {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running appointment reminder job...');
      
      const now = new Date();
      const reminderWindow = {
        start: new Date(now.getTime() + 23 * 60 * 60 * 1000), // 23 hours from now
        end: new Date(now.getTime() + 24 * 60 * 60 * 1000)    // 24 hours from now
      };

      // Find scheduled appointments in the 24-hour window that haven't been reminded
      const appointments = await appointmentRepo.findPendingReminders(
        reminderWindow.start,
        reminderWindow.end
      );

      logger.info(`Found ${appointments.length} appointments needing reminders`);

      let successCount = 0;
      let failureCount = 0;

      for (const appointment of appointments) {
        try {
          // Extract patient and doctor info
          const patient = appointment.patientId;
          const doctor = appointment.doctorId;
          const patientUser = patient?.userId;
          const doctorUser = doctor?.userId;

          // Debug logging
          logger.info('Processing appointment:', {
            appointmentId: appointment._id,
            hasPatient: !!patient,
            hasPatientUser: !!patientUser,
            patientEmail: patientUser?.email
          });

          if (!patientUser || !patientUser.email) {
            logger.warn(`No email found for patient in appointment ${appointment._id}`, {
              hasPatient: !!patient,
              hasPatientUser: !!patientUser,
              patientUserId: patientUser?._id
            });
            failureCount++;
            continue;
          }

          // Format appointment details
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

          // Queue reminder email
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

          // Mark reminder as sent
          await appointmentRepo.markReminderSent(appointment._id);
          
          successCount++;
          logger.info(`Reminder queued for appointment ${appointment._id}`);
        } catch (error) {
          failureCount++;
          logger.error(`Failed to queue reminder for appointment ${appointment._id}:`, error.message);
        }
      }

      logger.info(`Reminder job completed: ${successCount} sent, ${failureCount} failed`);
    } catch (error) {
      logger.error('Appointment reminder job failed:', error);
    }
  });

  logger.info('Appointment reminder job scheduled (runs every hour)');
}

/**
 * Manual trigger for testing
 */
export async function triggerReminderJobManually() {
  logger.info('Manually triggering appointment reminder job...');
  
  const now = new Date();
  const reminderWindow = {
    start: new Date(now.getTime() + 23 * 60 * 60 * 1000),
    end: new Date(now.getTime() + 24 * 60 * 60 * 1000)
  };

  const appointments = await appointmentRepo.findPendingReminders(
    reminderWindow.start,
    reminderWindow.end
  );

  logger.info(`Found ${appointments.length} appointments for manual reminder`);
  return appointments;
}
