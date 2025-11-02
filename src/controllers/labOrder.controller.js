import labOrderService from '../services/labOrder.service.js';
import { handleAsync } from '../utils/async.util.js';

class LabOrderController {
  create = handleAsync(async (req, res) => {
    const labOrder = await labOrderService.createLabOrder(
      req.body,
      req.user.sub
    );

    res.status(201).json({
      success: true,
      message: 'Lab order created successfully',
      data: labOrder
    });
  });

  list = handleAsync(async (req, res) => {
    const result = await labOrderService.listLabOrders(
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
    const labOrder = await labOrderService.getLabOrderById(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: labOrder
    });
  });

  getByOrderNumber = handleAsync(async (req, res) => {
    const labOrder = await labOrderService.getLabOrderByNumber(
      req.params.orderNumber,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: labOrder
    });
  });

  update = handleAsync(async (req, res) => {
    const labOrder = await labOrderService.updateLabOrder(
      req.params.id,
      req.body,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Lab order updated successfully',
      data: labOrder
    });
  });

  delete = handleAsync(async (req, res) => {
    await labOrderService.deleteLabOrder(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Lab order deleted successfully'
    });
  });

  markAsCollected = handleAsync(async (req, res) => {
    const labOrder = await labOrderService.markAsCollected(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Lab order marked as collected successfully',
      data: labOrder
    });
  });

  startProcessing = handleAsync(async (req, res) => {
    const labOrder = await labOrderService.startProcessing(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Lab order processing started successfully',
      data: labOrder
    });
  });

  markAsCompleted = handleAsync(async (req, res) => {
    const labOrder = await labOrderService.markAsCompleted(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Lab order marked as completed successfully',
      data: labOrder
    });
  });

  cancel = handleAsync(async (req, res) => {
    const labOrder = await labOrderService.cancelLabOrder(
      req.params.id,
      req.body.reason,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Lab order cancelled successfully',
      data: labOrder
    });
  });

  assignTechnician = handleAsync(async (req, res) => {
    const labOrder = await labOrderService.assignTechnician(
      req.params.id,
      req.body.technicianId,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Technician assigned successfully',
      data: labOrder
    });
  });

  getMyLabOrders = handleAsync(async (req, res) => {
    const labOrders = await labOrderService.getMyLabOrders(
      req.user.sub,
      req.user.role,
      req.query
    );

    res.status(200).json({
      success: true,
      data: labOrders
    });
  });

  getByPatient = handleAsync(async (req, res) => {
    const labOrders = await labOrderService.getPatientLabOrders(
      req.params.patientId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: labOrders
    });
  });

  getByDoctor = handleAsync(async (req, res) => {
    const labOrders = await labOrderService.getDoctorLabOrders(
      req.params.doctorId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: labOrders
    });
  });

  getByConsultation = handleAsync(async (req, res) => {
    const labOrders = await labOrderService.getConsultationLabOrders(
      req.params.consultationId
    );

    res.status(200).json({
      success: true,
      data: labOrders
    });
  });

  getPending = handleAsync(async (req, res) => {
    const labOrders = await labOrderService.getPendingLabOrders(req.query);

    res.status(200).json({
      success: true,
      data: labOrders
    });
  });

  getByStatus = handleAsync(async (req, res) => {
    const labOrders = await labOrderService.getLabOrdersByStatus(
      req.params.status,
      req.query
    );

    res.status(200).json({
      success: true,
      data: labOrders
    });
  });

  getUrgent = handleAsync(async (req, res) => {
    const labOrders = await labOrderService.getUrgentLabOrders();

    res.status(200).json({
      success: true,
      data: labOrders
    });
  });

  getStatistics = handleAsync(async (req, res) => {
    const stats = await labOrderService.getStatistics();

    res.status(200).json({
      success: true,
      data: stats
    });
  });
}

export default new LabOrderController();
