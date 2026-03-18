insert into charity (id, code, name, description, active, created_at) values
    (1001, 'GREEN_SHELTER', 'Green Shelter', 'Provides emergency shelter and daily essentials.', true, timestamp '2026-03-01 09:00:00'),
    (1002, 'BRIGHT_MEAL', 'Bright Meal', 'Supports meal kits and pantry assistance for families.', true, timestamp '2026-03-01 09:05:00');

insert into app_user (id, email, display_name, role, managed_charity_id, active, created_at) values
    (101, 'donor.demo@example.com', 'Demo Donor', 'DONOR', null, true, timestamp '2026-03-01 10:00:00'),
    (201, 'manager.demo@example.com', 'Demo Charity Manager', 'CHARITY_MANAGER', 1001, true, timestamp '2026-03-01 10:05:00'),
    (301, 'admin.demo@example.com', 'Demo Admin', 'ADMIN', null, true, timestamp '2026-03-01 10:10:00');

insert into partner_product (id, sku, name, description, point_cost, active, created_at) values
    (2001, 'HYGIENE-KIT', 'Hygiene Kit', 'Soap, toothbrush, toothpaste, and sanitary care items.', 20000, true, timestamp '2026-03-01 11:00:00'),
    (2002, 'MEAL-BOX', 'Meal Box', 'Ready-to-deliver food box for a household.', 30000, true, timestamp '2026-03-01 11:05:00'),
    (2003, 'BLANKET-SET', 'Blanket Set', 'Blanket and thermal support set for emergency use.', 60000, true, timestamp '2026-03-01 11:10:00');

insert into point_account (id, owner_type, owner_reference_id, account_type, label, created_at) values
    (4001, 'USER', 101, 'DONOR_WALLET', 'Demo Donor Wallet', timestamp '2026-03-01 12:00:00'),
    (5001, 'CHARITY', 1001, 'CHARITY_WALLET', 'Green Shelter Charity Wallet', timestamp '2026-03-01 12:05:00'),
    (5002, 'CHARITY', 1002, 'CHARITY_WALLET', 'Bright Meal Charity Wallet', timestamp '2026-03-01 12:10:00');

insert into payment (id, donor_user_id, external_payment_ref, amount_krw, status, created_at) values
    (6001, 101, 'PAY-DEMO-0001', 120000, 'CONVERTED', timestamp '2026-03-02 09:00:00');

insert into point_conversion (id, payment_id, point_account_id, converted_points, status, created_at) values
    (7001, 6001, 4001, 120000, 'COMPLETED', timestamp '2026-03-02 09:05:00');

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
    (9001, 101, 1001, 4001, 5001, 80000, 20000, 'ACTIVE', timestamp '2026-03-02 10:00:00');

insert into partner_order (
    id,
    charity_id,
    charity_manager_user_id,
    partner_product_id,
    donation_allocation_id,
    quantity,
    total_points,
    status,
    fulfilled_at,
    created_at
) values
    (10001, 1001, 201, 2003, 9001, 1, 60000, 'REQUESTED', null, timestamp '2026-03-02 11:00:00');

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
    (8001, 4001, 'CONVERSION_CREDIT', 120000, 'POINT_CONVERSION', 7001, 'Points created from mock donor payment.', timestamp '2026-03-02 09:05:00'),
    (8002, 4001, 'ALLOCATION_DEBIT', -80000, 'DONATION_ALLOCATION', 9001, 'Donor allocated points to Green Shelter.', timestamp '2026-03-02 10:00:00'),
    (8003, 5001, 'ALLOCATION_CREDIT', 80000, 'DONATION_ALLOCATION', 9001, 'Charity wallet received allocated donor points.', timestamp '2026-03-02 10:00:00'),
    (8004, 5001, 'ORDER_DEBIT', -60000, 'PARTNER_ORDER', 10001, 'Charity spent allocated points on partner goods.', timestamp '2026-03-02 11:00:00');

insert into audit_event (id, actor_user_id, target_type, target_id, action, event_data, created_at) values
    (11001, 101, 'PAYMENT', 6001, 'PAYMENT_RECEIVED', '{"amountKrw":120000}', timestamp '2026-03-02 09:00:00'),
    (11002, 101, 'DONATION_ALLOCATION', 9001, 'ALLOCATION_CREATED', '{"charityId":1001,"allocatedPoints":80000}', timestamp '2026-03-02 10:00:00'),
    (11003, 201, 'PARTNER_ORDER', 10001, 'PARTNER_ORDER_REQUESTED', '{"partnerProductId":2003,"totalPoints":60000}', timestamp '2026-03-02 11:00:00');
