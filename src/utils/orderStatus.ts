// Order status management system according to specifications

export type OrderStatus = 
  | 'created'
  | 'arrived_cn'
  | 'packed'
  | 'sent_to_kz'
  | 'in_transit'
  | 'arrived_branch'
  | 'ready_for_pickup'
  | 'issued'
  | 'problem'
  | 'cancelled';

export type EmployeeRole = 'admin' | 'china_worker' | 'branch_worker';

// Allowed status transitions (finite state machine)
export const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  created: ['arrived_cn'],
  arrived_cn: ['packed'],
  packed: ['sent_to_kz'],
  sent_to_kz: ['in_transit'],
  in_transit: ['arrived_branch'],
  arrived_branch: ['ready_for_pickup'],
  ready_for_pickup: ['issued'],
  issued: [], // terminal state
  problem: [], // terminal state (admin can override)
  cancelled: [] // terminal state
};

// Check if a role can perform a specific transition
export function canTransition(
  employeeRole: EmployeeRole, 
  currentStatus: OrderStatus, 
  targetStatus: OrderStatus,
  employeeBranchId?: string,
  orderBranchId?: string
): boolean {
  // Admin can do anything
  if (employeeRole === 'admin') return true;
  
  // Anyone can mark as problem
  if (targetStatus === 'problem') return true;
  
  // Check if transition is allowed in general
  const allowed = allowedTransitions[currentStatus] || [];
  if (!allowed.includes(targetStatus)) return false;
  
  // Role-specific restrictions
  switch (employeeRole) {
    case 'china_worker':
      return ['arrived_cn', 'packed', 'sent_to_kz'].includes(targetStatus);
    
    case 'branch_worker':
      // Can only handle arrivals to their branch and subsequent steps
      if (targetStatus === 'arrived_branch') {
        return true; // Will set their branch_id
      }
      if (['ready_for_pickup', 'issued'].includes(targetStatus)) {
        return employeeBranchId === orderBranchId;
      }
      return false;
    
    default:
      return false;
  }
}

// Get available actions for a role and current status
export function getAvailableActions(
  employeeRole: EmployeeRole,
  currentStatus: OrderStatus,
  employeeBranchId?: string,
  orderBranchId?: string
): OrderStatus[] {
  const possibleTransitions = allowedTransitions[currentStatus] || [];
  
  return possibleTransitions.filter(targetStatus => 
    canTransition(employeeRole, currentStatus, targetStatus, employeeBranchId, orderBranchId)
  );
}

// Get status display name in Russian
export function getStatusDisplayName(status: OrderStatus): string {
  const statusNames: Record<OrderStatus, string> = {
    created: 'Создан',
    arrived_cn: 'Прибыл в Китай',
    packed: 'Упакован',
    sent_to_kz: 'Отправлен в Казахстан',
    in_transit: 'В пути',
    arrived_branch: 'Прибыл в филиал',
    ready_for_pickup: 'Готов к выдаче',
    issued: 'Выдан клиенту',
    problem: 'Проблема',
    cancelled: 'Отменён'
  };
  
  return statusNames[status] || status;
}

// Get status color for UI
export function getStatusColor(status: OrderStatus): string {
  const statusColors: Record<OrderStatus, string> = {
    created: 'bg-gray-100 text-gray-800',
    arrived_cn: 'bg-blue-100 text-blue-800',
    packed: 'bg-indigo-100 text-indigo-800',
    sent_to_kz: 'bg-purple-100 text-purple-800',
    in_transit: 'bg-yellow-100 text-yellow-800',
    arrived_branch: 'bg-orange-100 text-orange-800',
    ready_for_pickup: 'bg-green-100 text-green-800',
    issued: 'bg-emerald-100 text-emerald-800',
    problem: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

// Get action button text
export function getActionButtonText(targetStatus: OrderStatus): string {
  const actionTexts: Record<OrderStatus, string> = {
    created: 'Создать',
    arrived_cn: 'Прибыл в Китай',
    packed: 'Упакован',
    sent_to_kz: 'Отправлен в Казахстан',
    in_transit: 'В пути',
    arrived_branch: 'Прибыл в филиал',
    ready_for_pickup: 'Готов к выдаче',
    issued: 'Выдать клиенту',
    problem: 'Отметить проблему',
    cancelled: 'Отменить'
  };
  
  return actionTexts[targetStatus] || targetStatus;
}