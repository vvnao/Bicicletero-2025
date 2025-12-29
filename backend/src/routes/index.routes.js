'use strict';
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import bicycleRoutes from './bicycle.routes.js';
import profileRoutes from './profile.routes.js';
import reportsRoutes from '../routes/reports.routes.js';
import reviewRoutes from './review.routes.js';
import historyRoutes from './history.routes.js';
import userRequestHistoryRoutes from './userRequestHistory.routes.js';
import guardRoutes from './guard.routes.js';
import guardAssignmentRoutes from './guardAssignment.routes.js';
//! imports silvana
import bikerackRoutes from './bikerack.routes.js';
import spaceManagementRoutes from './spaceManagement.routes.js';
import spaceDetailsRoutes from './spaceDetails.routes.js';
import incidenceRoutes from './incidence.routes.js';
import reservationRoutes from './reservation.routes.js'
import dashboardRoutes from './dashboard.routes.js';

export function routerApi(app) {
  const router = Router();
  app.use('/api', router);

  router.use('/reports', reportsRoutes);
  router.use('/auth', authRoutes);
  router.use('/dashboard', dashboardRoutes);
  router.use('/bicycles', bicycleRoutes);
  router.use('/profile', profileRoutes);
  router.use('/reviews', reviewRoutes);
  router.use('/guards', guardRoutes);
  router.use('/guard-assignments', guardAssignmentRoutes);
  router.use('/history', historyRoutes);
  router.use('/user-request-history', userRequestHistoryRoutes);
  //! rutas de silvana
  router.use('/bikeracks', bikerackRoutes);
  router.use('/space-management', spaceManagementRoutes);
  router.use('/reservations', reservationRoutes);
  router.use('/space-details', spaceDetailsRoutes);
  router.use('/incidences', incidenceRoutes);
}
