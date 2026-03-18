insert into donation_allocation (
    id,
    donor_user_id,
    charity_id,
    donor_point_account_id,
    charity_point_account_id,
    allocated_points,
    remaining_points,
    status,
    created_at
) values
    (9002, 101, 1002, 4001, 5002, 10000, 10000, 'ACTIVE', timestamp '2026-03-02 12:00:00');

insert into point_ledger_entry (
    id,
    point_account_id,
    entry_type,
    points_delta,
    reference_type,
    reference_id,
    description,
    created_at
) values
    (8005, 4001, 'ALLOCATION_DEBIT', -10000, 'DONATION_ALLOCATION', 9002, 'Donor allocated points to Bright Meal.', timestamp '2026-03-02 12:00:00'),
    (8006, 5002, 'ALLOCATION_CREDIT', 10000, 'DONATION_ALLOCATION', 9002, 'Charity wallet received allocated donor points.', timestamp '2026-03-02 12:00:00');

insert into audit_event (id, actor_user_id, target_type, target_id, action, event_data, created_at) values
    (11004, 101, 'DONATION_ALLOCATION', 9002, 'ALLOCATION_CREATED', '{"charityId":1002,"allocatedPoints":10000}', timestamp '2026-03-02 12:00:00');
