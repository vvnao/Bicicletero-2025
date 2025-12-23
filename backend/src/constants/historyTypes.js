// constants/historyTypes.js
export const HISTORY_TYPES = {
    // Usuarios
    USER_CHECKIN: 'user_checkin',
    USER_CHECKOUT: 'user_checkout',
    USER_REGISTRATION_REQUEST: 'user_registration_request',
    USER_STATUS_CHANGE: 'user_status_change',
    
    // Guardias
    GUARD_ASSIGNMENT: 'guard_assignment',
    GUARD_ASSIGNMENT_UPDATE: 'guard_assignment_update',
    GUARD_ASSIGNMENT_DEACTIVATE: 'guard_assignment_deactivate',
    GUARD_SHIFT_START: 'guard_shift_start',
    GUARD_SHIFT_END: 'guard_shift_end',
    GUARD_STATUS_CHANGE: 'guard_status_change',
    
    // Reservas
    RESERVATION_CREATE: 'reservation_create',
    RESERVATION_CANCEL: 'reservation_cancel',
    RESERVATION_ACTIVATE: 'reservation_activate',
    RESERVATION_COMPLETE: 'reservation_complete',
    RESERVATION_EXPIRE: 'reservation_expire',
    
    // Bicicletas
    BICYCLE_REGISTRATION: 'bicycle_registration',
    BICYCLE_UPDATE: 'bicycle_update',
    BICYCLE_DELETE: 'bicycle_delete',
    
    // Bicicleteros
    BIKERACK_CREATE: 'bikerack_create',
    BIKERACK_UPDATE: 'bikerack_update',
    BIKERACK_DELETE: 'bikerack_delete',
    
    // Espacios
    SPACE_CREATE: 'space_create',
    SPACE_UPDATE: 'space_update',
    SPACE_STATUS_CHANGE: 'space_status_change',
    
    // Incidencias
    INCIDENCE_REPORT: 'incidence_report',
    INCIDENCE_RESOLVE: 'incidence_resolve',
    
    // Sistema
    SYSTEM_NOTIFICATION: 'system_notification',
    ADMIN_ACTION: 'admin_action',
    ERROR_LOG: 'error_log'
};